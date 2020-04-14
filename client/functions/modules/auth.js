const functions = require('firebase-functions');
const admin = require('firebase-admin');
const ENV = require("./FirebaseEnvironment.js");

exports.fBFdeleteAuthUser = functions.https.onCall((req, res) => {
    let uid = req.uid;
    // delete the authUser
    // MUST RETURN A PROMISE!
    return admin.auth().deleteUser(uid)
        .then(() => {
            console.log('Successfully deleted auth user');
            return ({"uid" : uid});
        }).catch((err) => {
            if (/is no user/.test(err)) {
                return ({"uid" : uid});
            } else {
                console.error(`FB Func: fBFdeleteAuthUser -- Error deleting auth user: ${err}`);
                throw Error(`FB Func: fBFdeleteAuthUser -- Error deleting auth user: ${err}`);
                //  throw new functions.https.HttpsError('failed to connect' + err.message)
            }
        });

});

exports.fBFcreateAuthUser = functions.https.onCall((user, res) => {
    //console.log(`called fBFcreateAuthUser with req ${JSON.stringify(user)}`)
             
    // Generate random password if no password exists (meaning its created by someone else)
    if (!user.password || user.password === null || user.password === "") {
        let randomPassword = Math.random().toString(36).slice(-8);
        user.password = randomPassword;
    }
    // First, see if user already exists in auth
    // MUST return promise
    return new Promise((resolve, reject) => {
        admin.auth().getUserByEmail(user.email).then((user) => {
            // See the UserRecord reference doc for the contents of userRecord.
            let authUser = {};
            authUser = user;
            console.log(`Successfully fetched user data: ${JSON.stringify(authUser)}`);
            resolve(authUser);
        }).catch((err) => {
            console.log(`User does not yet exist in auth... creating`);
            // Create user
            admin.auth().createUser({
                email: user.email,
                emailVerified: false,
                password: user.password,
                displayName: `${user.firstName} ${user.lastName}`,
                disabled: false
            }).then((authUser) => {
                console.log(`Successfully added auth user: ${JSON.stringify(authUser)}`);
                resolve(authUser);
            }).catch((err) => {
                //throw Error(`Error creating auth user in fBFcreateAuthUser error: ${err}`);
                reject(`Error creating auth user in fBFcreateAuthUser error: ${err}`);
            });
        });  // get
    });
});