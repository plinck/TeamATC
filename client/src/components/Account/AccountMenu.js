/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AccountAvatar from "../Account/AccountAvatar";
import SignOutButton from "../Auth/SignOut/SignOut";
import { NavLink } from 'react-router-dom';

class SimpleMenu extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { anchorEl } = this.state;

    return (
      <div>
        <a 
          aria-owns={anchorEl ? 'simple-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <AccountAvatar />
        </a>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleClose}><NavLink to="/account">Account</NavLink></MenuItem>
          <MenuItem onClick={this.handleClose}><SignOutButton /></MenuItem>
        </Menu>
      </div>
    );
  }
}

export default SimpleMenu;