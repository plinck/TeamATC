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