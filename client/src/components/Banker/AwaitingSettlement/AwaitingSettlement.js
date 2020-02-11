import React from 'react';
import './AwaitingSettlement.css';

const AwaitingSettlement =(props) => {
    return (
        <div>
            <div className="col s12 l4">
                <div className="card">
                    <div className="card-content pCard">
                        <span className="card-title">Deposits Awaiting Settlement</span>
                        <h1 className="awaitingSettlementDisplay">${props.balance.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h1>
                    </div>
                    <div className="card-action pCard">
                        <div className="center-align ">
                            <button onClick={props.settleDeposits}
                                className="awaitingSettlementBtn waves-effect waves-light dash-btn blue darken-4 btn">Settle Deposits
                            </button>{"  "}
                            <button onClick={props.getAwaitingSettlement}
                                className="awaitingSettlementBtn waves-effect waves-light dash-btn blue darken-4 btn">Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AwaitingSettlement;