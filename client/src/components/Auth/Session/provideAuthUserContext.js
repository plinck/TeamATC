import React from 'react';
import Util from "../../Util/Util";
import AuthUserContext from './AuthUserContext';
import { withFirebase } from '../Firebase/FirebaseContext';
import UserAPI from '../../User/UserAPI';
import Session from "../../Util/Session.js";

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
            let allDBRefs = Util.getDBRefs();

            const dbUsersRef = allDBRefs.dbUsersRef;
            const dbATCMembersRef = allDBRefs.dbATCMembersRef;

            const dbChallengesRef = allDBRefs.dbChallengesRef;
            const dbChallengeMembersRef = allDBRefs.dbChallengeMembersRef;
            const dbActivitiesRef = allDBRefs.dbActivitiesRef;
            const dbTeamsRef = allDBRefs.dbTeamsRef;
            
            this.state = {
                dbUsersRef: dbUsersRef,
                dbActivitiesRef: dbActivitiesRef,
                dbTeamsRef: dbTeamsRef,
                dbATCMembersRef: dbATCMembersRef,
                dbChallengeMembersRef: dbChallengeMembersRef,
                dbChallengesRef: dbChallengesRef,

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

                primaryRole: "user",
                isAdmin: false,
                isTeamLead: false,
                isModerator: false,
                isUser: false,
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
                this.setState({token: null});
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
            const dbUsersRef = Util.getDBRefs().dbUsersRef;
            let docRef = dbUsersRef.doc(authUser.uid);
            this.userListener = docRef.onSnapshot((doc) => {
                const user = doc.data();
                if (user) {
                    if (user.isAdmin) {
                        user.primaryRole = "admin"
                    } else if (user.isTeamLead) {
                        user.primaryRole = "teamLead"
                    } else if (user.isModerator) {
                        user.primaryRole = "moderator"
                    } else {
                        user.primaryRole = "athlete"
                        user.isUser  = true;
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

                        challengeUid: user.challengeUid ? user.challengeUid : null,

                        primaryRole: user.primaryRole ? user.primaryRole : "",
                        isAdmin: user.isAdmin ? user.isAdmin : false,
                        isTeamLead: user.isTeamLead ? user.isTeamLead : false,
                        isModerator: user.isModerator ? user.isModerator : false,
                        isUser: user.isUser ? user.isUser : false
                    });
                    // Update my fake session object
                    Session.setUser(user);
                    
                    // update firebase auth profile if this user's info changed
                    UserAPI.updateCurrentUserAuthProfile(user).then (() => {
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

        // This deletes listener to clean things up and prevent mem leaks
        componentWillUnmount() {
            this.listener();

            if (this.userListener) {
                this.userListener();
            }
        }

        // Remember - this provideAuthUserContext pattern automatically wraps a compoennt
        // with the provider show below to keep it out of that component
        // it provides the state of this a-object to ant consumer
        // I am not 100% sure its cleaner and easier but I will go with it for now.
        render() {
            return ( 
                <AuthUserContext.Provider value = {this.state} >
                    <Component {...this.props}/>  
                </AuthUserContext.Provider>
            );
        }
    }

    // this gives us firebae db stuff and then auth context uses it to provide more
    return withFirebase(ProvideAuthUserContext);
};

export default provideAuthUserContext;