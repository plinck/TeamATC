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
                                    <h3 className="white-text">How Retailers Handle Cash</h3>
                                    <h5 className="white-text">Instantly make cash deposits</h5>
                                    <h5 className="white-text">Consolidate balances from multiple locations</h5>
                                    <h5 className="white-text">View comprehensive deposit reports</h5>
                                    <h5 className="white-text">All from your phone or tablet</h5>

                                    <div className="center-align">
                                        <Link to="/register" className="waves-effect waves-light landing-btn btn  blue darken-4">Sign Up Now</Link>
                                    </div>
                                </div>
                            </div>
                    </div>
                </header>

                <main>
                    <div className="container main">
                        <div className='row'>
                            <div className="col s12">
                                <h3 className="white-text center-align">The days of making branch deposits are over</h3>
                            </div>
                        </div>

                        <div className='row'>
                            <div className="col s12 m8">
                                <h5 className="white-text">Depositing your business' hard-earned cash shouldn't be expensive or time consuming.
                                That's why we created a better way. </h5>
                            </div>
                            <div className="col s12 m3 offset-m1">
                                <div className="center-align">
                                    <Link to="/register" className="landing-btn btn white blue-text text-darken-4">Get Started</Link>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="cont">
                                <Circle info="Deposit cash remotely via Dollaroo's Smart Cash Scanner" />
                                <Circle info="Get instant credit to your account for daily deposits" />
                                <Circle info="View comprehensive deposit reports across all locations" />
                            </div>
                        </div>
                    </div>
                </main>

                <section>
                    <div className="container">
                        <div className='row'>
                            <div className="col s12">
                                <h3 className="blue-text text-darken-4 center-align">How depositing with Dollaroo works:</h3>
                                <div className="row">
                                    <Step num="1" step="Run your daily cash deposits through the Dollaroo Smart Scanner at the end of the day" />
                                    <Step num="2" step="Secure cash in any safe on site. Deposits are collected every two weeks, or on a custom schedule" />
                                    <Step num="3" step="Provisional credit is available the same day of deposit, consolidated from all locations" />

                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="signUp">
                    <div className="container">
                        <div className='row'>
                            <div className="col s12">
                                <h3 className="white-text center-align">Sign up today - Start depositing tomorrow</h3>
                                <div className="row">
                                    <div className="textbox col m5">
                                        <h5 className="white-text">Sign Up Requirements</h5>
                                        <p className="white-text">An in-person consultation and product demo are the first step of the sign up process.
                                        Sign up today to be up and running in as little as two weeks.</p>
                                        <div className="center-align">
                                            <Link to="/register" className="waves-effect waves-light landing-btn btn  blue darken-4">Sign Up Now</Link>
                                            {/* <a href="!#" className="waves-effect waves-light landing-btn btn  blue darken-4">More Info</a> */}

                                        </div>
                                    </div>
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
                            © 2019 Copyright Text
                        </div>
                    </div>
                </footer>

            </div >
        );
    }
}

export default Landing;