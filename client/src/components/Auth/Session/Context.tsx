import React from 'react';

const Context = React.createContext(null);

// This is the higher order component used in any component that needs auth / session info
// Here we are using a generic; P represents the props of the component that is passed into the HOC.
// React.ComponentType<P> is an alias for React.FunctionComponent<P> | React.ClassComponent<P>, 
// meaning the component that is passed into the HOC can be either a function component or class component.
const withContext = <P extends object>(Component: React.ComponentType<P>) => (props: any) => (
  <Context.Consumer>
    {context => <Component {...props} user={context} context={context} />}
  </Context.Consumer>
);

export default Context;
export { withContext };