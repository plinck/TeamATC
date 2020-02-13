const admin = require("../middleware/authServerCommon");
const requiresLogin = require('../middleware/requiresLogin.js');
const db = admin.firestore();;

// Static *class* variables
let activities = []
let _activities = [];
let _nbrActivities = 0;
let _distanceTotal = 0;
let _durationTotal = 0;

// Get all activities anytime it changes and attach user to each
db.collection("activities").onSnapshot((querySnapshot) => {
    activities = [];
    const userQueries = [];
    querySnapshot.forEach(doc => {
        let activity = doc.data();
        _nbrActivities += 1;
        _distanceTotal += activity.distance;
        _durationTotal += activity.duration;
        activity.id = doc.id;

        try {
            activity.activityDateTime = activity.activityDateTme.toDate();
        } catch (err) {
            // catch all error
            console.error(`Error caught in api-activity_routes.js for docId: ${activity.id } startup (bad data/date): ${err}`)
        }

        const userRef = db.collection("users").doc(activity.uid);
        const userQuery = userRef.get()
        .then ( user => {
            if (user.exists) {
                activity.firstName = user.data().firstName;
                activity.lastName = user.data().lastName;
                activity.email = user.data().email;
            }
        })
        .catch(err => console.error(`Error userQuery: ${err}`))
        .finally(() => {
            activities.push(activity);
        });
        userQueries.push(userQuery);
    });
    Promise.all(userQueries).then(() => {
        _activities = activities;
    });
}, (err) => console.error(err));

// Routes Below ------------------------------------------------------------------------------------------
module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use( (err, req, res, next) => {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });

    // Send all activities
    app.get("/api/firestore/activities", requiresLogin, (req, res) => {
        let activities = _activities;

        res.json(activities);
    });
    
    // Get activities in safe
    app.get("/api/firestore/getActivityTotals", requiresLogin, (req, res) => {

        let result = new Promise((resolve, reject) => {
            let total = {
                nbrActivities: _nbrActivities,
                distanceTotal: _distanceTotal,
                durationTotal: _durationTotal
            }
            resolve(total);
        });
        result.then(result => res.json(result));
    })

    // Send back total distance
    app.get("/api/activity/nbrActivities", requiresLogin, (req, res) => {
        res.json(_distanceTotal);
    }); 

    // Send back total distance
    app.get("/api/activity/activityDistanceTotal", requiresLogin, (req, res) => {
        res.json(_distanceTotal);
    });     

    // Send back total duration
    app.get("/api/activity/activityDurationTotal", requiresLogin, (req, res) => {
        res.json(_durationTotal);
    });     
};
