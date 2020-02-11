import React from 'react';
import './SettledDeposits.css';

const SettledDeposits =(props) => {
    return (
        <div>
            <div className="col s12 l4">
                <div className="card">
                    <div className="card-content pCard">
                        <span className="card-title">Settled Deposits</span>
                        <h1 className="settledDepositsDisplay">${props.balance.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                    </div>
                    <div className="card-action pCard">
                        <div className="center-align ">
                            <button onClick={props.getSettledDeposits}
                                className="settledDepositsBtn waves-effect waves-light dash-btn blue darken-4 btn">Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettledDeposits;