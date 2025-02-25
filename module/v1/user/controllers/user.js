const common = require('../../../../utilities/common');
const responseCode = require('../../../../utilities/response-error-code');
const userModel = require('../modals/user-modal');

class User {
    getExample(req, res) {
        var m = {
            code: responseCode.SUCCESS,
            message: "Hello from controller!"
        };
        common.response(res, m);
    }

    getUser(req, res) {
        const userId = req.params.id;
        userModel.getUserById(userId, (err, response) => {
            if (err) {
                return common.response(res, err, 500);
            }
            common.response(res, response);
        });
    }

    getAllUsers(req, res) {
        userModel.getAllUsers((err, response) => {
            if (err) {
                return common.response(res, err, 500);
            }
            common.response(res, response);
        });
    }

    createUser(req, res) {
        const userData = req.body;
        userModel.createUser(userData, (err, response) => {
            if (err) {
                return common.response(res, err, 500);
            }
            common.response(res, response);
        });
    }

    updateUser(req, res) {
        const userId = req.params.id;
        const userData = req.body;

        userModel.updateUser(userId, userData, (err, response) => {
            if (err) {
                return common.response(res, err, 500);
            }
            common.response(res, response);
        });
    }

    deleteUser(req, res) {
        const userId = req.params.id;
        userModel.deleteUser(userId, (err, response) => {
            if (err) {
                return common.response(res, err, 500);
            }
            common.response(res, response);
        });
    }

