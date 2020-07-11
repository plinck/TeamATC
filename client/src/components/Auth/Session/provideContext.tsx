import React from 'react';
import Util from "../../Util/Util";
import Context from './Context';
import { withFirebase } from '../Firebase/FirebaseContext';
import UserAuthAPI from '../../User/UserAuthAPI';
import Session from "../../Util/Session";
import {CHALLENGE} from "../../Environment/Environment";
import ResultsAPI from "../../Results/ResultsAPI";

// Interfaces from BACKEND
import { Challenge } from "../../../interfaces/Challenge";
import { Result } from "../../../interfaces/Result";
import { Team } from "../../../interfaces/Team";
import { User } from "../../../interfaces/User";
import Firebase from '../Firebase/Firebase';
import { ContextType } from "../../../interfaces/Context.Types";

// This component WRAPS Firebase and Authentication Context together
// a HOC - Higher Order Component.
// This allows providers to just wrap provideContext around a component
// to get access to the firebase app and the session context info
// SO BE CLEAR - This HOC is a WRAPPER in A WRAPPER
// -- i.e. provideContext === withFirebase(ProvideContext)
const provideContext = (Component: any) => {
    interface OwnProps {
        firebase: Firebase,
    }

    type Props = OwnProps; // & ButtonProps (other props?);
        
    class ProvideContext extends React.Component<Props> {
        authListener: any;
        userListener: any;
        challengeListener: any;
        resultsListener: any;
        teamsListener: any;
        perf: firebase.performance.Performance;
        state: ContextType = {
            authUser: null,
            token: null,
            // all user info - elimated details after this
            user: null,

            // user info
            uid: null,
            challenges: [],
            displayName: null,
            email: null,
            firstName: null,
            isAdmin: false,
            isTeamLead: false,
            isModerator: false,
            isUser: false,
            lastName: null,
            phoneNumber: null,
            primaryRole: "user",
            teamUid: null,
            teamName: null,

            challenge: null,
            challengeUid: null,
            challengeDistance: 0,
            challengeName: null,

            stavaUserAuth : null,
            stravaRefreshToken : null,
            stravaAccessToken : null,
            stravaExpiresAt : null,            

            updatedTeams: 0, 
            teams: [],

            updatedResults: 0, 
            results: []         // results from backend
        };

        // constructor(props: Props) {
        //     super(props);
        // }

        refreshToken = async () => {
            try {
                const token = await this.props.firebase.doRefreshToken();
                this.setState({token});
            } catch {
                console.error("Error refreshng token");

                this.setState({ token: null });
            }
        }

        // NOTE:  This is where the Context gets SET
        // I set it here it can be accessed anywhere below since context shared at top
        // Also the the the firebase app object is passed from the index.js component
        // above the app component so it can be used here.  
        componentDidMount() {
            // Auth Listener
            this.authListener = this.props.firebase.auth.onAuthStateChanged(
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

        setupUserListener(authUser: any) {
            // kill if listening to someone else
            if (this.userListener) {
                this.userListener();
            }

            // userListener for the current signed in user
            // Try to set state together
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
            const docRef: firebase.firestore.DocumentReference = dbUsersRef.doc(authUser.uid);
            this.userListener = docRef.onSnapshot((doc: firebase.firestore.DocumentSnapshot) => {
                if (doc.data()) {
                    let user = new User();
                    user = doc.data() as User;
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
                        ResultsAPI.getChallengeResults(user.challengeUid).then(() => {
                            // Ignore - no need to process
                        }).catch(err => {
                            console.error(`Error in provide auth user context updating challenge results on backend ${err}`)
                        });
                        this.setupResultsListener(user.challengeUid);
                        this.setupTeamsListener(user.challengeUid);
                    } else {
                        this.setupChallengeListener(CHALLENGE)               
                        ResultsAPI.getChallengeResults(CHALLENGE).then(() => {
                            // Ignore - no need to process
                        }).catch(err => {
                            console.error(`Error in provide auth user context updating challenge results on backend ${err}`)
                        });
                    }

                    this.setState({
                        authUser,
                        user,
                        uid: authUser.uid,
                                                
                        challenges: user.challenges,
                        displayName: user.displayName,
                        email: user.email,
                        isAdmin: user.isAdmin ? user.isAdmin : false,
                        isTeamLead: user.isTeamLead ? user.isTeamLead : false,
                        isModerator: user.isModerator ? user.isModerator : false,
                        isUser: user.isUser ? user.isUser : false,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phoneNumber: user.phoneNumber,
                        primaryRole: user.primaryRole ? user.primaryRole : "",
                        teamUid: user.teamUid,
                        teamName: user.teamName,

                        challengeUid: user.challengeUid ? user.challengeUid : CHALLENGE,

                        stavaUserAuth: user.stravaUserAuth ? true : false,
                        stravaRefreshToken : user.stravaRefreshToken ? user.stravaRefreshToken : null,
                        stravaAccessToken : user.stravaAccessToken ? user.stravaAccessToken : null,
                        stravaExpiresAt : user.stravaExpiresAt ? user.stravaExpiresAt : null           

                    });

                    // update firebase auth profile if this user's info changed
                    UserAuthAPI.updateCurrentUserAuthProfile(user).then(() => {
                        // OK, no harm done
                    }).catch(err => {
                        return null;
                        // OK, no harm done
                    });
                } else {            // If cant find *user* you still need to set authUser
                    this.setState({
                        authUser,
                        uid: authUser.uid,
                        displayName: authUser.displayName,
                        phoneNumber: authUser.phoneNumber,
                        email: authUser.email
                    });
                }
                this.refreshToken().then(() => {
                    // Nada
                }).catch(err => {
                    console.error(`Error refreshing token ${err}`);
                });
            });
        }

        setupChallengeListener(challengeId: string) {
            // kill if listening to someone else
            if (this.challengeListener) {
                this.challengeListener();
            }

            // userListener for the current signed in user
            // Try to set state together
            const dbChallengesRef = Util.getBaseDBRefs().dbChallengesRef;
            const docRef = dbChallengesRef.doc(challengeId);
            this.challengeListener = docRef.onSnapshot((doc) => {
                if (doc.data()) {
                    // must convert fromFB timestamp BEFORE assigning type since toDate) is not part of Challenge Type for Date
                    const endDate = doc.data().endDate.toDate();
                    const startDate = doc.data().endDate.toDate();

                    let challenge = new Challenge();
                    challenge = doc.data() as Challenge;
                    challenge.endDate = endDate;
                    challenge.startDate = startDate;
                    challenge.id = doc.id;

                    Session.challenge = challenge;
                    // console.log(`Session.challenge: ${JSON.stringify(Session.challenge)}`)

                    this.setState({
                        challenge,
                        challengeDistance: challenge.challengeDistance ? challenge.challengeDistance : 0,
                        challengeName: challenge.name,
                    });
                    // Set FB functions enviroment after challenge is updated
                    Util.setEnviromentFromClient();
                }
            });
        }

        setupResultsListener(challengeUid: string) {
            this.perf = Util.getFirestorePerf();
    
            console.log(`Created result listener with challengeUid: ${challengeUid}`);
            this.perf = Util.getFirestorePerf();
            
            const traceFullResultsFirestore = this.perf.trace('traceFullResultsFirestore');
            const traceGetResultsChanges = this.perf.trace('traceGetResultsChanges');

            if (this.resultsListener) {
                this.resultsListener();
            }
        
            const allDBRefs = Util.getChallengeDependentRefs(challengeUid);
            const dbResultsRef = allDBRefs.dbResultsRef;

            const ref = dbResultsRef;
            try {
                traceFullResultsFirestore.start();
            } catch {
                console.error("traceFullResultsFirestore not started ...")
            }

            let results: Array<Result> = [];
            this.resultsListener = ref.onSnapshot((querySnapshot) => {
                try {
                    traceGetResultsChanges.start();
                } catch {
                    console.error("traceGetResultsChanges not started ...")
                }
    
                querySnapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        let newResult: Result = new Result("");
                        newResult = change.doc.data() as Result;
                        newResult.id = change.doc.id;
                        results.push(newResult);
                    }
                    if (change.type === "modified") {
                        let changedResult: Result = new Result("");
                        changedResult = change.doc.data() as Result;
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
                const { updatedResults } = this.state;
                this.setState({results: [...results], updatedResults: updatedResults + 1});

                try {
                    traceGetResultsChanges.stop();
                } catch {
                    //
                }

                try {
                    traceFullResultsFirestore.incrementMetric('nbrResults', results.length);
                    traceFullResultsFirestore.stop();    
                } catch {
                    //
                }

                return;
            }, (err: Error) => {
                console.error(`Error attaching listener: ${err}`);
                return;
            }); // Create listener
        }

        setupTeamsListener(challengeUid: string) {
            this.perf = Util.getFirestorePerf();
    
            console.log(`Created teams listener with challengeUid: ${challengeUid}`);

            if (this.teamsListener) {
                this.teamsListener();
            }
        
            const allDBRefs = Util.getChallengeDependentRefs(challengeUid);
            const dbTeamsRef = allDBRefs.dbTeamsRef;

            const ref = dbTeamsRef;

            let teams: Array<Team> = [];
            this.teamsListener = ref.onSnapshot((querySnapshot) => {
    
                querySnapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        let newTeam: Team = new Team("");
                        newTeam = change.doc.data() as Team;
                        newTeam.id = change.doc.id;
                        teams.push(newTeam);
                    }
                    if (change.type === "modified") {
                        let changedTeam: Team = new Team("");
                        changedTeam = change.doc.data() as Team;
                        changedTeam.id = change.doc.id;
                        teams = teams.map(team => {
                            if (changedTeam.id === team.id) {
                                return changedTeam;
                            } else {
                                return team;
                            }
                        });
                    }
                    if (change.type === "removed") {
                        // console.log(`Removed Result: ${change.doc.id}`);
                        teams.filter(team => {
                            return team.id !== change.doc.id;
                        });            
                    }
                });
                const { updatedTeams } = this.state;
                this.setState({teams: [...teams], updatedResults: updatedTeams + 1});
                return;
            }, (err: Error) => {
                console.error(`Error attaching listener: ${err}`);
                return;
            }); // Create listener
        }
    


        // This deletes listener to clean things up and prevent mem leaks
        componentWillUnmount() {
            this.authListener();

            if (this.userListener) {
                this.userListener();
            }
            if (this.challengeListener) {
                this.challengeListener();
            }
            if (this.resultsListener) {
                this.resultsListener();
            }
            if (this.teamsListener) {
                this.teamsListener();
            }
        }

        // Remember - this provideContext pattern automatically wraps a compoennt
        // with the provider show below to keep it out of that component
        // it provides the state of this a-object to ant consumer
        // I am not 100% sure its cleaner and easier but I will go with it for now.
        render() {
            return (
                <Context.Provider value={this.state} >
                    <Component {...this.props} />
                </Context.Provider>
                
            );
        }
    }

    // this gives us firebae db stuff and then auth context uses it to provide more
    return withFirebase(ProvideContext);
};

export default provideContext;