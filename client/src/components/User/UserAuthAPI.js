import Util from "../Util/Util";

class UserAuthAPI {
    // Cloud Functions
    static testCloudFunctions() {
        const firebase = Util.getFirebaseAuth();
        const testFunctions = firebase.functions.httpsCallable('testFunctions');
        
        testFunctions({"uid": "paul"}).then(function(res) {
          // Read result of the Cloud Function.
          var messageSentBack = res.data.message;
          console.log(`return message from cloud function: ${messageSentBack}`)
          // ...
        });
    }
    
    static deleteAuthUser = (uid) => {
        return new Promise((resolve, reject) => {
            const firebase = Util.getFirebaseAuth();
            const deleteFBFAuthUser = firebase.functions.httpsCallable('deleteFBFAuthUser');
            const userInfo = {"uid": uid};
            
            deleteFBFAuthUser(userInfo).then( (res) => {
                // Read result of the Cloud Function.
                let deletedUid = res.data.uid;
                console.log(`deleted user with uid ${deletedUid} from cloud function`);
                resolve();
            }).catch(err => {
                console.error(`${err}`);
                reject(err);
            });
        });
    }
    
    // geths the current auth user info from firestore auth service
    static getCurrentAuthUser = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            resolve(Util.getCurrentAuthUser());
        });
    }

    // This calls the backend to allow admins to create an auth user securely abd not change login
    static createAuthUser = (authUser) => {
        return(Util.apiPost("/api/auth/createUser", authUser));
    }

    // This calls the backend to allow admins to create an auth user securely abd not change login
    static createAuthUserNoToken = (authUser) => {
        return(Util.apiPostNoToken("/api/auth/createAuthUserNoToken", authUser));
    }

    // This calls the backend to allow admins to create an auth user securely abd not change login
    static registerNewUser = (user) => {
        console.log(`trying to update user in auth: ${user}`);
        const firebase = Util.getFirebaseAuth();

        return(firebase.doCreateUserWithEmailAndPassword(user.email, user.password));
    }    

    // Update user's auth profile
    static updateCurrentUserAuthProfile(user) {
        // HERE
        let promise = 
            this.getCurrentAuthUser().then (authUser => {
                authUser.updateProfile({
                    displayName: `${user.firstName} ${user.lastName}`,
                    photoURL: user.photoURL ? user.photoURL : "",
                    phoneNumber: user.phoneNumber ? user.phoneNumber : ""
                }).then(() => {
                    // Update successful - doesnt matter
                }).catch((error) => {
                    // An error happened - doesnt matter, just log
                    console.error(`Error updateing user's profile ${error}.  No biigie, user still OK`);
                });
            }).catch (err => {
                // no biggie, let go
            });

        return promise;
    }

    // This calls the backend to allow admins to create an auth user securely abd not change login
    // Unfortunately this MUST be done on the backend - this function does not exist in the
    // fiebase client API.  So when bacekdn is removed this will hve to be firebase function
    static signinNewUser = (user) => {
        console.log(`trying to sign user in auth: ${user}`);
        const firebase = Util.getFirebaseAuth();

        return(firebase.doSignInWithEmailAndPassword(user.email, user.password));
    }    
}

export default UserAuthAPI;