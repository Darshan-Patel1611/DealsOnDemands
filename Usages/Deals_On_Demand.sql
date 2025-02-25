CREATE DATABASE Deals_On_Demand;

USE Deals_On_Demand;

-- DROP DATABASE Deals_On_Demand;
CREATE TABLE tbl_users (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    mobile VARCHAR(16) not null,
    referral_code VARCHAR(6) DEFAULT NULL, 
    fname VARCHAR(64),
    lname VARCHAR(64),
    bio TEXT,
    profile_image VARCHAR(128) DEFAULT 'profile.jpg',
    background_image VARCHAR(128) DEFAULT 'background.jpg',
    address TEXT,
    latitude VARCHAR(16),
    longitude VARCHAR(16),
    login_type ENUM('simple', 'facebook', 'google') DEFAULT 'simple',
    social_id VARCHAR(128),
    is_active TINYINT DEFAULT 1,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);


CREATE TABLE tbl_categories (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(64) not null,
    image VARCHAR(128) DEFAULT 'category.jpg',
    is_active TINYINT NOT NULL DEFAULT '1',
    is_deleted TINYINT NOT NULL DEFAULT '0',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE tbl_premium_plans ( 
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    plan_name VARCHAR(32) NOT NULL,
    price INT(20) NOT NULL,
    duration VARCHAR(32) NOT NULL,
    information VARCHAR(128),
    is_active TINYINT NOT NULL DEFAULT '1',
    is_deleted TINYINT NOT NULL DEFAULT '0',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE tbl_business (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    company_name VARCHAR(64) NOT NULL,
    address VARCHAR(64) NOT NULL,
    latitude VARCHAR(64),
    longitude VARCHAR(64),
    category_id BIGINT(20) NOT NULL,
    logo VARCHAR(128) DEFAULT 'logo.jpg',
    is_active TINYINT NOT NULL DEFAULT '1',
    is_deleted TINYINT NOT NULL DEFAULT '0',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES tbl_categories(id) ON DELETE CASCADE
);

CREATE TABLE tbl_deal_posts (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    business_id BIGINT(20) NOT NULL,
    deal_image VARCHAR(128) DEFAULT 'dealpost.jpg',
    category_id BIGINT(20) NOT NULL,
    title VARCHAR(64) NOT NULL,
    description VARCHAR(64) NOT NULL,
    link VARCHAR(128),
    is_active TINYINT NOT NULL DEFAULT '1',
    is_deleted TINYINT NOT NULL DEFAULT '0',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES tbl_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES tbl_business(id) ON DELETE CASCADE
);

CREATE TABLE tbl_tags (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    deal_id BIGINT(20) NOT NULL,
    tags VARCHAR(32) NOT NULL,
    is_active TINYINT DEFAULT 1,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id),
    FOREIGN KEY (deal_id) REFERENCES tbl_deal_posts(id)
);

CREATE TABLE tbl_verification (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    action ENUM('SignUp', 'Login', 'Forget') NOT NULL,
    verify_with ENUM('E', 'M'), 
    user_id BIGINT(20) NOT NULL,
    otp INT(10) NOT NULL,
    is_active TINYINT NOT NULL DEFAULT '1',
    is_deleted TINYINT NOT NULL DEFAULT '0',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
	FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);

CREATE TABLE tbl_follow (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    following_to BIGINT(20) NOT NULL,
    followed_by BIGINT(20) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected'),
    is_active TINYINT DEFAULT 1,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (following_to) REFERENCES tbl_users(id),
    FOREIGN KEY (followed_by) REFERENCES tbl_users(id)
);

CREATE TABLE tbl_posts (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    title VARCHAR(128) NOT NULL,
    category_id BIGINT(20) NOT NULL,
    description TEXT NOT NULL, 
    is_active TINYINT DEFAULT 1,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id),
    FOREIGN KEY (category_id) REFERENCES tbl_categories(id)
);

CREATE TABLE tbl_post_comments (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    post_id BIGINT(20) NOT NULL,
    deal_id BIGINT(20) NOT NULL,
    comment TEXT NOT NULL,
    is_active TINYINT DEFAULT 1,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id),
    FOREIGN KEY (post_id) REFERENCES tbl_posts(id),
    FOREIGN KEY (deal_id) REFERENCES tbl_deal_posts(id)
);

CREATE TABLE tbl_save_deal_posts (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    deal_id BIGINT(20) NOT NULL,
    is_active TINYINT DEFAULT 1,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (deal_id) REFERENCES tbl_deal_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);

