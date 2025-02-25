const express = require('express');
const User = require('../controllers/user');

// var middlewear = require("../../../../middleware/data-validation");
var customerRoute = (app) => {

    // testing app route
    app.get("/v1/user/getExample", User.getExample);

    // User CRUD Routes
    app.get('/v1/user/:id', User.getUser);
    app.get('/v1/users', User.getAllUsers);
    app.post('/v1/user', User.createUser);
    app.patch('/v1/user/:id', User.updateUser);
    app.delete('/v1/user/:id', User.deleteUser);

    // User Auth Routes
    app.post('/v1/user/signup', User.signup);
    app.post('/v1/user/verify-otp', User.verifyOtp);
    app.post('/v1/user/resend-otp', User.resendOtp);
    app.post('/v1/user/login', User.login);
    app.patch('/v1/user/:id/edit-profile', User.editUserProfile);
    app.patch('/v1/user/:id/logout', User.logout);
    app.post('/v1/user/forgot-password', User.forgotPassword);
    app.post('/v1/user/:id/change-password', User.changePassword);

    // User Routes
    app.post('/v1/users/:userId/edit-profile', User.userProfile);
    app.get('/v1/users/:userId/favorite-deals', User.favoriteDeals);
    app.get('/v1/users/:userId/following-list', User.followingList);
    app.get('/v1/users/:userId/followers-list', User.followersList);
    app.post('/v1/user/:userId/profile', User.userProfile);

    // Deal Routes
    app.get('/v1/deals/categories', User.getCategories);
    app.get('/v1/deals/deals-by-distance', User.getDealsByDistance);
    app.get('/v1/deals/deal-post-details/:dealId', User.getDealPostDetails);
    app.get('/v1/user/:userId/deals/deals-by-category/:category', User.getDealsByCategory);
    app.get('/v1/deals/:dealId/comments', User.commentsOnDeal);
    app.post('/v1/deals/:dealId/rate', User.dealRatingReview);
    app.get('/v1/deals/posts', User.dealPostsWant);
    app.post('/v1/deals/filter', User.filterDeals);

    app.get('/v1/posts/:postId/comments', User.postComments);


    app.post('/v1/user/:userId/business/add', User.addBusiness);
    app.post('/v1/user/:userId/business/:businessId/edit', User.editBusiness);
    app.get('/v1/user/:userId/favoriteDeals', User.favoriteDeals);

    app.post('/v1/user/:userId/delete', User.deleteUserAccount);


};

module.exports = customerRoute;

