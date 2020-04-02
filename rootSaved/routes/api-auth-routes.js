"use strict";
const admin = require("../middleware/authServerCommon");
const requiresLogin = require('../middleware/requiresLogin.js');

module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });

    // Delete User
    app.post("/api/auth/deleteUser/:uid", (req, res) => {
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

        //console.log(`user: ${JSON.stringify(user)}`);

        // First, see if user already exists in auth
        admin.auth().getUserByEmail(user.email).then((authUser) => {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log(`Successfully fetched user data: ${JSON.stringify(authUser)}`);
            res.json(authUser);
        }).catch((error) => {
            console.log(`User does not yet exist in auth..., creating: Error Code: ${error}`);
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
        });  // get

    }); // Route    

    // Route for Creating a new user with email and random password
    app.post("/api/auth/createAuthUserNoToken", (req, res) => {
        let user = req.body;
        
        // Generate random password if no password exists (meaning its created by someone else)
        if (!user.password || user.password === null || user.password === "") {
            let randomPassword = Math.random().toString(36).slice(-8);
            user.password = randomPassword;
        }

        //console.log(`user: ${JSON.stringify(user)}`);

        // First, see if user already exists in auth
        admin.auth().getUserByEmail(user.email).then((authUser) => {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log(`Successfully fetched user data: ${JSON.stringify(authUser)}`);
            res.json(authUser);
        }).catch((error) => {
            console.log(`User does not yet exist in auth..., creating: Error Code: ${error}`);
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
        });  // get
    }); // Route    
    
};