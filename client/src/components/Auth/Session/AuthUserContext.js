import React from 'react';

const AuthUserContext = React.createContext(null);

// This is the higher order component used in any component that needs auth / session info
const withAuthUserContext = Component => props => (
  <AuthUserContext.Consumer>
    {user => <Component {...props} user={user} />}
  </AuthUserContext.Consumer>
);

export default AuthUserContext;
export { withAuthUserContext };