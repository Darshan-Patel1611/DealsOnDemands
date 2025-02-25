let responseCode = require('../../../../utilities/response-error-code');
let database = require('../../../../config/database');

class UserModel {
    getUserById(userid, callback) {
        const query = 'SELECT * FROM tbl_users WHERE id = ? AND is_active = 1 AND is_deleted = 0';
        database.query(query, [userid], (err, results) => {
            if (err) {
                return callback({ code: responseCode.OPERATION_FAILED, message: err.message, data: null }, null);
            }
            if (results.length === 0) {
                return callback({ code: responseCode.NO_DATA_FOUND, message: "User not found", data: null }, null);
            }

            //  Return password for validation
            callback(null, { code: responseCode.SUCCESS, message: "User retrieved successfully", data: results[0] });
        });
    }

    getAllUsers(callback) {
        const query = 'SELECT * FROM tbl_users where is_active = 1 and is_deleted = 0';
        database.query(query, (err, results) => {
            if (err) {
                return callback({ code: responseCode.OPERATION_FAILED, message: err.message, data: null }, null);
            }
            results.forEach(user => {
                delete user.password;
            });
            callback(null, { code: responseCode.SUCCESS, message: "Users retrieved successfully", data: results });
        });
    }

    createUser(userData, callback) {
        const query = 'INSERT INTO tbl_users SET ?';
        database.query(query, userData, (err, results) => {
            if (err) {
                return callback({ code: responseCode.OPERATION_FAILED, message: err.message, data: null }, null);
            }
            callback(null, { code: responseCode.SUCCESS, message: "User created successfully", data: { id: results.insertId } });
        });
    }

    updateUser(userId, userData, callback) {
        const query = 'UPDATE tbl_users SET ? WHERE id = ? and is_active = 1 and is_deleted = 0';
        database.query(query, [userData, userId], (err, results) => {
            if (err) {
                return callback({ code: responseCode.OPERATION_FAILED, message: err.message, data: null }, null);
            }
            callback(null, { code: responseCode.SUCCESS, message: "User updated successfully", data: { affectedRows: results.affectedRows } });
        });
    }

    deleteUser(userId, callback) {
        const query = 'UPDATE tbl_users SET is_active = 0, is_deleted = 1 WHERE id = ?';
        database.query(query, [userId], (err, results) => {
            if (err) {
                return callback({ code: responseCode.OPERATION_FAILED, message: err.message, data: null }, null);
            }
            callback(null, { code: responseCode.SUCCESS, message: "User deleted successfully", data: { affectedRows: results.affectedRows } });
        });
    }

    getUserByEmail(email, callback) {
        const query = 'SELECT * FROM tbl_users WHERE email = ? and is_active = 1 and is_deleted = 0';
        database.query(query, [email], (err, results) => {
            if (err) {
                return callback({ code: responseCode.OPERATION_FAILED, message: err.message, data: null }, null);
            }
            if (results.length === 0) {
                return callback({ code: responseCode.NO_DATA_FOUND, message: "User not found", data: null }, null);
            }
            callback(null, { code: responseCode.SUCCESS, message: "User retrieved successfully", data: results[0] });
        });
    }

    getUserByUsernameOrEmail(username, email, callback) {
        const query = 'SELECT * FROM tbl_users WHERE (username = ? OR email = ?) AND is_active = 1 AND is_deleted = 0 LIMIT 1';
        database.query(query, [username, email], (err, results) => {
            if (err) {
                return callback({ code: responseCode.OPERATION_FAILED, message: err.message, data: null }, null);
            }
            if (results.length > 0) {
                callback(null, { code: responseCode.SUCCESS, message: "User retrieved successfully", data: results[0] });
            } else {
                callback(null, { code: responseCode.NO_DATA_FOUND, message: "User not found", data: null });
            }
        });
    }

    // otp creation
    createVerification(userId, otp, action, verifyWith, token, callback) {
        const query = `
            INSERT INTO tbl_verification 
            (user_id, otp, token, action, verify_with, created_at) 
            VALUES (?, ?, ?, ?, ?, NOW())
        `;

        database.query(query, [userId, otp, token, action, verifyWith], (err, results) => {
            if (err) {
                return callback({
                    code: responseCode.OPERATION_FAILED,
                    message: err.message,
                    data: null
                }, null);
            }

            callback(null, {
                code: responseCode.SUCCESS,
                message: "OTP and token generated successfully",
                data: { verificationId: results.insertId }
            });
        });
    }


