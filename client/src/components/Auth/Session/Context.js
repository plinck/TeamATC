import React from 'react';

const Context = React.createContext(null);

// This is the higher order component used in any component that needs auth / session info
const withContext = Component => props => (
  <Context.Consumer>
    {context => <Component {...props} user={context} context={context} />}
  </Context.Consumer>
);

export default Context;
export { withContext };