CREATE TABLE tbl_report_deals (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    deal_id BIGINT(20) NOT NULL,
    report ENUM('Inappropriate photos', 'Inappropriate and abusive content', 'Feels like spam', 'Other'),
    feedback TEXT,
    is_active TINYINT DEFAULT 1,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id),
    FOREIGN KEY (deal_id) REFERENCES tbl_deal_posts(id)
);

CREATE TABLE tbl_deal_comments (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    comment VARCHAR(64) NOT NULL,
    user_id BIGINT(20) NOT NULL,
    deal_id BIGINT(20) NOT NULL,
    is_active TINYINT NOT NULL DEFAULT '1',
    is_deleted TINYINT NOT NULL DEFAULT '0',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES tbl_deal_posts(id) ON DELETE CASCADE
);

CREATE TABLE tbl_deal_rating_reviews (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    rating FLOAT(5,1) NOT NULL,
    review VARCHAR(32) NOT NULL,
    user_id BIGINT(20) NOT NULL,
    deal_id BIGINT(20) NOT NULL,
    is_active TINYINT NOT NULL DEFAULT '1',
    is_deleted TINYINT NOT NULL DEFAULT '0',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE,
    FOREIGN KEY (deal_id) REFERENCES tbl_deal_posts(id) ON DELETE CASCADE
);

CREATE TABLE tbl_premium_users (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL,
    premium_plan_id BIGINT(20) NOT NULL, 
    is_subscribed ENUM('Yes', 'No') DEFAULT 'No',
    started_at DATETIME,
    expire_at DATETIME,
    is_active TINYINT DEFAULT 1,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id),
    FOREIGN KEY (premium_plan_id) REFERENCES tbl_premium_plans(id)
);

CREATE TABLE tbl_referrals (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    referred_to BIGINT(20) NOT NULL,
    referred_by BIGINT(20) NOT NULL, 
    status ENUM('pending', 'accepted', 'rejected'),
    is_active TINYINT DEFAULT 1,
    is_deleted TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (referred_to) REFERENCES tbl_users(id),
    FOREIGN KEY (referred_by) REFERENCES tbl_users(id)
);

CREATE TABLE tbl_contacts (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(64) NOT NULL,
    email VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    user_id BIGINT(20) NOT NULL,
    is_active TINYINT NOT NULL DEFAULT '1',
    is_deleted TINYINT NOT NULL DEFAULT '0',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id) ON DELETE CASCADE
);

CREATE TABLE tbl_referral_coins (
    id BIGINT(20) PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT(20) NOT NULL, 
    referred_by BIGINT(20) NOT NULL, 
    coins INT(11) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_users(id),
    FOREIGN KEY (referred_by) REFERENCES tbl_users(id)
);



-- Create indexes on tbl_users
CREATE INDEX idx_users_username ON tbl_users(username);
CREATE INDEX idx_users_email ON tbl_users(email);
CREATE INDEX idx_users_referral_code ON tbl_users(referral_code);

-- Create indexes on tbl_categories
CREATE INDEX idx_categories_category ON tbl_categories(category);

-- Create indexes on tbl_premium_plans
CREATE INDEX idx_premium_plans_plan_name ON tbl_premium_plans(plan_name);

-- Create indexes on tbl_business
CREATE INDEX idx_business_user_id ON tbl_business(user_id);
CREATE INDEX idx_business_category_id ON tbl_business(category_id);

-- Create indexes on tbl_deal_posts
CREATE INDEX idx_deal_posts_user_id ON tbl_deal_posts(user_id);
CREATE INDEX idx_deal_posts_business_id ON tbl_deal_posts(business_id);
CREATE INDEX idx_deal_posts_category_id ON tbl_deal_posts(category_id);

-- Create indexes on tbl_tags
CREATE INDEX idx_tags_user_id ON tbl_tags(user_id);
CREATE INDEX idx_tags_deal_id ON tbl_tags(deal_id);

-- Create indexes on tbl_verification
CREATE INDEX idx_verification_user_id ON tbl_verification(user_id);

-- Create indexes on tbl_follow
CREATE INDEX idx_follow_following_to ON tbl_follow(following_to);
CREATE INDEX idx_follow_followed_by ON tbl_follow(followed_by);

-- Create indexes on tbl_posts
CREATE INDEX idx_posts_user_id ON tbl_posts(user_id);
CREATE INDEX idx_posts_category_id ON tbl_posts(category_id);

