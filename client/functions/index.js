const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.testFunctions = functions.https.onCall((req, res) => {
    console.log(`called testFunction with req ${JSON.stringify(req)}`)
    return {message: "response OK"};
});


exports.deleteFBFAuthUser = functions.https.onCall((req, res) => {
    let uid = req.uid;
    // delete the authUser
    admin.auth().deleteUser(uid)
        .then(() => {
            console.log('Successfully deleted auth user');
            return {"uid" : uid};
        }).catch((err) => {
            if (/is no user/.test(err)) {
                return {"uid" : uid};
            } else {
                console.error(`FB Func: deleteAuthUser -- Error deleting auth user: ${err}`);
                throw Error(`FB Func: deleteAuthUser -- Error deleting auth user: ${err}`);
            }
        });

});

