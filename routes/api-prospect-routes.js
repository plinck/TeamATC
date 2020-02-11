const Prospect = require('../models/Prospect');
const requiresLogin = require('../middleware/requiresLogin.js');

module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Prospects Server: ${err}`);
    });
    
    // Route for posting prospect info to mongo db
    app.route("/api/prospect")
        .post((req, res) => {
            Prospect.create(req.body)
                .then(dbModel => res.json(dbModel))
        });

    // Route for getting all prospects from mongoes
    // You must be logged in to see prospects
    app.get("/api/prospect", requiresLogin, (req, res) => {
        // Grab every document in the Prospect collection
        try {
            Prospect.find({})
                .then(function (dbProspect) {
                    // console.log(`found prospects: ${dbProspect}`);
                    res.json(dbProspect);
                })
                .catch(function (err) {
                    res.json(err);
                });
        } catch (err) {
            // catch all error
            res.status(500).json(`Error caught in route app.get("/api/prospect" ${err.errors[0].message}`);
        }
    });

    // You must be logged in to delete prospects
    app.post("/api/prospectDelete/:_id", requiresLogin, (req, res) => {
        // Grab every document in the Prospect collection
        let _id = req.params._id;

        try {
            Prospect.deleteOne({_id: _id})
                .then( (dbProspect) => {
                    // console.log(`deleted prospect with _id: ${_id}`);
                    res.json(dbProspect);
                })
                .catch( (err) => {
                    res.json(err);
                });
        } catch (err) {
            // catch all error
            res.status(500).json(`app.post("/api/prospectDelete/:_id ${err.errors[0].message}`);
        }
    });
};