-- Create indexes on tbl_post_comments
CREATE INDEX idx_post_comments_user_id ON tbl_post_comments(user_id);
CREATE INDEX idx_post_comments_post_id ON tbl_post_comments(post_id);
CREATE INDEX idx_post_comments_deal_id ON tbl_post_comments(deal_id);

-- Create indexes on tbl_save_deal_posts
CREATE INDEX idx_save_deal_posts_user_id ON tbl_save_deal_posts(user_id);
CREATE INDEX idx_save_deal_posts_deal_id ON tbl_save_deal_posts(deal_id);

-- Create indexes on tbl_report_deals
CREATE INDEX idx_report_deals_user_id ON tbl_report_deals(user_id);
CREATE INDEX idx_report_deals_deal_id ON tbl_report_deals(deal_id);

-- Create indexes on tbl_deal_comments
CREATE INDEX idx_deal_comments_user_id ON tbl_deal_comments(user_id);
CREATE INDEX idx_deal_comments_deal_id ON tbl_deal_comments(deal_id);

-- Create indexes on tbl_deal_rating_reviews
CREATE INDEX idx_deal_rating_reviews_user_id ON tbl_deal_rating_reviews(user_id);
CREATE INDEX idx_deal_rating_reviews_deal_id ON tbl_deal_rating_reviews(deal_id);

-- Create indexes on tbl_premium_users
CREATE INDEX idx_premium_users_user_id ON tbl_premium_users(user_id);
CREATE INDEX idx_premium_users_premium_plan_id ON tbl_premium_users(premium_plan_id);

-- Create indexes on tbl_contacts
CREATE INDEX idx_contacts_user_id ON tbl_contacts(user_id);

-- Create indexes on tbl_referral_coins
CREATE INDEX idx_referral_coins_user_id ON tbl_referral_coins(user_id);
CREATE INDEX idx_referral_coins_referred_by ON tbl_referral_coins(referred_by);

SHOW INDEX FROM tbl_users;

-- Dummy Data for tbl_users
INSERT INTO tbl_users (username, email, password, mobile, referral_code, fname, lname, bio, profile_image, background_image, address, latitude, longitude, login_type, social_id)
VALUES
('user1', 'user1@example.com', 'password1', '1234567890', 'REF001', 'John', 'Doe', 'Bio of user1', 'profile1.jpg', 'background1.jpg', 'Address 1', '12.3456', '65.4321', 'simple', NULL),
('user2', 'user2@example.com', 'password2', '1234567891', 'REF002', 'Jane', 'Smith', 'Bio of user2', 'profile2.jpg', 'background2.jpg', 'Address 2', '12.3457', '65.4322', 'facebook', 'FB123'),
('user3', 'user3@example.com', 'password3', '1234567892', 'REF003', 'Alice', 'Johnson', 'Bio of user3', 'profile3.jpg', 'background3.jpg', 'Address 3', '12.3458', '65.4323', 'google', 'GOOGLE123'),
('user4', 'user4@example.com', 'password4', '1234567893', 'REF004', 'Bob', 'Brown', 'Bio of user4', 'profile4.jpg', 'background4.jpg', 'Address 4', '12.3459', '65.4324', 'simple', NULL),
('user5', 'user5@example.com', 'password5', '1234567894', 'REF005', 'Charlie', 'Davis', 'Bio of user5', 'profile5.jpg', 'background5.jpg', 'Address 5', '12.3460', '65.4325', 'facebook', 'FB456'),
('user6', 'user6@example.com', 'password6', '1234567895', 'REF006', 'David', 'Wilson', 'Bio of user6', 'profile6.jpg', 'background6.jpg', 'Address 6', '12.3461', '65.4326', 'google', 'GOOGLE456'),
('user7', 'user7@example.com', 'password7', '1234567896', 'REF007', 'Eva', 'Garcia', 'Bio of user7', 'profile7.jpg', 'background7.jpg', 'Address 7', '12.3462', '65.4327', 'simple', NULL),
('user8', 'user8@example.com', 'password8', '1234567897', 'REF008', 'Frank', 'Martinez', 'Bio of user8', 'profile8.jpg', 'background8.jpg', 'Address 8', '12.3463', '65.4328', 'facebook', 'FB789'),
('user9', 'user9@example.com', 'password9', '1234567898', 'REF009', 'Grace', 'Hernandez', 'Bio of user9', 'profile9.jpg', 'background9.jpg', 'Address 9', '12.3464', '65.4329', 'google', 'GOOGLE789'),
('user10', 'user10@example.com', 'password10', '1234567899', 'REF010', 'Henry', 'Lopez', 'Bio of user10', 'profile10.jpg', 'background10.jpg', 'Address 10', '12.3465', '65.4330', 'simple', NULL);


