import React from 'react';
import './provisionalCredit.css';
// import { Link, Route } from 'react-router-dom';

const ProvisionalCredit = (props) => {


    var date = new Date();
    var time = new Date(date.getTime());
    time.setMonth(date.getMonth() + 1);
    time.setDate(0);
    var days = time.getDate() > date.getDate() ? time.getDate() - date.getDate() : "Bill Due Today";


    return (
        <div>
            <div className="col s12 l4">
                <div className="card">
                    <div className="card-content pCard">
                        <span className="card-title">Provisional Credit</span>
                        <h1 className="displayCredit">${props.credit.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                    </div>
                    <div className="card-action pCard">
                        <div className="center-align">
                            {/* <Link to="dashboard/payment" className="waves-effect waves-light dash-btn blue darken-4 btn">Pay Balance</Link> */}
                            <p>Days remianing in current cycle: </p>
                            <h5>{days}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProvisionalCredit;