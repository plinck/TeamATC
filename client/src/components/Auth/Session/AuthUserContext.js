import React from 'react';

const AuthUserContext = React.createContext(null);

const withAuthUserContext = Component => props => (
  <AuthUserContext.Consumer>
    {authUser => <Component {...props} user={authUser} />}
  </AuthUserContext.Consumer>
);

export default AuthUserContext;
export { withAuthUserContext };