-- Dummy Data for tbl_categories
INSERT INTO tbl_categories (category, image)
VALUES
('Food', 'food.jpg'),
('Electronics', 'electronics.jpg'),
('Clothing', 'clothing.jpg'),
('Home & Garden', 'home_garden.jpg'),
('Health & Beauty', 'health_beauty.jpg'),
('Sports', 'sports.jpg'),
('Toys', 'toys.jpg'),
('Automotive', 'automotive.jpg'),
('Books', 'books.jpg'),
('Music', 'music.jpg');


-- Dummy Data for tbl_premium_plans
INSERT INTO tbl_premium_plans (plan_name, price, duration, information)
VALUES
('Basic Plan', 10, '1 Month', 'Basic features'),
('Standard Plan', 20, '3 Months', 'Standard features'),
('Premium Plan', 30, '6 Months', 'Premium features'),
('Gold Plan', 50, '1 Year', 'Gold features'),
('Silver Plan', 25, '6 Months', 'Silver features'),
('Platinum Plan', 100, '1 Year', 'Platinum features'),
('Trial Plan', 0, '1 Week', 'Free trial'),
('Family Plan', 40, '3 Months', 'Family features'),
('Student Plan', 15, '1 Month', 'Student discount'),
('Corporate Plan', 200, '1 Year', 'Corporate features');


-- Dummy Data for tbl_business
INSERT INTO tbl_business (user_id, company_name, address, latitude, longitude, category_id, logo)
VALUES
(1, 'Business One', '123 Business St', '12.3456', '65.4321', 1, 'logo1.jpg'),
(2, 'Business Two', '456 Business Ave', '12.3457', '65.4322', 2, 'logo2.jpg'),
(3, 'Business Three', '789 Business Blvd', '12.3458', '65.4323', 3, 'logo3.jpg'),
(4, 'Business Four', '101 Business Rd', '12.3459', '65.4324', 4, 'logo4.jpg'),
(5, 'Business Five', '202 Business Ct', '12.3460', '65.4325', 5, 'logo5.jpg'),
(6, 'Business Six', '303 Business Pl', '12.3461', '65.4326', 6, 'logo6.jpg'),
(7, 'Business Seven', '404 Business Way', '12.3462', '65.4327', 7, 'logo7.jpg'),
(8, 'Business Eight', '505 Business Dr', '12.3463', '65.4328', 8, 'logo8.jpg'),
(9, 'Business Nine', '606 Business Ln', '12.3464', '65.4329', 9, 'logo9.jpg'),
(10, 'Business Ten', '707 Business Cir', '12.3465', '65.4330', 10, 'logo10.jpg');


-- Dummy Data for tbl_deal_posts
INSERT INTO tbl_deal_posts (user_id, business_id, deal_image, category_id, title, description, link)
VALUES
(1, 1, 'deal1.jpg', 1, 'Deal One', 'Description for deal one', 'http://deal1.com'),
(2, 2, 'deal2.jpg', 2, 'Deal Two', 'Description for deal two', 'http://deal2.com'),
(3, 3, 'deal3.jpg', 3, 'Deal Three', 'Description for deal three', 'http://deal3.com'),
(4, 4, 'deal4.jpg', 4, 'Deal Four', 'Description for deal four', 'http://deal4.com'),
(5, 5, 'deal5.jpg', 5, 'Deal Five', 'Description for deal five', 'http://deal5.com'),
(6, 6, 'deal6.jpg', 6, 'Deal Six', 'Description for deal six', 'http://deal6.com'),
(7, 7, 'deal7.jpg', 7, 'Deal Seven', 'Description for deal seven', 'http://deal7.com'),
(8, 8, 'deal8.jpg', 8, 'Deal Eight', 'Description for deal eight', 'http://deal8.com'),
(9, 9, 'deal9.jpg', 9, 'Deal Nine', 'Description for deal nine', 'http://deal9.com'),
(10, 10, 'deal10.jpg', 10, 'Deal Ten', 'Description for deal ten', 'http://deal10.com');


-- Dummy Data for tbl_tags
INSERT INTO tbl_tags (user_id, deal_id, tags)
VALUES
(1, 1, 'tag1'),
(2, 2, 'tag2'),
(3, 3, 'tag3'),
(4, 4, 'tag4'),
(5, 5, 'tag5'),
(6, 6, 'tag6'),
(7, 7, 'tag7'),
(8, 8, 'tag8'),
(9, 9, 'tag9'),
(10, 10, 'tag10');


-- Dummy Data for tbl_verification
INSERT INTO tbl_verification (action, verify_with, user_id, otp)
VALUES
('SignUp', 'E', 1, 123456),
('Login', 'M', 2, 654321),
('Forget', 'E', 3, 111111),
('SignUp', 'M', 4, 222222),
('Login', 'E', 5, 333333),
('Forget', 'M', 6, 444444),
('SignUp', 'E', 7, 555555),
('Login', 'M', 8, 666666),
('Forget', 'E', 9, 777777),
('SignUp', 'M', 10, 888888);


-- Dummy Data for tbl_follow
INSERT INTO tbl_follow (following_to, followed_by, status)
VALUES
(1, 2, 'accepted'),
(2, 3, 'pending'),
(3, 4, 'accepted'),
(4, 5, 'rejected'),
(5, 6, 'accepted'),
(6, 7, 'pending'),
(7, 8, 'accepted'),
(8, 9, 'rejected'),
(9, 10, 'accepted'),
(10, 1, 'pending');


-- Dummy Data for tbl_posts
INSERT INTO tbl_posts (user_id, title, category_id, description)
VALUES
(1, 'Post One', 1, 'Description for post one'),
(2, 'Post Two', 2, 'Description for post two'),
(3, 'Post Three', 3, 'Description for post three'),
(4, 'Post Four', 4, 'Description for post four'),
(5, 'Post Five', 5, 'Description for post five'),
(6, 'Post Six', 6, 'Description for post six'),
(7, 'Post Seven', 7, 'Description for post seven'),
(8, 'Post Eight', 8, 'Description for post eight'),
(9, 'Post Nine', 9, 'Description for post nine'),
(10, 'Post Ten', 10, 'Description for post ten');


-- Dummy Data for tbl_post_comments
INSERT INTO tbl_post_comments (user_id, post_id, deal_id, comment)
VALUES
(1, 1, 1, 'Comment for post one'),
(2, 2, 2, 'Comment for post two'),
(3, 3, 3, 'Comment for post three'),
(4, 4, 4, 'Comment for post four'),
(5, 5, 5, 'Comment for post five'),
(6, 6, 6, 'Comment for post six'),
(7, 7, 7, 'Comment for post seven'),
(8, 8, 8, 'Comment for post eight'),
(9, 9, 9, 'Comment for post nine'),
(10, 10, 10, 'Comment for post ten');


-- Dummy Data for tbl_save_deal_posts
INSERT INTO tbl_save_deal_posts (user_id, deal_id)
VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);


-- Dummy Data for tbl_report_deals
INSERT INTO tbl_report_deals (user_id, deal_id, report, feedback)
VALUES
(1, 1, 'Inappropriate photos', 'Feedback for deal one'),
(2, 2, 'Inappropriate and abusive content', 'Feedback for deal two'),
(3, 3, 'Feels like spam', 'Feedback for deal three'),
(4, 4, 'Other', 'Feedback for deal four'),
(5, 5, 'Inappropriate photos', 'Feedback for deal five'),
(6, 6, 'Inappropriate and abusive content', 'Feedback for deal six'),
(7, 7, 'Feels like spam', 'Feedback for deal seven'),
(8, 8, 'Other', 'Feedback for deal eight'),
(9, 9, 'Inappropriate photos', 'Feedback for deal nine'),
(10, 10, 'Inappropriate and abusive content', 'Feedback for deal ten');


-- Dummy Data for tbl_deal_comments
INSERT INTO tbl_deal_comments (comment, user_id, deal_id)
VALUES
('Great deal!', 1, 1),
('Not worth it.', 2, 2),
('I love this!', 3, 3),
('Will try this soon.', 4, 4),
('Highly recommend!', 5, 5),
('Not impressed.', 6, 6),
('Fantastic offer!', 7, 7),
('Could be better.', 8, 8),
('Amazing deal!', 9, 9),
('I will pass.', 10, 10);


-- Dummy Data for tbl_deal_rating_reviews
INSERT INTO tbl_deal_rating_reviews (rating, review, user_id, deal_id)
VALUES
(4.5, 'Very good!', 1, 1),
(3.0, 'Average deal.', 2, 2),
(5.0, 'Excellent!', 3, 3),
(2.5, 'Not great.', 4, 4),
(4.0, 'Good value.', 5, 5),
(3.5, 'Decent.', 6, 6),
(4.8, 'Loved it!', 7, 7),
(2.0, 'Disappointing.', 8, 8),
(5.0, 'Best deal ever!', 9, 9),
(3.0, 'Okay.', 10, 10);


-- Dummy Data for tbl_premium_users
INSERT INTO tbl_premium_users (user_id, premium_plan_id, is_subscribed, started_at, expire_at)
VALUES
(1, 1, 'Yes', NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH)),
(2, 2, 'Yes', NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH)),
(3, 3, 'No', NULL, NULL),
(4, 4, 'Yes', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
(5, 5, 'No', NULL, NULL),
(6, 6, 'Yes', NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH)),
(7, 7, 'No', NULL, NULL),
(8, 8, 'Yes', NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH)),
(9, 9, 'No', NULL, NULL),
(10, 10, 'Yes', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR));



-- Dummy Data for tbl_contacts
INSERT INTO tbl_contacts (title, email, message, user_id)
VALUES
('Contact One', 'contact1@example.com', 'Message from contact one', 1),
('Contact Two', 'contact2@example.com', 'Message from contact two', 2),
('Contact Three', 'contact3@example.com', 'Message from contact three', 3),
('Contact Four', 'contact4@example.com', 'Message from contact four', 4),
('Contact Five', 'contact5@example.com', 'Message from contact five', 5),
('Contact Six', 'contact6@example.com', 'Message from contact six', 6),
('Contact Seven', 'contact7@example.com', 'Message from contact seven', 7),
('Contact Eight', 'contact8@example.com', 'Message from contact eight', 8),
('Contact Nine', 'contact9@example.com', 'Message from contact nine', 9),
('Contact Ten', 'contact10@example.com', 'Message from contact ten', 10);

SELECT * FROM tbl_users;
SELECT * FROM tbl_categories;
SELECT * FROM tbl_premium_plans;
SELECT * FROM tbl_business;
SELECT * FROM tbl_deal_posts;
SELECT * FROM tbl_tags;
SELECT * FROM tbl_verification;
SELECT * FROM tbl_follow;
SELECT * FROM tbl_posts;
SELECT * FROM tbl_post_comments;
SELECT * FROM tbl_save_deal_posts;
SELECT * FROM tbl_report_deals;
SELECT * FROM tbl_deal_comments;
SELECT * FROM tbl_deal_rating_reviews;
SELECT * FROM tbl_premium_users;
SELECT * FROM tbl_referrals;
SELECT * FROM tbl_contacts;

SHOW TABLES;

-- sign up
INSERT INTO tbl_users (username, email, password, mobile, referral_code,login_type)
VALUES ('new_user', 'new_user@example.com', 'hashed_password', '1234567890', 'REF011','simple');

-- log in
SELECT username, email, mobile, referral_code FROM tbl_users 
WHERE username = 'new_user' AND password = 'hashed_password';


-- frogot password(user exist or not)
SELECT * FROM tbl_users 
WHERE username = 'new_user' OR email = 'new_user@example.com';

--  generate OTP into
INSERT INTO tbl_verification (action, verify_with, user_id, otp)
VALUES (
    'Forget', 
    'M', 
    (SELECT id FROM tbl_users WHERE username = 'new_user' OR email = 'new_user@example.com'), 
    123456
);

-- Verify OTP 
SELECT v.*, u.*
FROM tbl_verification v
JOIN tbl_users u ON v.user_id = u.id
WHERE (u.username = 'new_user' OR u.email = 'new_user@example.com')
AND v.otp = 123456
AND v.action = 'Forget';


-- insert the user other details
UPDATE tbl_users
SET fname = 'Darshan', lname = 'Patel', bio = 'Darshan Bio'
WHERE id = 11;


-- update profile image
UPDATE tbl_users
SET profile_image = 'Darshan.jpg'
WHERE id = 11;

select profile_image from tbl_users where id = 11;

-- show all category with its images
select category,image from tbl_categories;

-- show all availble deals with total comment count
SELECT 
    dp.deal_image, 
    dp.title,
    b.address, 
    dp.created_at, 
    dc.comment, 
    u.username AS commented_by,
    (SELECT COUNT(*) FROM tbl_deal_comments WHERE deal_id = dp.id) AS total_comments
FROM tbl_deal_posts dp
JOIN tbl_business b ON dp.business_id = b.id
LEFT JOIN tbl_deal_comments dc ON dp.id = dc.deal_id
LEFT JOIN tbl_users u ON dc.user_id = u.id
ORDER BY dp.created_at DESC;

-- show perticular deal post details with user information
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
    u.address
FROM tbl_deal_posts dp
JOIN tbl_categories c ON dp.category_id = c.id
JOIN tbl_tags t ON dp.id = t.deal_id
JOIN tbl_users u ON dp.user_id = u.id
WHERE dp.id = 1;


