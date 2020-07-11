import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';
import Avatar from '@material-ui/core/Avatar';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { withContext } from '../Auth/Session/Context';

const styles = {
  avatar: {
    margin: 10,
  },
  pinkAvatar: {
    margin: 10,
    color: '#fff',
    backgroundColor: pink[500],
  },
};

const IconAvatars = (props) => {
  const { classes } = props;

  // image avatar
  // <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" className={classes.avatar} />

  let avatar;
  let authPhotoURL = props.context.authUser && props.context.authUser.photoURL ? props.context.authUser.photoURL : "";
  console.log(`authPhotoURL: ${authPhotoURL}`);
  if (props.context.authUser && props.context.authUser.photoURL) {
    // use image avatar
    avatar = 
    <Avatar 
      alt={props.context.displayName || "account"} 
      src={props.context.authUser.photoURL}
      className={classes.avatar}>
    </Avatar>;
  } else if (props.context.displayName) {
    let res = props.context.displayName.split(" ");
    let initials = "";
    if (res[0][0]) {
      initials += res[0][0];
      if (res[1][0]) {
        initials += res[1][0];
      }
    } else {
      initials = "OP";
    }
    avatar = <Avatar className={classes.pinkAvatar}>{initials}</Avatar>;
  } else {
    avatar = 
    <Avatar className={classes.pinkAvatar}>
      <AccountCircle />
    </Avatar>;
  }

  return (
    <div>
      {avatar}
    </div>
  );
};

IconAvatars.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withContext(withStyles(styles)(IconAvatars));