    // otp verification
    verifyOtp(userId, otp, action, callback) {
        const query = `
                    SELECT * FROM tbl_verification 
                    WHERE user_id = ? AND otp = ? AND action = ? AND is_active = 1 AND is_deleted = 0 AND created_at >= NOW() - INTERVAL 5 MINUTE`;

        database.query(query, [userId, otp, action], (err, results) => {
            if (err) {
                return callback({
                    code: responseCode.OPERATION_FAILED,
                    message: err.message,
                    data: null
                }, null);
            }

            if (results.length === 0) {
                return callback({
                    code: responseCode.NO_DATA_FOUND,
                    message: "Invalid or expired OTP",
                    data: null
                }, null);
            }

            // Mark OTP as used (soft delete or deactivate)
            const updateQuery = `
                UPDATE tbl_verification 
                SET is_active = 0, deleted_at = NOW() 
                WHERE id = ?`;

            database.query(updateQuery, [results[0].id], (updateErr) => {
                if (updateErr) {
                    return callback({
                        code: responseCode.OPERATION_FAILED,
                        message: updateErr.message,
                        data: null
                    }, null);
                }

                callback(null, {
                    code: responseCode.SUCCESS,
                    message: "OTP verified successfully",
                    data: { userId: userId }
                });
            });
        });
    }

