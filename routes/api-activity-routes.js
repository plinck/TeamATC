const admin = require("../middleware/authServerCommon");
const requiresLogin = require('../middleware/requiresLogin.js');
const db = admin.firestore();;

// Static *class* variables
let activities = []
let _activities = [];
let _distanceTotal = 0;
let _durationTotal = 0;

// Get all activities anytime it changes and attach user to each
db.collection("activities").onSnapshot((querySnapshot) => {
    activities = [];
    const userQueries = [];
    querySnapshot.forEach(doc => {
        let activity = doc.data();
        _distanceTotal += activity.distance;
        _durationTotal += activity.duration;
        activity.id = doc.id;
        activity.activityDatetime = activity.activityDatetime.toDate();
        // get the user ndoc.data().uid;
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

// Get all archived activities anytime it changes attach user

// Routes Below ------------------------------------------------------------------------------------------
module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });

    // Send all activities in Safe and in archive
    app.get("/api/activity/allActivities", requiresLogin, (req, res) => {
        let allActivities = _activities;

        res.json(allActivities);
    });   

    // Send back total distance
    app.get("/api/activity/allActivities", requiresLogin, (req, res) => {
        res.json(_distanceTotal);
    });     

    // Send back total duration
    app.get("/api/activity/allActivities", requiresLogin, (req, res) => {
        res.json(_durationTotal);
    });     
};

