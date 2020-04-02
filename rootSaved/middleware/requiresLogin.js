// Shared Credentials and common logic
const admin = require("./authServerCommon");

module.exports = async (req, res, next) => {
    let token = req.header('FIREBASE_AUTH_TOKEN');
    console.log(`requires login token: ${token}`);

    // Firebase token is encrypted when sent for security
    // https://firebase.google.com/docs/reference/admin/node/admin.auth.DecodedIdToken
    let decodedToken;

    if (token) {
        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (error) {
            next(error);
            return;
        }
    } else {
        next("Authorization Failed - no valid token - cred token may have expired");
        return;
    }
    // All good, attach token to request and invoke route
    req.user = decodedToken;
    next();
    return;
};