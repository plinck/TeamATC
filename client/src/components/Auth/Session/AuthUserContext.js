import React from 'react';

const AuthUserContext = React.createContext(null);

// This is the higher order component used in any component that needs auth / session info
const withAuthUserContext = Component => props => (
  <AuthUserContext.Consumer>
    {context => <Component {...props} user={context} context={context} />}
  </AuthUserContext.Consumer>
);

export default AuthUserContext;
export { withAuthUserContext };