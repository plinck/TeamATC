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
                isCashier: false,
                isBanker: false,
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
                    isCashier: claims.isCashier,
                    isBanker: claims.isBanker,
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
                        this.setupUserListener(authUser.uid);

                        this.setState({
                                authUser: authUser, 
                                uid: authUser.uid,
                                displayName: authUser.displayName,
                                phoneNumber: authUser.phoneNumber,
                                email: authUser.email    
                            });
                        this.refreshToken();
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

        setupUserListener(uid) {
            // kill if listening to someone else
            if (this.userListener) {
                this.userListener();
            }

            // User listener
            let ref = this.props.firebase.db.collection("users").doc(uid);
            this.userListener = ref.onSnapshot((doc) => {
                const user = doc.data();
                if (user) {
                    this.setState({
                        displayName: user.displayName,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phoneNumber: user.phoneNumber,
                        teamUid: user.teamUid,
                        teamName: user.teamName
                    });
                }
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