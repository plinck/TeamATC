const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.testFunctions = functions.https.onCall((req, res) => {
    console.log(`called testFunction with req ${JSON.stringify(req)}`)
    return {message: "response OK"};
});


exports.deleteAuthUser = functions.https.onCall((req, res) => {
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
                    res.redirect(404).json(`Error caught in app.get("/api/auth/getClaims/${uid}" ${err}`);
                }
            });
    } catch (err) {
        // catch all error
        res.redirect(500).json(`Error caught in route app.post("/api/auth/deleteUser/:uid..." ${err.errors[0].message}`);
    }

});

