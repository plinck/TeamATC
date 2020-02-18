import React from 'react';
import './Landing.css';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { Redirect } from 'react-router';
import Circle from './Circle/circle';
import Step from './Steps/Steps';
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
                <header className="valign-wrapper">
                    <div className="container">
                        <div className="row">
                                <div className="textbox col m5 offset-m7">
                                    <h3 className="white-text">Club Challenge</h3>
                                    <div className="center-align">
                                        <Link to="/register" className="waves-effect waves-light landing-btn btn  blue darken-4">Sign Up Now</Link>
                                    </div>
                                </div>
                            </div>
                    </div>
                </header>

                <main>
                    <div className="container main">

                        <div className="row">
                            <div className="cont">
                                <Circle info="Request To Join" />
                                <Circle info="Create Password" />
                                <Circle info="Sign in and Go" />
                            </div>
                        </div>
                    </div>
                </main>

                <section>
                    <div className="container">
                        <div className='row'>
                            <div className="col s12">
                                <h3 className="blue-text text-darken-4 center-align">How to get started</h3>
                                <div className="row">
                                    <Step num="1" step="Get Team Lead to sign you up using your email" />
                                    <Step num="2" step="Update your password using email link from TeamATC" />
                                    <Step num="3" step="Enter workouts" />

                                </div>
                            </div>
                        </div>
                    </div>
                </section>

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