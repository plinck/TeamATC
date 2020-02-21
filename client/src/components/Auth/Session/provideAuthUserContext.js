import GLOBAL_ENV from "../../Environment/Environment";
import React from 'react';
import AuthUserContext from './AuthUserContext';

import { withFirebase } from '../Firebase/FirebaseContext';

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
                uid: null,
                displayName: null,
                phoneNumber: null,
                email: null,
                token: null,
                claims: null,
                isAdmin: false,
                isTeamLead: false,
                isModerator: false,
                isUser: false,
                firstName: null,
                lastName: null,
                teamUid: null,
                teamName: null
            };
        }

        refreshToken = async () => {
            try {
                let token = await this.props.firebase.doRefreshToken();
                let claims = await this.props.firebase.doGetUserRole();
                this.setState({
                    token: token,
                    claims: claims.name,
                    isAdmin: claims.isAdmin,
                    isTeamLead: claims.isTeamLead,
                    isModerator: claims.isModerator,
                    isUser: claims.isUser
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
                            authUserRole: null,
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

            // User listener
            // Try to set state together
            const dbUserRef = this.props.firebase.db.collection(`${GLOBAL_ENV.ORG}`).doc(`${GLOBAL_ENV.ENV}`).collection(`${GLOBAL_ENV.USERS_DB}`)
            let docRef = dbUserRef.doc(authUser.uid);
            this.userListener = docRef.onSnapshot((doc) => {
                const user = doc.data();
                if (user) {
                    this.setState({
                        authUser: authUser, 
                        uid: authUser.uid,
                        email: authUser.email,

                        displayName: user.displayName,
                        phoneNumber: user.phoneNumber,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        teamUid: user.teamUid,
                        teamName: user.teamName
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