-- show all category name and category image inside it how many deals are there its counts 
SELECT 
    c.category,
    c.image,
    (SELECT COUNT(*) FROM tbl_deal_posts dp WHERE dp.category_id = c.id) AS Total_Deals
FROM tbl_categories c
JOIN tbl_deal_posts dp ON dp.category_id = c.id
GROUP BY c.id;
    
    
-- show all the deal post with specific cetegory wise  
SELECT 
    c.category,
	u.profile_image,
    u.username,
    dp.deal_image,
    dp.title,
    b.address,
    dp.created_at,
    (SELECT COUNT(*) FROM tbl_deal_comments WHERE deal_id = dp.id) AS total_comments
from tbl_categories as c 
join tbl_deal_posts as dp on dp.category_id=c.id
join tbl_users as u on dp.user_id = u.id
join tbl_business as b on dp.business_id = b.id
where c.category = 'Clothing';


-- show all the comments on the specific deal post
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
WHERE dp.id = 1
ORDER BY dc.created_at;


-- post rating and review on specific deal
INSERT INTO tbl_deal_rating_reviews (rating, review, user_id, deal_id)
VALUES (4.5, 'Great deal!', 1, 1);


-- report on specific deal 
INSERT INTO tbl_report_deals (user_id, deal_id, report, feedback)
VALUES (1, 1, 'Inappropriate photos', 'This deal contains inappropriate photos.');

-- show user infromation with deal post and follower counts
select u.username,
	u.profile_image,
	u.background_image,
	u.bio,
	b.address,
    c.category,
	group_concat(dp.deal_image) as All_Post,
	count(*) as Total_Post,
	f.following_to,
	f.followed_by
from tbl_users as u
join tbl_business as b on b.user_id = u.id
join tbl_deal_posts as dp on dp.user_id=u.id
join tbl_follow as f on f.following_to = u.id
join tbl_categories as c on c.id = dp.category_id
where u.id=1;



-- Insert a new deal post
INSERT INTO tbl_deal_posts (user_id, business_id, deal_image, category_id, title, description, link)
VALUES (1, 1, 'new_deal_image.jpg', 1, 'New Deal Title', 'Description of the new deal', 'http://newdeal.com');


-- Insert two random tags for the new deal post
INSERT INTO tbl_tags (user_id, deal_id, tags)
VALUES 
(1, 1, 'random_tag1'),
(1, 1, 'random_tag2');



-- Show all the posts  
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


-- show only one post
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
where p.id=1;

-- Insert a new post
INSERT INTO tbl_posts (user_id, title, category_id, description)
VALUES (1, 'New Post Title', 1, 'Description of the new post');

-- show all the comments on a specific post details
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
WHERE pc.post_id = 1
ORDER BY pc.created_at;


-- filter by category name and distance between the specific user and bussiness address 
SELECT 
    c.category AS category_name,
    dp.title,
    dp.description,
    (SELECT COUNT(*) FROM tbl_deal_comments WHERE deal_id = dp.id) AS total_comments,
    u.profile_image,
    u.username,
    b.address as bussiness_address,
    u.address user_address,
    (6371 * ACOS(COS(RADIANS(u.latitude)) * COS(RADIANS(b.latitude)) * COS(RADIANS(b.longitude) - RADIANS(u.longitude)) + SIN(RADIANS(u.latitude)) * SIN(RADIANS(b.latitude)))) AS distance
FROM tbl_deal_posts dp
JOIN tbl_categories c ON dp.category_id = c.id
JOIN tbl_users u ON dp.user_id = u.id
JOIN tbl_business b ON dp.business_id = b.id
WHERE c.category = 'Clothing'
AND (6371 * ACOS(COS(RADIANS(u.latitude)) * COS(RADIANS(b.latitude)) * COS(RADIANS(b.longitude) - RADIANS(u.longitude)) + SIN(RADIANS(u.latitude)) * SIN(RADIANS(b.latitude)))) <= 10
ORDER BY dp.created_at DESC;


-- delete perticular deal
DELETE FROM tbl_deal_posts WHERE id = 1;


-- edit user profile 
UPDATE tbl_users
SET 
    profile_image = 'darshan_king.jpg',
    username = 'darshan king',
    fname = 'darshan',
    lname = 'king',
    email = 'darshan_king@example.com',
    mobile = '8160582627',
    bio = 'darshan bio update'
WHERE id = 1;
select * from tbl_users;