    // add device information
    addDeviceInfo(userId, deviceInfo, callback) {
        const { time_zone, device_type, device_token, os_version, app_version } = deviceInfo;
        const query = `
            INSERT INTO tbl_device 
            (user_id, time_zone, device_type, device_token, os_version, app_version, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        database.query(query, [userId, time_zone, device_type, device_token, os_version, app_version], (err, results) => {
            if (err) {
                return callback({
                    code: responseCode.OPERATION_FAILED,
                    message: err.message,
                    data: null
                }, null);
            }
            callback(null, {
                code: responseCode.SUCCESS,
                message: "Device information added successfully",
                data: { id: results.insertId }
            });
        });
    }

    // edit user profile
    editUserProfile(userId, updatedData, callback) {
        const query = 'UPDATE tbl_users SET ? WHERE id = ? AND is_active = 1 AND is_deleted = 0';

        database.query(query, [updatedData, userId], (err, results) => {
            if (err) {
                return callback({
                    code: responseCode.OPERATION_FAILED,
                    message: err.message,
                    data: null
                }, null);
            }

            if (results.affectedRows === 0) {
                return callback({
                    code: responseCode.NO_DATA_FOUND,
                    message: "User not found or no changes made.",
                    data: null
                }, null);
            }

            callback(null, {
                code: responseCode.SUCCESS,
                message: "User profile updated successfully",
                data: { affectedRows: results.affectedRows }
            });
        });
    }

    //logout user
    logoutUser(userId, callback) {
        const query = `
            UPDATE tbl_users 
            SET is_active = 0, is_deleted = 1 
            WHERE id = ? AND is_active = 1 AND is_deleted = 0
        `;

        database.query(query, [userId], (err, results) => {
            if (err) {
                return callback({
                    code: responseCode.OPERATION_FAILED,
                    message: err.message,
                    data: null
                }, null);
            }

            if (results.affectedRows === 0) {
                return callback({
                    code: responseCode.NO_DATA_FOUND,
                    message: "User not found or already logged out",
                    data: null
                }, null);
            }

            callback(null, {
                code: responseCode.SUCCESS,
                message: "User logged out successfully",
                data: { userId: userId }
            });
        });
    }


    // login user : username or email or mobile and password
    getUserByIdentifier(identifier, callback) {
        const query = `
        SELECT * FROM tbl_users 
        WHERE (username = ? OR email = ? OR mobile = ?) 
        AND is_active = 1 AND is_deleted = 0 LIMIT 1
    `;
        database.query(query, [identifier, identifier, identifier], (err, results) => {
            if (err) {
                return callback({ code: responseCode.OPERATION_FAILED, message: err.message, data: null }, null);
            }
            if (results.length === 0) {
                return callback({ code: responseCode.NO_DATA_FOUND, message: "User not found", data: null }, null);
            }
            callback(null, { code: responseCode.SUCCESS, message: "User retrieved successfully", data: results[0] });
        });
    }


    // update tokan, action and verify while login
    updateTokenActionAndVerify = (userId, token, action, verify_with, callback) => {
        const query = `
            UPDATE tbl_verification 
            SET token = ?, action = ?, verify_with = ?, updated_at = NOW() 
            WHERE user_id = ?
        `;

        database.query(query, [token, action, verify_with, userId], (err, result) => {
            if (err) {
                return callback({
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to update token, action, and verify_with",
                    data: err
                });
            }
            callback(null, {
                code: responseCode.SUCCESS,
                message: "Token, action, and verify_with updated successfully",
                data: result
            });
        });
    };



    updatePassword(userId, hashedPassword, callback) {
        const query = 'UPDATE tbl_users SET password = ?, updated_at = NOW() WHERE id = ? AND is_active = 1 AND is_deleted = 0';

        database.query(query, [hashedPassword, userId], (err, results) => {
            if (err) {
                return callback({
                    code: responseCode.OPERATION_FAILED,
                    message: err.message,
                    data: null
                }, null);
            }

            if (results.affectedRows === 0) {
                return callback({
                    code: responseCode.NO_DATA_FOUND,
                    message: "User not found or not active",
                    data: null
                }, null);
            }

            callback(null, {
                code: responseCode.SUCCESS,
                message: "Password updated successfully",
                data: { affectedRows: results.affectedRows }
            });
        });
    }


    //--------------------- Now Application specific queries function ---------------------//


    //-----------------get categories with deals(page:15 and 19)------------------//
    getCategories = (callback) => {
        const query = `
        SELECT 
            c.id,
            c.category,
            c.image,
            (SELECT COUNT(*) FROM tbl_deal_posts dp WHERE dp.category_id = c.id) AS Total_Deals
        FROM tbl_categories c
        GROUP BY c.id;
    `;

        database.query(query, (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result });
        });
    };

    //---------------- get deals by distance  between the loggin user address and dealer address(page:16)-----------------//
    getDealsByDistance = (userLat, userLong, userId, callback) => {
        const query = `
        SELECT 
    dp.id AS deal_id,
    dp.deal_image, 
    dp.title,
    b.address, 
    b.latitude AS business_lat,
    b.longitude AS business_long,
    dp.created_at, 
    
    u_creator.username AS created_by,
    u_creator.profile_image AS creator_image,

    (SELECT COUNT(*) FROM tbl_deal_comments WHERE deal_id = dp.id) AS total_comments,

    CASE WHEN sp.deal_id IS NOT NULL THEN 1 ELSE 0 END AS is_saved,

    --  Distance Calculation 
    (6371 * ACOS(
        COS(RADIANS(?)) * COS(RADIANS(b.latitude)) *
        COS(RADIANS(b.longitude) - RADIANS(?)) +
        SIN(RADIANS(?)) * SIN(RADIANS(b.latitude))
    )) AS distance

FROM tbl_deal_posts dp

JOIN tbl_business b ON dp.business_id = b.id
JOIN tbl_users u_creator ON dp.user_id = u_creator.id
LEFT JOIN tbl_save_deal_posts sp ON dp.id = sp.deal_id AND sp.user_id = ?

ORDER BY distance ASC, dp.created_at DESC;

        `;

        database.query(query, [userLat, userLong, userLat, userId], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result });
        });
    };

    //---------------- get deal post details by its id(page:18)-------------//
    getDealPostDetails = (dealId, callback) => {
        const query = `
       SELECT 
    dp.deal_image, 
    c.category,
    dp.title,
    dp.description,
    dp.link,
    GROUP_CONCAT(t.tags) AS tags,
    (SELECT COUNT(*) FROM tbl_deal_comments WHERE deal_id = dp.id) AS total_comments,
    u.profile_image,
    u.username,
    dp.created_at,
    ddr.is_rated AS is_rated,
    sdp.is_saved AS is_save,
    u.address
    FROM tbl_deal_posts dp
    JOIN tbl_categories c ON dp.category_id = c.id
    JOIN tbl_tags t ON dp.id = t.deal_id
    JOIN tbl_users u ON dp.user_id = u.id
    LEFT JOIN tbl_save_deal_posts AS sdp ON sdp.deal_id = dp.id
    LEFT JOIN tbl_deal_rating_reviews AS ddr ON ddr.deal_id = dp.id
    WHERE dp.id = ?
    GROUP BY dp.id;
        `;

        database.query(query, [dealId], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result });
        });
    };

    //---------------- get deals by category(page:20)----------------//
    getDealsByCategory = (userId, category, callback) => {
        const query = `
            SELECT 
                c.category,
                u.profile_image,
                u.username,
                dp.deal_image,
                dp.title,
                b.address,
                dp.created_at,
                (SELECT COUNT(*) FROM tbl_deal_comments WHERE deal_id = dp.id) AS total_comments,
                IFNULL(sp.is_saved, 0) AS is_saved,
                IFNULL(dr.is_rated, 0) AS is_rated
            FROM tbl_categories AS c
            JOIN tbl_deal_posts AS dp ON dp.category_id = c.id
            JOIN tbl_users AS u ON dp.user_id = u.id
            JOIN tbl_business AS b ON dp.business_id = b.id
            LEFT JOIN tbl_save_deal_posts sp ON dp.id = sp.deal_id AND sp.user_id = ?
            LEFT JOIN tbl_deal_rating_reviews dr ON dp.id = dr.deal_id AND dr.user_id = ?
            WHERE c.category = ?
            ORDER BY dp.created_at DESC;
        `;

        database.query(query, [userId, userId, category], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result });
        });
    };


    //-------------------- get comments on the deal(Page:22)-------------------//
    commentsOnDeal = (dealId, callback) => {
        const query = `
            SELECT 
                dp.deal_image, 
                dp.title, 
                u.username AS posted_by, 
                dp.created_at AS post_created_time,
                cu.profile_image AS commenter_profile_image,
                dc.created_at AS comment_time,
                dc.comment
            FROM tbl_deal_posts dp
            JOIN tbl_users u ON dp.user_id = u.id
            JOIN tbl_deal_comments dc ON dp.id = dc.deal_id
            JOIN tbl_users cu ON dc.user_id = cu.id
            WHERE dp.id = ?
            ORDER BY dc.created_at;
        `;

        database.query(query, [dealId], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result });
        });
    };

    dealRatingReview = (dealId, rating, review, userId, callback) => {
        const query = `
            INSERT INTO tbl_deal_rating_reviews (rating, review, user_id, deal_id)
            VALUES (?, ?, ?, ?);
        `;

        database.query(query, [rating, review, userId, dealId], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { insertId: result.insertId });
        });
    };

    //----------------- get other user profile information(Page:27)----------------//
    userProfile = (userId, loggedInUserId, callback) => {
        const query = `
            SELECT 
                u.username,
                u.profile_image,
                u.background_image,
                u.bio,
                b.address,
                c.category,
                GROUP_CONCAT(dp.deal_image) AS All_Post,
                COUNT(dp.id) AS Total_Post,
                (SELECT COUNT(*) FROM tbl_follow WHERE following_to = u.id) AS followings,
                (SELECT COUNT(*) FROM tbl_follow WHERE followed_by = u.id) AS followers,
                IFNULL(f.is_follow, 0) AS is_follow
                -- ✅ Follow Flag (1 if following, else 0)
                -- CASE WHEN f.followed_by IS NOT NULL THEN 1 ELSE 0 END AS is_following
            FROM tbl_users AS u
            JOIN tbl_business AS b ON b.user_id = u.id
            JOIN tbl_deal_posts AS dp ON dp.user_id = u.id
            JOIN tbl_categories AS c ON c.id = dp.category_id
            LEFT JOIN tbl_follow AS f ON f.following_to = u.id AND f.followed_by = ?
            WHERE u.id = ?
            GROUP BY u.id;
        `;

        database.query(query, [loggedInUserId, userId], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result[0] });
        });
    };



    //---------------get all the posts(page:35)------------------//
    dealPostsWant = (callback) => {
        const query = `
                        SELECT 
                c.category AS category_name,
                p.title,
                p.created_at,
                p.description,
                (SELECT COUNT(*) FROM tbl_post_comments WHERE deal_id = p.id) AS total_comments,
                u.profile_image,
                u.username
                    FROM tbl_posts p
                    JOIN tbl_categories c ON p.category_id = c.id
                    JOIN tbl_users u ON p.user_id = u.id
                    ORDER BY p.created_at DESC;
        `;

        database.query(query, (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result });
        });
    };


    //--------------- Get All Comments on a Specific Post(page:38) ------------------//
    postComments = (postId, callback) => {
        const query = `
        SELECT 
            p.title AS post_title,
            pu.username AS posted_by,
            p.created_at AS post_created_time,
            u.profile_image,
            u.username,
            pc.created_at AS comment_time,
            pc.comment,
            u.address AS user_location,
            u.latitude,
            u.longitude
        FROM tbl_post_comments pc
        JOIN tbl_users u ON pc.user_id = u.id
        JOIN tbl_posts p ON pc.post_id = p.id
        JOIN tbl_users pu ON p.user_id = pu.id
        WHERE pc.post_id = ?
        ORDER BY pc.created_at;
    `;

        database.query(query, [postId], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result });
        });
    };

    //--------------- Edit User Profile(page:43) ------------------//
    userProfile = (userId, updatedData, callback) => {
        const query = `
        UPDATE tbl_users
        SET 
            profile_image = ?,
            username = ?,
            fname = ?,
            lname = ?,
            email = ?,
            bio = ?
        WHERE id = ?;
    `;

        const values = [
            updatedData.profile_image,
            updatedData.username,
            updatedData.fname,
            updatedData.lname,
            updatedData.email,
            updatedData.bio,
            userId
        ];

        database.query(query, values, (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: "User profile updated successfully." });
        });
    };

    //--------------- Get Favorite Deals by User(page : 49) ------------------//
    favoriteDeals = (userId, callback) => {
        const query = `
        SELECT 
            dp.deal_image, 
            dp.title,
            b.address, 
            dp.created_at, 
            dc.comment, 
            u.username AS commented_by,
            (SELECT COUNT(*) FROM tbl_deal_comments WHERE deal_id = dp.id) AS total_comments,
            IFNULL(sdp.is_saved, 0) AS is_saved,       -- ✅ Is Saved Flag
            IFNULL(dr.is_rated, 0) AS is_rated        -- ✅ Is Rated Flag
        FROM tbl_save_deal_posts sdp
        JOIN tbl_deal_posts dp ON sdp.deal_id = dp.id
        JOIN tbl_business b ON dp.business_id = b.id
        LEFT JOIN tbl_deal_comments dc ON dp.id = dc.deal_id
        LEFT JOIN tbl_users u ON dc.user_id = u.id
        LEFT JOIN tbl_deal_rating_reviews dr ON dp.id = dr.deal_id AND dr.user_id = ?
        WHERE sdp.user_id = ?
        ORDER BY dp.created_at DESC;
    `;

        database.query(query, [userId, userId], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result });
        });
    };

    //--------------- Get Following List(page : 54) ------------------//
    followingList = (userId, callback) => {
        const query = `
        SELECT 
            u.username AS following_username,
            u.profile_image AS following_profile_image,
            f.created_at AS following_at
        FROM tbl_follow f
        JOIN tbl_users u ON f.following_to = u.id
        WHERE f.followed_by = ?
        AND f.status = 'accepted'
        ORDER BY f.created_at DESC;
    `;

        database.query(query, [userId], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result });
        });
    };

    //--------------- Get Followers List(page : 53) ------------------//
    followersList = (userId, callback) => {
        const query = `
        SELECT 
            u.username AS follower_username,
            u.profile_image AS follower_profile_image,
            f.created_at AS followed_at
        FROM tbl_follow f
        JOIN tbl_users u ON f.followed_by = u.id
        WHERE f.following_to = ?
        AND f.status = 'accepted'
        ORDER BY f.created_at DESC;
    `;

        database.query(query, [userId], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result });
        });
    };

    // ✅ Add Business Info using userId
    addBusiness = (businessData, callback) => {
        const { userId, company_name, address, latitude, longitude, category_id, logo } = businessData;

        const query = `
        INSERT INTO tbl_business (user_id, company_name, address, latitude, longitude, category_id, logo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

        database.query(query, [userId, company_name, address, latitude, longitude, category_id, logo], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            callback(null, {
                businessId: result.insertId,
                userId,
                company_name,
                address,
                latitude,
                longitude,
                category_id,
                logo
            });
        });
    };


