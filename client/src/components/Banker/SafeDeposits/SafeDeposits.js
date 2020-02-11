import React from 'react';
import './SafeDeposits.css';

const SafeDeposits =(props) => {
    return (
        <div>
            <div className="col s12 l4">
                <div className="card">
                    <div className="card-content pCard">
                        <span className="card-title">Deposits in Safe</span>
                        <h1 className="safeDepositDisplay">${props.balance.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                    </div>
                    <div className="card-action pCard">
                        <div className="center-align ">
                            <button onClick={props.sendDepositsToBank}
                                className="safeDepositBtn waves-effect waves-light dash-btn blue darken-4 btn">Send Cash to Bank
                            </button>{" "}
                            <button onClick={props.getInSafeDeposits}
                                className="safeDepositBtn waves-effect waves-light dash-btn blue darken-4 btn">Details
                            </button>{" "}
                            <button onClick={props.generateDepositTestData}
                                className="safeDepositBtn waves-effect waves-light dash-btn blue darken-4 btn">Create Test Deposits
                            </button>{" "}
                            <button onClick={props.reverseSafeDeposits}
                                className="safeDepositBtn waves-effect waves-light dash-btn blue darken-4 btn">Reverse Deposits
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafeDeposits;