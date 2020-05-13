/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { NavLink } from 'react-router-dom';

class AdminMenu extends React.Component {
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
            aria-owns={anchorEl ? 'admin-menu' : undefined}
            aria-haspopup="true"
            onClick={this.handleClick}
          >Admin
          </a>
        <Menu
          id="admin-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleClose}><NavLink to="/admin">Users</NavLink></MenuItem>
          <MenuItem onClick={this.handleClose}><NavLink to="/adminfunctions">Admin </NavLink></MenuItem>
        </Menu>
      </div>
    );
  }
}

export default AdminMenu;