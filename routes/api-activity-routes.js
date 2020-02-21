const admin = require("../middleware/authServerCommon");
const requiresLogin = require('../middleware/requiresLogin.js');
const db = admin.firestore();;
const {ORG, ENV, USERS_DB} = require("../ServerEnvironment");

// Static *class* variables
let activities = []
let _activities = [];
let _nbrActivities = 0;
let _distanceTotal = 0;
let _durationTotal = 0;

// Get all activities anytime it changes and attach user to each
db.collection("activities").orderBy("activityDateTime", "desc").onSnapshot((querySnapshot) => {
    activities = [];
    _nbrActivities = 0;
    _distanceTotal = 0;
    _durationTotal = 0;

    const userQueries = [];
    querySnapshot.forEach(doc => {
        let activity = doc.data();
        _nbrActivities += 1;
        _distanceTotal += activity.distance;
        _durationTotal += activity.duration;
        activity.id = doc.id;
        //console.log(`activityDateTime: ${JSON.stringify(activity.activityDateTime)}`)
        
        try {
            let jsDate = activity.activityDateTime.toDate();
            activity.activityDateTime = jsDate; // Overwrite so deal with Javasceipt all the time
        } catch (error) {
            console.error(`Invalid Date: ${activity.activityDateTime} in record: ${activity.id}`)         
        }

        console.log(`api-activity-routes DB : ${ORG}/${ENV}/${USERS_DB}`);
        const dbUserRef = db.collection("ATC").doc("dev").collection("users");
        const userRef = dbUserRef.doc(activity.uid);
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
    app.get("/api/activity/activities", requiresLogin, (req, res) => {
        let activities = _activities;

        res.json(activities);
    });
    
    // Get activities in safe
    app.get("/api/activity/activityTotals", requiresLogin, (req, res) => {

        let result = new Promise((resolve) => {
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
        res.json(_nbrActivities);
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

