"use strict";

const requiresLogin = require('../middleware/requiresLogin.js');

module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });

    // Route for getting all notes from mongoes
    app.get("/api/note", requiresLogin, (req, res) => {
        // Grab every document in the notes collection
        try {
            db.Note.find({})
                .then(function (dbNote) {
                    res.json(dbNote);
                })
                .catch(function (err) {
                    res.json(err);
                });
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.get("/api/user
             ..." ${err.errors[0].message}`);
        }
    });
};