import React from 'react';

const FirebaseContext = React.createContext(null);

// HOC - Higher order component to wrap everything to pass firebase app object to anyone who needss
// Pass all the component props (using ...props) and also add the firebase app to the props that
// is passsd in from the .Provider
// the provider for this is in index.js so its passed to everytone below
// consumer uses => notation to pass in 'value={}' that provider passes
// NOTE: this HOC allows component just to wrap themselves with withFirebase(component)
// vs having to use  <FirebaseContext.Consumer> but the result is the same
const withFirebase = Component => props => (
  <FirebaseContext.Consumer>
    {firebase => <Component {...props} firebase={firebase} />}
  </FirebaseContext.Consumer>
);

export default FirebaseContext;
export { withFirebase };