-- show primium_plans with plan_name 
SELECT plan_name,price,duration,information FROM tbl_premium_plans where plan_name = 'Basic Plan';


-- Insert a new business
INSERT INTO tbl_business (user_id, company_name, address, latitude, longitude, category_id, logo)
VALUES (1, 'New Business', '456 New Business Ave', '12.3457', '65.4322', 2, 'new_logo.jpg');

-- Edit Bussiness Info
UPDATE tbl_business
SET 
    company_name = 'Updated Business Name', 
    address = '789 Updated Business Ave', 
    latitude = '12.3458', 
    longitude = '65.4323', 
    category_id = 3, 
    logo = 'updated_logo.jpg'
WHERE id = 1;
select * from tbl_business where id=1;

-- show the user name and which plan is suscribed 
SELECT u.username, pp.plan_name
FROM tbl_premium_users pu
JOIN tbl_users u ON pu.user_id = u.id
JOIN tbl_premium_plans pp ON pu.premium_plan_id = pp.id
WHERE pu.is_subscribed = 'Yes' AND u.id = 1;


-- show all the deal_post information that are favourate by specicic user 
SELECT 
    dp.deal_image, 
    dp.title,
    b.address, 
    dp.created_at, 
    dc.comment, 
    u.username AS commented_by,
    (SELECT COUNT(*) FROM tbl_deal_comments WHERE deal_id = dp.id) AS total_comments
FROM tbl_save_deal_posts sdp
JOIN tbl_deal_posts dp ON sdp.deal_id = dp.id
JOIN tbl_business b ON dp.business_id = b.id
LEFT JOIN tbl_deal_comments dc ON dp.id = dc.deal_id
LEFT JOIN tbl_users u ON dc.user_id = u.id
WHERE sdp.user_id = 1
ORDER BY dp.created_at DESC;


-- show all primium_plans information  
SELECT plan_name,price,duration,information FROM tbl_premium_plans;


-- show all the follower list of the specific user
SELECT 
    u.username AS follower_username,
    u.profile_image AS follower_profile_image,
    f.created_at AS followed_at
FROM tbl_follow f
JOIN tbl_users u ON f.followed_by = u.id
WHERE f.following_to = 1
AND f.status = 'accepted'
ORDER BY f.created_at DESC;
    
    
-- show all the following list of the specific user
SELECT 
    u.username AS following_username,
    u.profile_image AS following_profile_image,
    f.created_at AS following_at
FROM tbl_follow f
JOIN tbl_users u ON f.following_to = u.id
WHERE f.followed_by = 1
AND f.status = 'accepted'
ORDER BY f.created_at DESC;


-- insert the data in the tbl_Contect us
INSERT INTO tbl_contacts (title, email, message, user_id)
VALUES ('Contact Title', 'contact@example.com', 'This is a message from the contact form.', 1);


-- change the password
UPDATE tbl_users
SET password = 'new_hashed_password'
WHERE id = 1 AND password = 'old_hashed_password';



 INSERT INTO tbl_referral_coins (user_id, referred_by, coins) value(1,2,10);
 
 SELECT u.id AS user_id, r.id AS referred_by, 10 
 FROM tbl_users u
 JOIN tbl_users r ON u.referral_code = r.referral_code
 WHERE u.id = 1 AND u.referral_code IS NOT NULL; 
        
SELECT id, username, referral_code FROM tbl_users WHERE referral_code = 'REF001';   

select * from tbl_referral_coins;

-- report deal post 
ALTER TABLE tbl_deal_posts
ADD COLUMN report_count INT DEFAULT 0;


DELIMITER //

CREATE TRIGGER after_report_insert
AFTER INSERT ON tbl_report_deals
FOR EACH ROW
BEGIN
    -- Update the report count for the deal post
    UPDATE tbl_deal_posts
    SET report_count = report_count + 1
    WHERE id = NEW.deal_id;

    
    IF (SELECT report_count FROM tbl_deal_posts WHERE id = NEW.deal_id) >= 2 THEN
        UPDATE tbl_deal_posts
        SET is_active = 0
        WHERE id = NEW.deal_id;
    END IF;
END;

//

DELIMITER ;

-- Insert a report
INSERT INTO tbl_report_deals (user_id, deal_id, report, feedback)
VALUES (2, 1, 'Inappropriate photos', 'This deal contains inappropriate photos.');

-- Check the deal post to see if it has been hidden
SELECT * FROM tbl_deal_posts WHERE id = 1 and is_active = 1;

update tbl_deal_posts 
set report_count = 0, is_active = 1 where id = 1;


-- 