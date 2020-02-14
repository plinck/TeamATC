import React from 'react';
import './SummaryTotal.css'
import { Link } from 'react-router-dom';


const SummaryTotal =(props) => {
    return (
        <div>
            <div className="row">
                <div className="col s12 l4">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title">Total Activities</span>
                            <h1 className="displayTotal">{props.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                        </div>
                        <div className="card-action pCard">
                            <div className="center-align ">
                                <Link disabled={props.disabled} to="/activityform" className="waves-effect waves-light dash-btn blue darken-4 btn activityBtn">New Activity</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col s12 l4">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title">Total Distance</span>
                            <h1 className="displayTotal">{props.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                            <div className="center-align">Miles</div>
                        </div>
                        <div className="card-action pCard">
                            <div className="center-align ">
                                <Link disabled={props.disabled} to="/activityform" className="waves-effect waves-light dash-btn blue darken-4 btn activityBtn">New Activity</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col s12 l4">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title">Total Duration</span>
                            <h1 className="displayTotal">{props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                            <div className="center-align">Hours</div>
                        </div>
                            <div className="card-action pCard">
                            <div className="center-align ">
                                <Link disabled={props.disabled} to="/activityform" className="waves-effect waves-light dash-btn blue darken-4 btn activityBtn">New Activity</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SummaryTotal;