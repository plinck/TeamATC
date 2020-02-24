import React from 'react';
import './Landing.css';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { Redirect } from 'react-router';
import { Link } from "react-router-dom";

class Landing extends React.Component {

    render() {
        if (this.props.user.authUser) {
            return (
                <Redirect to="/dashboard" />
            );
        }

        return (
            <div>
                <header>
                </header>
                
                <main className="container">
                    <h3 className="center-align">ATC Club Challenge</h3>
                        <div className="center-align">
                        <Link to="/signin" className="waves-effect waves-light landing-btn btn  blue darken">Sign In</Link>
                        <hr />
                        <Link to="/register" className="waves-effect waves-light landing-btn btn  blue darken">Sign Up Now</Link>
                        </div>
                        <br />
                </main>
                <br />
                <footer className="page-footer blue darken-4">
                    <div className="footer-copyright">
                        <div className="container">
                            © 2020 Copyright
                        </div>
                    </div>
                </footer>

            </div >
        );
    }
}
export default withAuthUserContext(Landing);