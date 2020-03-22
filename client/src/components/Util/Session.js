// This session is used since non-REACT components can not use REACT context
// It is simple and not sue why I didnt think of it before.  What a great way
// to save a small amount of context through s user's session
class Session {
  // Formats a display money field 
  static user = {};

  static setUser =  (userInfo) => {
    Session.user = userInfo;
    console.log(`Session.user: ${Session.user}`)
  }

  static getUser = () => {
    console.log(`Session.user: ${Session.user}`)
    return(Session.user);
  };
}

export default Session;