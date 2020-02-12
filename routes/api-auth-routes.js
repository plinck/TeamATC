"use strict";
const admin = require("../middleware/authServerCommon");
const requiresLogin = require('../middleware/requiresLogin.js');
const UserDB = require("./UserDB");
const AuthUserAPI = require("./AuthUserAPI");

module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });

    // Route for getting user's custom claims
    app.get("/api/auth/getClaims/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;
        try {
            admin.auth().getUser(uid).then((user) => {
                // console.log(`Retrieved users custom claims: ${JSON.stringify(user, null, 4)}`);
                res.json(user);
            }).catch(err => {
                // none found should be ignored
                if (/is no user/.test(err)) {
                    res.json(user);
                } else {
                    res.status(404).json(`Error caught in app.get("/api/auth/getClaims/${uid}" ${err}`);
                }
            });

        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.get("/api/auth/getClaims/:uid"..." ${err}`);
        }
    }); // Route

    // Route for making user adin
    app.post("/api/auth/setAdmin/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;
        try {
            // Authorize the current user
            // to get initial admin setup I temp dispable the check
            // if (req.user) {
            // if (req.user && !!req.user.admin) {
            if (true) {
                        // set the claim for the user who's uid is passed
                // Note, this is the uid of the user to make admin (NOT the auth users uid)
                AuthUserAPI.setClaims(uid, {
                    admin: true
                }).then(async (newClaims) => {
                    try {
                        await UserDB.updateClaims(uid, newClaims.name, newClaims);
                        res.json(uid);
                    } catch (err) {
                        res.status(500).json(`Error caught in "await UserDB.updateClaims" ${err}`);
                    }
                });
            } else {
                res.status(401).json(`Must be admin to make someone admin..."`);
            }
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.post("/api/auth/setAdmin..." ${err}`);
        }
    }); // Route

    app.post("/api/auth/setCashier/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;
        try {
            // Authorize the current user
            // if (req.user && !!req.user.admin) {
            if (true) {
                    // Now, set custom claims
                AuthUserAPI.setClaims(uid, {
                    cashier: true
                }).then(async (newClaims) => {
                    try {
                        await UserDB.updateClaims(uid, newClaims.name, newClaims);
                        res.json(uid);
                    } catch (err) {
                        res.status(500).json(`Error caught in "await UserDB.updateClaims" ${err}`);
                    }
                });
            } else {
                res.status(401).json(`Must be admin to make someone cashier..."`);
            }

        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.post("/api/auth/setCashier..." ${err}`);
        }
    }); // Route

    app.post("/api/auth/setBanker/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;
        try {
            // Authorize the current user
            //if (req.user && !!req.user.admin) {
            if (true) {
                    // set the claim for the user who's uid is passed
                // Note, this is the uid of the user to make admin (NOT the auth users uid)
                AuthUserAPI.setClaims(uid, {
                    banker: true
                }).then(async (newClaims) => {
                    try {
                        await UserDB.updateClaims(uid, newClaims.name, newClaims);
                        res.json(uid);
                    } catch (err) {
                        res.status(500).json(`Error caught in "await UserDB.updateClaims" ${err}`);
                    }
                });
            } else {
                res.status(401).json(`Must be admin to make someone banker..."`);
            }
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.post("//api/auth/setBanker/:uid..." ${err}`);
        }
    }); // Route

    app.post("/api/auth/setUser/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;
        try {
            // Authorize the current user
            //if (req.user && !! req.user.admin) {
            if (true) {
                    // set the claim for the user who's uid is passed
                // Note, this is the uid of the user to update (NOT the auth users uid)
                AuthUserAPI.setClaims(uid, {
                    admin: false,
                    cashier: false,
                    banker: false,
                    user: true
                }).then(async (newClaims) => {
                    try {
                        await UserDB.updateClaims(uid, newClaims.name, newClaims);
                        res.json(uid);
                    } catch (err) {
                        res.status(500).json(`Error caught in "await UserDB.updateClaims" ${err}`);
                    }
                });
            } else {
                res.status(401).json(`Must be admin to make someone admin..."`);
            }
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.post("/api/auth/setAdmin..." ${err}`);
        }
    }); // Route

    // Route for making user adin
    app.post("/api/auth/deleteUser/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;
        try {
            // Authorize the current user
            // if (req.user && !!req.user.admin) {
            if (true) {
                    // delete the user
                admin.auth().deleteUser(uid)
                    .then(() => {
                        console.log('Successfully deleted auth user');
                        res.json();
                    })
                    .catch((err) => {
                        if (/is no user/.test(err)) {
                            res.json();
                        } else {
                            console.error('Error deleting auth user:', error);
                            res.status(404).json(`Error caught in app.get("/api/auth/getClaims/${uid}" ${err}`);
                        }
                    });
            } else {
                res.status(401).json(`Must be admin to delete user`);
            }
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.post("/api/auth/deleteUser/:uid..." ${err.errors[0].message}`);
        }
    }); // Route

    // Route for Creating a new user with email and random password
    app.post("/api/auth/createUser", requiresLogin, (req, res) => {
        // Generate random password
        let randomPassword = Math.random().toString(36).slice(-8);
        let user = req.body;

        try {
            // Authorize the current user - only admin can create
            //if (req.user && !!req.user.admin) {
            if (true) {
                    // Create user
                admin.auth().createUser({
                    email: user.email,
                    emailVerified: false,
                    password: randomPassword,
                    displayName: `${user.firstName} ${user.lastName}`,
                    disabled: false
                })
                .then((authUser) => {
                        console.log('Successfully added auth user');
                        res.json(authUser);
                })
                .catch((err) => {
                    console.error('Error creating auth user:', err);
                    res.status(404).json(`Error caught in app.post("/api/auth/createUser}" ${err}`);
                });
            } else {
                res.status(401).json(`Must be admin to create user`);
            }
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.post("/api/auth/createUser..." ${err.errors[0].message}`);
        }
    }); // Route    

};