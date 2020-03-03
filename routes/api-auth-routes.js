"use strict";
const admin = require("../middleware/authServerCommon");
const requiresLogin = require('../middleware/requiresLogin.js');
const UserDB = require("./UserDB");

module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });

    app.get("/api/auth/getClaims/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;
        UserDB.doc(uid).get().then (user => {
            res.json(user);
        }).catch(err => {
            // none found should be ignored
            res.status(404).json(`Error caught in app.get("/api/auth/getClaims/${uid}" ${err}`);
        });
    }); // Route

    // Route for making user adin
    app.post("/api/auth/setAdmin/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;
        
        UserDB.updateClaims(uid, {isAdmin: true}).then( () => {
            res.json(uid);
        }).catch (err => {
            res.status(500).json(`Error caught in "await UserDB.updateClaims" ${err}`);
        });
    }); // Route
    app.post("/api/auth/setTeamLead/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;

        UserDB.updateClaims(uid, {isTeamLead: true}).then( () => {
            res.json(uid);
        }).catch (err => {
            res.status(500).json(`Error caught in "await UserDB.updateClaims" ${err}`);
        });
    }); // Route
    app.post("/api/auth/setModerator/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;

        UserDB.updateClaims(uid, {isModerator: true}).then( () => {
            res.json(uid);
        }).catch (err => {
            res.status(500).json(`Error caught in "await UserDB.updateClaims" ${err}`);
        });
    }); // Route
    app.post("/api/auth/setUser/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;

        UserDB.updateClaims(uid, uid, {primaryRole: "user", isAdmin: false, isTeamLead: false, isModerator: false, isUser: true}).then( () => {
            res.json(uid);
        }).catch (err => {
            res.status(500).json(`Error caught in "await UserDB.updateClaims" ${err}`);
        });
    }); // Route

    // Delete User
    app.post("/api/auth/deleteUser/:uid", requiresLogin, (req, res) => {
        let uid = req.params.uid;
        try {
            // delete the authUser
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
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.post("/api/auth/deleteUser/:uid..." ${err.errors[0].message}`);
        }
    }); // Route

    // Route for Creating a new user with email and random password
    app.post("/api/auth/createUser", requiresLogin, (req, res) => {
        let user = req.body;
        
        // Generate random password if no password exists (meaning its created by someone else)
        if (!user.password || user.password === null || user.password === "") {
            let randomPassword = Math.random().toString(36).slice(-8);
            user.password = randomPassword;
        }

        try {
            // Create user
            admin.auth().createUser({
                email: user.email,
                emailVerified: false,
                password: user.password,
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
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.post("/api/auth/createUser..." ${err.errors[0].message}`);
        }
    }); // Route    

    // Route for Creating a new user with email and random password
    app.post("/api/auth/createNoTokenUser", (req, res) => {
        let user = req.body;
        
        // Generate random password if no password exists (meaning its created by someone else)
        if (!user.password || user.password === null || user.password === "") {
            let randomPassword = Math.random().toString(36).slice(-8);
            user.password = randomPassword;
        }

        try {
           // Create user
            admin.auth().createUser({
                email: user.email,
                emailVerified: false,
                password: user.password,
                displayName: `${user.firstName} ${user.lastName}`,
                disabled: false
            })
            .then((authUser) => {
                    console.log('Successfully added auth user');
                    res.json(authUser);
            })
            .catch((err) => {
                console.error('Error creating auth user:', err);
                res.status(404).json(`Error caught in app.post("/api/auth/createNoTokenUser}" ${err}`);
            });
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.post("/api/auth/createNoTokenUser..." ${err.errors[0].message}`);
        }
    }); // Route    
    
};