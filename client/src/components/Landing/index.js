import React from 'react';
import './Landing.css';
import Circle from './Circle/circle';
import Step from './Steps/Steps';
import { Link } from "react-router-dom";

class Landing extends React.Component {

    render() {
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
                    {/* <div className="container">
                        <div className="row">
                            <div className="col l6 s12">
                                <h5 className="white-text">Footer Content</h5>
                                <p className="grey-text text-lighten-4">"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."</p>
                            </div>
                            <div className="col l4 offset-l2 s12">
                                <h5 className="white-text">Links</h5>
                                <ul>
                                    <li><a className="grey-text text-lighten-3" href="#!">Link 1</a></li>
                                    <li><a className="grey-text text-lighten-3" href="#!">Link 2</a></li>
                                    <li><a className="grey-text text-lighten-3" href="#!">Link 3</a></li>
                                    <li><a className="grey-text text-lighten-3" href="#!">Link 4</a></li>
                                </ul>
                            </div>
                        </div>
                    </div> */}
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

export default Landing;