    // Signup with validation
    signup(req, res) {
        const { username, email, password, mobile, referral_code, login_type, social_id, verifyWith, deviceInfo } = req.body;
        const hashedPassword = common.hashPassword(password);

        // Validate social_id if login_type is Google or Facebook
        if ((login_type === 'google' || login_type === 'facebook') && !social_id) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "social_id is required for Google or Facebook login.",
                data: null
            }, 400);
        }

        userModel.getUserByUsernameOrEmail(username, email, (err, existingUser) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: err.message,
                    data: null
                }, 500);
            }

            if (existingUser && existingUser.data) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Username or email already registered.",
                    data: null
                }, 400);
            }

            const userData = { username, email, password: hashedPassword, mobile, referral_code, login_type, social_id };

            userModel.createUser(userData, (err, result) => {
                if (err) {
                    return common.response(res, err, 500);
                }

                const userId = result.data.id;
                const otp = common.generateOtp(); // Generate OTP
                const token = common.generateToken(); // Generate Token

                // Store OTP and Token in tbl_verification
                userModel.createVerification(userId, otp, 'SignUp', verifyWith, token, (err, otpResult) => {
                    if (err) {
                        return common.response(res, err, 500);
                    }

                    // Store Device Info
                    userModel.addDeviceInfo(userId, deviceInfo, (deviceErr, deviceResult) => {
                        if (deviceErr) {
                            return common.response(res, deviceErr, 500);
                        }

                        delete userData.password; // Remove password from response

                        // Send success response with token
                        common.response(res, {
                            code: responseCode.SUCCESS,
                            message: "User registered successfully. OTP sent.",
                            data: {
                                userData,
                                otp, // In production, send via Email/SMS
                                token, // Send Token
                                verificationId: otpResult.data.verificationId,
                                deviceInfo
                            }
                        });
                    });
                });
            });
        });
    }

    // Login
    login(req, res) {
        const { identifier, password, action, verify_with } = req.body;  // ✅ Get action & verify_with from req.body
        const hashedPassword = common.hashPassword(password);

        // ✅ Validate verify_with
        if (!['E', 'M'].includes(verify_with)) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "Invalid verify_with value. Use 'E' for Email or 'M' for Mobile.",
                data: null
            }, 400);
        }

        userModel.getUserByIdentifier(identifier, (err, user) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: err.message,
                    data: null
                }, 500);
            }
            if (!user || !user.data) {
                return common.response(res, { code: responseCode.NO_DATA_FOUND, message: "User not found", data: null }, 404);
            }
            if (user.data.password !== hashedPassword) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Invalid credentials",
                    data: null
                }, 401);
            }

            // ✅ Generate custom token
            const token = common.generateToken();

            // ✅ Validate action
            if (!action) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Action is required.",
                    data: null
                }, 400);
            }

            // ✅ Update token, action & verify_with in tbl_verification
            userModel.updateTokenActionAndVerify(user.data.id, token, action, verify_with, (updateErr) => {
                if (updateErr) {
                    return common.response(res, updateErr, 500);
                }

                common.response(res, {
                    code: responseCode.SUCCESS,
                    message: "Login successful",
                    data: {
                        token,
                        action,
                        verify_with,
                        user: {
                            id: user.data.id,
                            username: user.data.username,
                            email: user.data.email,
                            mobile: user.data.mobile
                        }
                    }
                });
            });
        });
    }



    //varify otp
    verifyOtp(req, res) {
        const { userId, otp, action } = req.body;

        // Validate required fields
        if (!userId || !otp || !action) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "userId, otp, and action are required.",
                data: null
            }, 400);
        }

        userModel.verifyOtp(userId, otp, action, (err, result) => {
            if (err) {
                return common.response(res, err, 400);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "OTP verified successfully",
                data: result.data
            });
        });
    }

    // Resend OTP
    resendOtp(req, res) {
        const { userId, action, verifyWith } = req.body;

        // Validate required fields
        if (!userId || !action || !verifyWith) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "userId, action, and verifyWith are required.",
                data: null
            }, 400);
        }

        // Generate new OTP
        const otp = common.generateOtp();

        // Create new verification entry
        userModel.createVerification(userId, otp, action, verifyWith, (err, otpResult) => {
            if (err) {
                return common.response(res, err, 500);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "OTP resent successfully.",
                data: {
                    userId,
                    otp, // In production, send via Email/SMS
                    verificationId: otpResult.data.verificationId
                }
            });
        });
    }

    // addDeviceInfo(req, res) {
    //     const { userId, deviceInfo } = req.body;

    //     // Validate required fields
    //     if (!userId || !deviceInfo) {
    //         return common.response(res, {
    //             code: responseCode.OPERATION_FAILED,
    //             message: "userId and deviceInfo are required.",
    //             data: null
    //         }, 400);
    //     }

    //     // Ensure deviceInfo contains all necessary fields
    //     const { time_zone, device_type, device_token, os_version, app_version } = deviceInfo;
    //     if (!time_zone || !device_type || !device_token || !os_version || !app_version) {
    //         return common.response(res, {
    //             code: responseCode.OPERATION_FAILED,
    //             message: "All device information fields are required.",
    //             data: null
    //         }, 400);
    //     }

    //     userModel.addDeviceInfo(userId, deviceInfo, (err, result) => {
    //         if (err) {
    //             return common.response(res, err, 500);
    //         }

    //         common.response(res, {
    //             code: responseCode.SUCCESS,
    //             message: "Device information added successfully.",
    //             data: result.data
    //         });
    //     });
    // }

    editUserProfile(req, res) {
        const userId = req.params.id;
        const { fname, lname, bio, profile_image } = req.body;

        // Validate required fields
        if (!userId || (!fname && !lname && !bio && !profile_image)) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "No data provided to update.",
                data: null
            }, 400);
        }

        const updatedData = { fname, lname, bio, profile_image };

        userModel.editUserProfile(userId, updatedData, (err, response) => {
            if (err) {
                return common.response(res, err, 500);
            }
            common.response(res, {
                code: responseCode.SUCCESS,
                message: "User profile updated successfully",
                data: response.data
            });
        });
    }

    // logout user
    logout(req, res) {
        const userId = req.params.id;

        // Validate userId
        if (!userId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "userId is required.",
                data: null
            }, 400);
        }

        userModel.logoutUser(userId, (err, response) => {
            if (err) {
                return common.response(res, err, 500);
            }
            common.response(res, response);
        });
    }

    // Change Password
    changePassword(req, res) {
        const userId = req.params.id; // Fetch userId from URL parameters
        const { currentPassword, newPassword, reEnterNewPassword } = req.body;

        // Check for required fields
        if (!userId || !currentPassword || !newPassword || !reEnterNewPassword) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "userId, currentPassword, newPassword, and reEnterNewPassword are required.",
                data: null
            }, 400);
        }

        // Check if newPassword and reEnterNewPassword match
        if (newPassword !== reEnterNewPassword) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "New password and re-entered password do not match.",
                data: null
            }, 400);
        }

        userModel.getUserById(userId, (err, user) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: err.message,
                    data: null
                }, 500);
            }

            if (!user || !user.data) {
                return common.response(res, {
                    code: responseCode.NO_DATA_FOUND,
                    message: "User not found",
                    data: null
                }, 404);
            }

            const hashedCurrentPassword = common.hashPassword(currentPassword);
            const hashedNewPassword = common.hashPassword(newPassword);

            // Check if current password is correct
            if (user.data.password !== hashedCurrentPassword) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Current password is incorrect.",
                    data: null
                }, 400);
            }
            delete user.data.password;
            // Check if new password is the same as current password
            if (hashedCurrentPassword === hashedNewPassword) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "New password cannot be the same as the current password.",
                    data: null
                }, 400);
            }

            // Update Password
            userModel.updatePassword(user.data.id, hashedNewPassword, (updateErr) => {
                if (updateErr) {
                    return common.response(res, updateErr, 500);
                }

                common.response(res, {
                    code: responseCode.SUCCESS,
                    message: "Password updated successfully.",
                    data: null
                });
            });
        });
    }


    // Forgot Password
    forgotPassword(req, res) {
        const { identifier, newPassword } = req.body; // identifier can be username or email

        if (!identifier || !newPassword) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "identifier and newPassword are required.",
                data: null
            }, 400);
        }

        userModel.getUserByIdentifier(identifier, (err, user) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: err.message,
                    data: null
                }, 500);
            }
            if (!user || !user.data) {
                return common.response(res, { code: responseCode.NO_DATA_FOUND, message: "User not found", data: null }, 404);
            }

            const hashedPassword = common.hashPassword(newPassword);

            userModel.updatePassword(user.data.id, hashedPassword, (updateErr) => {
                if (updateErr) {
                    return common.response(res, updateErr, 500);
                }

                common.response(res, {
                    code: responseCode.SUCCESS,
                    message: "Password updated successfully.",
                    data: null
                });
            });
        });
    }

    //------------------------ now application function controller ------------------------------//

    //----------------- get deals categories------------------(page:15 and 19)//
    getCategories(req, res) {
        userModel.getCategories((err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch categories.",
                    data: null
                }, 500);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "Categories fetched successfully.",
                data: response.data
            });
        });
    }

    //---------------- get deals by distance between the loggin user address and dealer address(page:16)-----------------//
    getDealsByDistance = (req, res) => {
        const { userId, userLat, userLong } = req.query;

        // ✅ Validation
        if (!userId || !userLat || !userLong) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "userId, userLat, and userLong are required.",
                data: null
            }, 400);
        }

        // 🔥 Calling Model
        userModel.getDealsByDistance(userLat, userLong, userId, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: code.OPERATION_FAILED,
                    message: "Failed to fetch deals.",
                    data: err
                }, 500);
            }
            common.response(res, {
                code: responseCode.SUCCESS,
                message: "Deals fetched successfully.",
                data: response.data
            });
        });
    };

    //---------------- get deal post details by its id(page:18)-------------//
    getDealPostDetails = (req, res) => {
        const { dealId } = req.params; // Using req.params as per the standard

        // ✅ Validation
        if (!dealId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "dealId is required.",
                data: null
            }, 400);
        }

        // 🔥 Calling Model
        userModel.getDealPostDetails(dealId, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch deal post details.",
                    data: err
                }, 500);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "Deal post details fetched successfully.",
                data: response.data[0]
            });
        });
    };

    //---------------- get deals by category(page:20)----------------//
    getDealsByCategory = (req, res) => {
        const { userId, category } = req.params;

        // ✅ Validation
        if (!userId || !category) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "userId and category are required.",
                data: null
            }, 400);
        }

        // 🔥 Calling Model
        userModel.getDealsByCategory(userId, category, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch deals by category.",
                    data: err
                }, 500);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "Deals fetched successfully.",
                data: response.data
            });
        });
    };


    //-------------------- get comments on the deal(Page:22)-------------------//
    commentsOnDeal = (req, res) => {
        const { dealId } = req.params;

        // ✅ Validation
        if (!dealId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "dealId is required.",
                data: null
            }, 400);
        }

        // 🔥 Calling Model
        userModel.commentsOnDeal(dealId, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch comments.",
                    data: err
                }, 500);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "Comments fetched successfully.",
                data: response.data
            });
        });
    };

    dealRatingReview = (req, res) => {
        const { dealId } = req.params;
        const { rating, review, userId } = req.body;

        // ✅ Validation
        if (!dealId || !rating || !review || !userId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "dealId, rating, review, and userId are required.",
                data: null
            }, 400);
        }

        // 🔥 Calling Model
        userModel.dealRatingReview(dealId, rating, review, userId, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to post rating and review.",
                    data: err
                }, 500);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "Rating and review posted successfully.",
                data: { dealId, rating, review, userId }
            });
        });
    };





    //----------------- get other user profile information(Page:27)----------------//
    userProfile = (req, res) => {
        const { userId } = req.params;        // 📌 Target User ID from params
        const { loggedInUserId } = req.body;  // 📌 Logged-in User ID from body

        // ✅ Validation
        if (!userId || !loggedInUserId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "userId and loggedInUserId are required.",
                data: null
            }, 400);
        }

        // 🔥 Call Model
        userModel.userProfile(userId, loggedInUserId, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch user profile.",
                    data: err
                }, 500);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "User profile fetched successfully.",
                data: response.data
            });
        });
    };


    //---------------get all the posts(page:35)------------------//
    dealPostsWant = (req, res) => {


        // 🔥 Call Model
        userModel.dealPostsWant((err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch posts.",
                    data: err
                }, 500);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "Posts fetched successfully.",
                data: response.data
            });
        });
    };


    //--------------- Get All Comments on a Specific Post (page:38)------------------//
    postComments = (req, res) => {
        const { postId } = req.params;  // 📌 Post ID from params

        // ✅ Validation
        if (!postId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "postId is required.",
                data: null
            }, 400);
        }

        // 🔥 Call Model
        userModel.postComments(postId, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch comments.",
                    data: err
                }, 500);
            }

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: "Comments fetched successfully.",
                data: response.data
            });
        });
    };


    //--------------- Edit User Profile(page:43) ------------------//
    userProfile = (req, res) => {
        const { userId } = req.params;  // 📌 User ID from params
        const { profile_image, username, fname, lname, email, mobile, bio } = req.body;

        // ✅ Validation
        if (!userId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "User ID is required.",
                data: null
            }, 400);
        }

        if (mobile) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "You are not allowed to edit the mobile number.",
                data: null
            }, 400);
        }

        const updatedData = { profile_image, username, fname, lname, email, bio };

        // 🔥 Call Model
        userModel.userProfile(userId, updatedData, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to update profile.",
                    data: err
                }, 500);
            }

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: "Profile updated successfully.",
                data: response.data
            });
        });
    };

    //--------------- Get Favorite Deals by User(page : 49) ------------------//
    favoriteDeals = (req, res) => {
        const { userId } = req.params;  // 📌 User ID from params

        // ✅ Validation
        if (!userId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "User ID is required.",
                data: null
            }, 400);
        }

        // 🔥 Call Model
        userModel.favoriteDeals(userId, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch favorite deals.",
                    data: err
                }, 500);
            }

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: "Favorite deals fetched successfully.",
                data: response.data
            });
        });
    };

    //--------------- Get Following List(page : 54) ------------------//
    followingList = (req, res) => {
        const { userId } = req.params;

        if (!userId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "User ID is required.",
                data: null
            }, 400);
        }

        userModel.followingList(userId, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch following list.",
                    data: err
                }, 500);
            }

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: "Following list fetched successfully.",
                data: response.data
            });
        });
    };

    //--------------- Get Followers List(page : 53) ------------------//
    followersList = (req, res) => {
        const { userId } = req.params;

        if (!userId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "User ID is required.",
                data: null
            }, 400);
        }

        userModel.followersList(userId, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch followers list.",
                    data: err
                }, 500);
            }

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: "Followers list fetched successfully.",
                data: response.data
            });
        });
    };



    // ✅ Add Business Info using userId
    addBusiness = (req, res) => {
        const { userId } = req.params;
        const { company_name, address, latitude, longitude, category_id, logo } = req.body;

        // ✅ Validation
        if (!userId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "userId is required.",
                data: null
            }, 400);
        }

        if (!company_name || !address || !category_id || !logo) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "company_name, address, category_id, and logo are required.",
                data: null
            }, 400);
        }

        // 🔥 Call Model
        userModel.addBusiness({ userId, company_name, address, latitude, longitude, category_id, logo }, (err, result) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to add business.",
                    data: err
                }, 500);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "Business added successfully.",
                data: result
            });
        });
    };




    // ✅ Edit Business Info using user_id
    editBusiness = (req, res) => {
        const { userId, businessId } = req.params;
        const { company_name, address, latitude, longitude, category_id, logo } = req.body;

        // ✅ Validation
        if (!userId || !businessId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "userId and businessId are required.",
                data: null
            }, 400);
        }

        if (!company_name || !address || !category_id || !logo) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "company_name, address, category_id, and logo are required.",
                data: null
            }, 400);
        }

        // 🔥 Call Model
        userModel.editBusiness({ userId, businessId, company_name, address, latitude, longitude, category_id, logo }, (err, result) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to update business info.",
                    data: err
                }, 500);
            }

            if (!result) {
                return common.response(res, {
                    code: responseCode.NO_DATA_FOUND,
                    message: "No matching business found for this user.",
                    data: null
                }, 404);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "Business information updated successfully.",
                data: result
            });
        });
    };



    // ✅ Get Favorite Deal Posts
    favoriteDeals = (req, res) => {
        const { userId } = req.params;

        // ✅ Validation
        if (!userId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "userId is required.",
                data: null
            }, 400);
        }

        // 🔥 Call Model
        userModel.favoriteDeals(userId, (err, result) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch favorite deals.",
                    data: err
                }, 500);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "Favorite deals fetched successfully.",
                data: result
            });
        });
    };

    // ✅ Filter Deals by Category and Distance
    filterDeals = (req, res) => {
        const { userId, category, maxDistance } = req.body;

        // ✅ Validation
        if (!userId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "userId is required.",
                data: null
            }, 400);
        }

        // 🔥 Call Model
        userModel.filterDeals({ userId, category, maxDistance }, (err, response) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to fetch deals.",
                    data: err
                }, 500);
            }

            common.response(res, {
                code: responseCode.SUCCESS,
                message: "Filtered deals fetched successfully.",
                data: response.data
            });
        });
    };

    deleteUserAccount = (req, res) => {
        const userId = req.params.userId;

        if (!userId) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: "User ID is required.",
                data: null
            }, 400);
        }

        userModel.deleteUserAndData(userId, (err, result) => {
            if (err) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Failed to delete user.",
                    data: err
                }, 500);
            }

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: "User account and all related data deleted successfully.",
                data: null
            });
        });
    };

}

module.exports = new User();