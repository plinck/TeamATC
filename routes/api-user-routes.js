"use strict";

const requiresLogin = require('../middleware/requiresLogin.js');

module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });

    // Route for getting current user that is authenticated
    app.get("/api/user", requiresLogin, (req, res) => {
        try {
            res.json({
                uid: req.user.uid,
                name: req.user.displayName,
                email: req.user.email
            });
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.get("/api/user
             ..." ${err.errors[0].message}`);
        }
    }); // Route

};