    // ✅ Edit Business Info using user_id
    editBusiness = (businessData, callback) => {
        const { userId, businessId, company_name, address, latitude, longitude, category_id, logo } = businessData;

        const query = `
        UPDATE tbl_business
        SET company_name = ?, 
            address = ?, 
            latitude = ?, 
            longitude = ?, 
            category_id = ?, 
            logo = ?
        WHERE id = ? AND user_id = ?
    `;

        database.query(query, [company_name, address, latitude, longitude, category_id, logo, businessId, userId], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            if (result.affectedRows === 0) {
                return callback(null, null); // No matching business found for this user
            }

            callback(null, { businessId, userId, company_name, address, latitude, longitude, category_id, logo });
        });
    };

    // ✅ Get Favorite Deal Posts
    favoriteDeals = (userId, callback) => {
        const query = `
            SELECT 
                dp.deal_image, 
                dp.title,
                b.address, 
                dp.created_at, 
                dc.comment, 
                u.username AS commented_by,
                (SELECT COUNT(*) FROM tbl_deal_comments WHERE deal_id = dp.id) AS total_comments,
                IFNULL(sdp.is_saved, 0) AS is_saved
            FROM tbl_save_deal_posts sdp
            JOIN tbl_deal_posts dp ON sdp.deal_id = dp.id
            JOIN tbl_business b ON dp.business_id = b.id
            LEFT JOIN tbl_deal_comments dc ON dp.id = dc.deal_id
            LEFT JOIN tbl_users u ON dc.user_id = u.id
            WHERE sdp.user_id = ?
            ORDER BY dp.created_at DESC;
    `;

        database.query(query, [userId], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    };


    // ✅ Filter Deals by Category and Distance
    filterDeals = ({ userId, category = null, maxDistance = null }, callback) => {
        let query = `
            SELECT 
                c.category AS category_name,
                dp.title,
                dp.description,
                (SELECT COUNT(*) FROM tbl_deal_comments WHERE deal_id = dp.id) AS total_comments,
                u.profile_image,
                u.username,
                b.address AS business_address,
                u.address AS user_address,
                (6371 * ACOS(COS(RADIANS(u.latitude)) * COS(RADIANS(b.latitude)) * COS(RADIANS(b.longitude) - RADIANS(u.longitude)) + SIN(RADIANS(u.latitude)) * SIN(RADIANS(b.latitude)))) AS distance
            FROM tbl_deal_posts dp
            JOIN tbl_categories c ON dp.category_id = c.id
            JOIN tbl_users u ON dp.user_id = u.id
            JOIN tbl_business b ON dp.business_id = b.id
            WHERE u.id = ?
        `;

        let params = [userId];

        // 🔄 Add filters dynamically
        if (category) {
            query += " AND c.category = ?";
            params.push(category);
        }

        if (maxDistance) {
            query += ` AND (6371 * ACOS(COS(RADIANS(u.latitude)) * COS(RADIANS(b.latitude)) 
                        * COS(RADIANS(b.longitude) - RADIANS(u.longitude)) 
                        + SIN(RADIANS(u.latitude)) * SIN(RADIANS(b.latitude)))) <= ?`;
            params.push(maxDistance);
        }

        query += " ORDER BY dp.created_at DESC";

        database.query(query, params, (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, { data: result });
        });
    };

    // delete user account and all related data
    deleteUserAndData = (userId, callback) => {
        const query = `
START TRANSACTION;

    /* Delete contacts */
    DELETE FROM tbl_contacts WHERE user_id = ?;

    /* Delete deal comments by user */
    DELETE FROM tbl_deal_comments WHERE user_id = ?;

    /* Delete deals posted by user */
    DELETE FROM tbl_deal_posts WHERE user_id = ?;

    /* Delete deal ratings */
    DELETE FROM tbl_deal_rating_reviews WHERE user_id = ?;

    /* Delete devices */
    DELETE FROM tbl_device WHERE user_id = ?;

    /* Delete followers/following */
    DELETE FROM tbl_follow WHERE followed_by = '1' OR following_to = ?;

    /* Delete user's posts */
    DELETE FROM tbl_posts WHERE user_id = ?;

    /* Delete post comments */
    DELETE FROM tbl_post_comments WHERE user_id = ?;

    /* Delete premium user info */
    DELETE FROM tbl_premium_users WHERE user_id = ?;

    /* Delete referral coins */
    DELETE FROM tbl_referral_coins WHERE user_id = ?;

    /* Delete reported deals */
    DELETE FROM tbl_report_deals WHERE user_id = ?;

    /* Delete saved deals */
    DELETE FROM tbl_save_deal_posts WHERE user_id = ?;

    /* Delete tags */
    DELETE FROM tbl_tags WHERE user_id = ?;

    /* Delete businesses owned by user */
    DELETE FROM tbl_business WHERE user_id = ?;

    /* Delete verification details */
    DELETE FROM tbl_verification WHERE user_id = ?;

    /* Finally, delete user */
    DELETE FROM tbl_users WHERE id = ?;

COMMIT;

        `;

        const params = new Array(20).fill(userId); // Fills all placeholders with userId

        database.query(query, params, (err, result) => {
            if (err) {
                database.query("ROLLBACK", () => callback(err, null));
            } else {
                callback(null, { message: "User and related data deleted" });
            }
        });
    };



}

module.exports = new UserModel();