import React from 'react';
import Util from "../../Util/Util";
import AuthUserContext from './AuthUserContext';
import { withFirebase } from '../Firebase/FirebaseContext';
import UserAuthAPI from '../../User/UserAuthAPI';
import Session from "../../Util/Session.js";
import {CHALLENGE} from "../../Environment/Environment";
import ResultsAPI from "../../Results/ResultsAPI";

// This component WRAPS Firebase and Authentication Context togtehr in 
// a HOC - Higher Order Component.
// This allows providers to just wrap provideAuthUserContext around a component
// to get access to the firebase app and the session context info
// SO BE CLEAR - This HOC is a WRAPPER in A WRAPPER
// -- i.e. provideAuthUserContext === withFirebase(ProvideAuthUserContext)
const provideAuthUserContext = Component => {
    class ProvideAuthUserContext extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                authUser: null,
                token: null,

                uid: null,
                displayName: null,
                phoneNumber: null,
                email: null,

                firstName: null,
                lastName: null,
                teamUid: null,
                teamName: null,

                challengeUid: null,
                challengeName: null,
                challengeShutdownStartDate: null,
                challengeShutdownEndDate: null,

                stavaUserAuth : null,
                stravaRefreshToken : null,
                stravaAccessToken : null,
                stravaExpiresAt : null,            

                primaryRole: "user",
                isAdmin: false,
                isTeamLead: false,
                isModerator: false,
                isUser: false,

                updatedResults: 0, 
                results: []         // results from backend
            };
        }

        refreshToken = async () => {
            try {
                let token = await this.props.firebase.doRefreshToken();
                this.setState({
                    token: token,
                });
            } catch {
                console.error("Error refreshng token");
                this.setState({ token: null });
            }
        }

        // NOTE:  This is where the AuthUserContext gets SET
        // I set it here it can be accessed anywhere below since context shared at top
        // Also the the the firebase app object is passed from the index.js component
        // above the app component so it can be used here.  
        componentDidMount() {
            // Auth Listener
            this.listener = this.props.firebase.auth.onAuthStateChanged(
                authUser => {
                    if (authUser) {
                        // try to get userListener going
                        this.setupUserListener(authUser);

                    } else {
                        this.setState({
                            authUser: null,
                            token: null
                        });
                    }
                },
            );
        }

        setupUserListener(authUser) {
            // kill if listening to someone else
            if (this.userListener) {
                this.userListener();
            }

            // User listener for the current signed in user
            // Try to set state together
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
            let docRef = dbUsersRef.doc(authUser.uid);
            this.userListener = docRef.onSnapshot((doc) => {
                let user = doc.data();
                if (user) {
                    user.id = doc.id;
                    if (user.isAdmin) {
                        user.primaryRole = "admin"
                    } else if (user.isTeamLead) {
                        user.primaryRole = "teamLead"
                    } else if (user.isModerator) {
                        user.primaryRole = "moderator"
                    } else {
                        user.primaryRole = "athlete"
                        user.isUser = true;
                    }
                    // Update my fake session object
                    Session.user = user;
                    Util.setEnviromentFromClient();
                    // console.log(`setupUserListener ==> Session.user: ${JSON.stringify(Session.user)}`)

                    // Listen to current challenge to get name, descirption for pages
                    if (user.challengeUid) {
                        this.setupChallengeListener(user.challengeUid);
                        ResultsAPI.getChallengeResults(user.challengeUid).then( () => {
                            // Ignore - no need to process
                        }).catch(err => {
                            console.error(`Error in provide auth user context updating challenge results on backend ${err}`)
                        });
                        this.setupResultsListener(user.challengeUid);
                    } else {
                        this.setupChallengeListener(CHALLENGE)               
                        ResultsAPI.getChallengeResults(CHALLENGE).then( () => {
                            // Ignore - no need to process
                        }).catch(err => {
                            console.error(`Error in provide auth user context updating challenge results on backend ${err}`)
                        });
                    }

                    this.setState({
                        authUser: authUser,
                        uid: authUser.uid,
                        email: authUser.email,

                        displayName: user.displayName,
                        phoneNumber: user.phoneNumber,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        teamUid: user.teamUid,
                        teamName: user.teamName,

                        challengeUid: user.challengeUid ? user.challengeUid : CHALLENGE,

                        stavaUserAuth: user.stavaUserAuth ? true : false,
                        stravaRefreshToken : user.stravaRefreshToken ? user.stravaRefreshToken : null,
                        stravaAccessToken : user.stravaAccessToken ? user.stravaAccessToken : null,
                        stravaExpiresAt : user.stravaExpiresAt ? user.stravaExpiresAt : null,            

                        primaryRole: user.primaryRole ? user.primaryRole : "",
                        isAdmin: user.isAdmin ? user.isAdmin : false,
                        isTeamLead: user.isTeamLead ? user.isTeamLead : false,
                        isModerator: user.isModerator ? user.isModerator : false,
                        isUser: user.isUser ? user.isUser : false
                    });

                    // update firebase auth profile if this user's info changed
                    UserAuthAPI.updateCurrentUserAuthProfile(user).then(() => {
                        // OK, no harm done
                    }).catch(err => {
                        // OK, no harm done
                    });
                } else {            // If cant find *user* you still need to set authUser
                    this.setState({
                        authUser: authUser,
                        uid: authUser.uid,
                        displayName: authUser.displayName,
                        phoneNumber: authUser.phoneNumber,
                        email: authUser.email
                    });
                }
                this.refreshToken();
            });
        }

        setupChallengeListener(challengeId) {
            // kill if listening to someone else
            if (this.challengeListener) {
                this.challengeListener();
            }

            // User listener for the current signed in user
            // Try to set state together
            const dbChallengesRef = Util.getBaseDBRefs().dbChallengesRef;
            let docRef = dbChallengesRef.doc(challengeId);
            this.challengeListener = docRef.onSnapshot((doc) => {
                const challenge = doc.data();
                if (challenge) {
                    challenge.id = doc.id;
                    Session.challenge = challenge;
                    // console.log(`Session.challenge: ${JSON.stringify(Session.challenge)}`)

                    this.setState({
                        challengeName: challenge.name,
                        challengeShutdownStartDate: challenge.challengeShutdownStartDate ? challenge.challengeShutdownStartDate.toDate() : null,
                        challengeShutdownEndDate: challenge.challengeShutdownStartDate ? challenge.challengeShutdownEndDate.toDate() : null,     
                    });
                    // Set FB functions enviroment after challenge is updated
                    Util.setEnviromentFromClient();
                }
            });
        }

        setupResultsListener(challengeUid) {
            this.perf = Util.getFirestorePerf();
    
            console.log(`Created result listener with challengeUid: ${challengeUid}`);
            this.perf = Util.getFirestorePerf();
            
            const traceFullResultsFirestore = this.perf.trace('traceFullResultsFirestore');;
            const traceGetResultsChanges = this.perf.trace('traceGetResultsChanges');

            if (this.resultslistener) {
                this.resultslistener();
            }
        
            let allDBRefs = Util.getChallengeDependentRefs(challengeUid);
            const dbResultsRef = allDBRefs.dbResultsRef;

            let ref = dbResultsRef;
            try {
                traceFullResultsFirestore.start();
            } catch {
                console.error("traceFullResultsFirestore not started ...")
            }

            let results = [];
            this.resultslistener = ref.onSnapshot((querySnapshot) => {
                try {
                    traceGetResultsChanges.start();
                } catch {
                    console.error("traceGetResultsChanges not started ...")
                }
    
                querySnapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        let newResult = change.doc.data();
                        newResult.id = change.doc.id;
                        results.push(newResult);
                    }
                    if (change.type === "modified") {
                        let changedResult = {};
                        changedResult = change.doc.data();
                        changedResult.id = change.doc.id;
                        results = results.map(result => {
                            if (changedResult.id === result.id) {
                                return changedResult;
                            } else {
                                return result;
                            }
                        });
                    }
                    if (change.type === "removed") {
                        // console.log(`Removed Result: ${change.doc.id}`);
                        results.filter(result => {
                            return result.id !== change.doc.id;
                        });            
                    }
                });
                this.setState({results: [...results], updatedResults: this.state.updatedResults +1});

                try {
                    traceGetResultsChanges.stop();
                } catch {
                    //
                }

                try {
                    traceFullResultsFirestore.incrementMetric('nbrResults', this.results.length);
                    traceFullResultsFirestore.stop();    
                } catch {
                    //
                }

                return;
            }, (err) => {
                console.error(`Error attaching listener: ${err}`);
                return;
            }); // Create listener
        }
    

        // This deletes listener to clean things up and prevent mem leaks
        componentWillUnmount() {
            this.listener();

            if (this.userListener) {
                this.userListener();
            }
            if (this.challengeListener) {
                this.challengeListener();
            }
            if (this.resultsListener) {
                this.resultsListener();
            }
        }

        // Remember - this provideAuthUserContext pattern automatically wraps a compoennt
        // with the provider show below to keep it out of that component
        // it provides the state of this a-object to ant consumer
        // I am not 100% sure its cleaner and easier but I will go with it for now.
        render() {
            return (
                <AuthUserContext.Provider value={this.state} >
                    <Component {...this.props} />
                </AuthUserContext.Provider>
                
            );
        }
    }

    // this gives us firebae db stuff and then auth context uses it to provide more
    return withFirebase(ProvideAuthUserContext);
};

export default provideAuthUserContext;