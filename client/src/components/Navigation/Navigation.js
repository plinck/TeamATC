import React from 'react';
import { NavLink } from 'react-router-dom';
import M from "materialize-css/dist/js/materialize.min.js";
import SignOutButton from '../Auth/SignOut/SignOut';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { withRouter } from 'react-router-dom';
import AccountMenu from "../Account/AccountMenu";
import './Navigation.css';

class Navigation extends React.Component {
  state = {
    isTop: true
  }

  componentDidMount() {
    let elem = document.querySelector(".sidenav");
    M.Sidenav.init(elem, {
      edge: "left",
      inDuration: 250,
      closeOnClick: true
    });

    document.addEventListener('scroll', () => {
      const isTop = window.scrollY < 100;
      if (isTop !== this.state.isTop) {
        // console.log(isTop);
        this.setState({ isTop })
      }
    });
  }

  forceCloseSideNav() {
    let elem = document.querySelector(".sidenav");
    let instance = M.Sidenav.getInstance(elem);

    instance.close();
  }

  render() {

    let navBarClass = '';
    let name = '';

    if (this.state.isTop && this.props.history.location.pathname === "/") {
      navBarClass = 'transparent z-depth-0';
    } else {
      navBarClass = 'z-depth-0 blue darken-4'
      name = 'TeamATC Challenge'
    }


    const navigationAdminMobile =
      <ul>
        <li><NavLink onClick={this.forceCloseSideNav} to="/dashboard">Home</NavLink></li>
        <li><NavLink onClick={this.forceCloseSideNav} to="/activities">Activities</NavLink></li>
        <li><NavLink onClick={this.forceCloseSideNav} to="/account">Account</NavLink></li>
        <li><NavLink onClick={this.forceCloseSideNav} to="/admin">Admin</NavLink></li>
        {/* this.props.user.isBanker ? <li><NavLink onClick={this.forceCloseSideNav} to="/banker">Banker</NavLink></li> : "" */}
        <li onClick={this.forceCloseSideNav}><SignOutButton /></li>
        </ul>
        ;
        
        const navigationAdmin =
        <ul>
        <li><NavLink to="/dashboard">Home</NavLink></li>
        <li><NavLink to="/activities">Activity</NavLink></li>
        <li><AccountMenu /></li>
        <li><NavLink to="/admin">Admin</NavLink></li>
        </ul>
        ;
        
        const navigationAuthMobile =
        <ul>
        <li><NavLink onClick={this.forceCloseSideNav} to="/dashboard">Home</NavLink></li>
        <li><NavLink onClick={this.forceCloseSideNav} to="/activities">Activities</NavLink></li>
        <li><NavLink onClick={this.forceCloseSideNav} to="/account">Account</NavLink></li>
        <li onClick={this.forceCloseSideNav}> <SignOutButton /></li>
        </ul>
        ;
        
        const navigationAuth =
        <ul>
        <li><NavLink to="/dashboard">Home</NavLink></li>
        <li><NavLink to="/activities">Activity</NavLink></li>
        <li><AccountMenu /></li>
        </ul>
      ;

    const navigationNonAuthMobile =
      <ul>
        <li><NavLink onClick={this.forceCloseSideNav} to="/">Landing</NavLink></li>
        <li><NavLink onClick={this.forceCloseSideNav} to="/signin">Sign In</NavLink></li>
    </ul>
      ;

    const navigationNonAuth =
      <ul>
        <li><NavLink to="/">Landing</NavLink></li>
        <li><NavLink to="/signin">Sign In</NavLink></li>
      </ul>
      ;

    // get auth user from react-context firebase
    // Not the AuthUSerContext Provider passes the authUser
    // in its value={} paramater (see withAuthentication component in Auth/Session)
    // ANY COMPONENT that needs authUser info uses consumer this way

    let navBar, navBarMobile;
    if (this.props.user.authUser && this.props.user.isAdmin) {
      navBar = navigationAdmin;
      navBarMobile = navigationAdminMobile;
    } else if (this.props.user.authUser) {
      navBar = navigationAuth;
      navBarMobile = navigationAuthMobile;
    } else {
      navBar = navigationNonAuth;
      navBarMobile = navigationNonAuthMobile;
    }

    return (
      <div>
        <ul className="sidenav" id="mobile-menu">
            {navBarMobile}
        </ul>

        <div className='navbar-fixed'>
          <nav className={navBarClass}>
            <div className="container nav-wrapper">
              <a href="/" className="brand-logo"><img className="logo" src="../images/logo.png" alt="TeamATC Challenge Logo"/> <span>{name}</span></a>
              <a href="#!" data-target="mobile-menu" className="sidenav-trigger"><i className="material-icons">menu</i></a>
              <ul className="right hide-on-med-and-down">
                {navBar}
              </ul>
            </div>
          </nav>
        </div>
      </div>
    );
  }// render
} //class

export default withAuthUserContext(withRouter(Navigation));