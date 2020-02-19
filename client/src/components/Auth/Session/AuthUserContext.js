import React from 'react';

const AuthUserContext = React.createContext(null);

const withAuthUserContext = Component => props => (
  <AuthUserContext.Consumer>
    {user => <Component {...props} user={user} />}
  </AuthUserContext.Consumer>
);

export default AuthUserContext;
export { withAuthUserContext };