const admin = require("../middleware/authServerCommon");
const requiresLogin = require('../middleware/requiresLogin.js');
const db = admin.firestore();;

let activities = [];
let activitiesArchive = [];
let cash = [];
let credit = [];

console.log("I ran");

// Get all activities on load
// change this to a listen
db.collection("activities").onSnapshot((querySnapshot) => {
    activities = [];
    querySnapshot.forEach(doc => {
        let activity = {};
        activity = doc.data();
        activity.id = doc.id;
        activity.time = activity.activityDateTme.toDate();
        activities.push(activity);
    });
}, (err) => console.log(err));

// Routes Below ------------------------------------------------------------------------------------------
module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });
    
    // Send all activities
    app.get("/api/firestore/activities", requiresLogin, (req, res) => {
        res.json(activities);
    });

    // Get activities in safe
    app.get("/api/firestore/getTotalActivities", requiresLogin, (req, res) => {

        let result = new Promise((resolve, reject) => {
            let total = {distanceTotal, durationTotal}
            total.nbrActivities = 0;
            total.distanceTotal = 0;
            total.durationTotal = 0;
    
            activities.forEach(tran => {
                nbrActivities += 1;
                distanceTotal += tran.distance;
                durationTotal += tran.duration;
            })
            resolve(total);
        });
        result.then(result => res.json(result));
    })

};

