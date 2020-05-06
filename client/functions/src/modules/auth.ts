import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

exports.authDeleteUser = functions.https.onCall((req, context) => {
    const uid = req.uid;
    // delete the authUser
    // MUST RETURN A PROMISE!
    return new Promise((resolve, reject) => {
        admin.auth().deleteUser(uid)
        .then(() => {
            console.log('Successfully deleted auth user');
            resolve ({"uid" : uid});
        }).catch((err) => {
            if (/is no user/.test(err)) {
                resolve ({"uid" : uid});
            } else {
                console.error(`FB Func: authDeleteUser -- Error deleting auth user: ${err}`);
                reject(`FB Func: authDeleteUser -- Error deleting auth user: ${err}`);
            }
        });
    });
});

exports.authCreateUser = functions.https.onCall((user, res) => {
    //console.log(`called authCreateUser with req ${JSON.stringify(user)}`)
             
    // Generate random password if no password exists (meaning its created by someone else)
    if (!user.password || user.password === null || user.password === "") {
        const randomPassword = Math.random().toString(36).slice(-8);
        user.password = randomPassword;
    }
    // First, see if user already exists in auth
    // MUST return promise
    return new Promise((resolve, reject) => {
        admin.auth().getUserByEmail(user.email).then((newAuthUser) => {
            // See the UserRecord reference doc for the contents of userRecord.
            const authUser = newAuthUser;
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
            }).catch((err2) => {
                //throw Error(`Error creating auth user in authCreateUser error: ${err}`);
                console.error(`Error creating auth user in authCreateUser error: ${err2}`);
                reject(`Error creating auth user in authCreateUser error: ${err2}`);
            });
        });  // get
    });
});