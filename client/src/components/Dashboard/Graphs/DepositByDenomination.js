import React from 'react';
import Plot from 'react-plotly.js';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';

import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";

class DepositByAll extends React.Component {



    plotDeposits = () => {
        let combinedData = this.props.deposits.concat(this.props.depositsArchive);
        
        let ones = combinedData.map(deposit => deposit.ones).reduce((total, currentValue) => total + currentValue, 0);
        let fives = combinedData.map(deposit => deposit.fives).reduce((total, currentValue) => total + currentValue, 0);
        let tens = combinedData.map(deposit => deposit.tens).reduce((total, currentValue) => total + currentValue, 0);
        let twenties = combinedData.map(deposit => deposit.twenties).reduce((total, currentValue) => total + currentValue, 0);
        let fifties = combinedData.map(deposit => deposit.fifties).reduce((total, currentValue) => total + currentValue, 0);
        let hundreds = combinedData.map(deposit => deposit.hundreds).reduce((total, currentValue) => total + currentValue, 0);

        // delays props and solves errors
        if (!ones) {
            return null;
        }



        return (
            <Plot
                data={[
                    {
                        "hoverinfo": "label+value",
                        "marker": { "size": 8, color: 'rgb(13, 71, 161)' },
                        type: 'pie',
                        name: 'Deposits By Denomination',
                        values: [ones, fives, tens, twenties, fifties, hundreds],
                        labels: ["$1", "$5", "$10", "$20", "$50", "$100"],
                        "textfont": {
                            color: 'white'
                        },
                    },
                ]}
                layout={
                    {
                        autosize: true,
                        showlegend: false,
                        margin: {
                            l: 50,
                            r: 50,
                            b: 50,
                            t: 50,
                        }
                    }
                }
                useResizeHandler={true}
                style={{ width: "100%", height: "100%" }}
                config={{ displayModeBar: false }}

            />
        );
    }


    // go to details
    viewDetails = () => {
        this.props.history.push({
            pathname: '/depositlist'
        });
    }

    render() {
        // Some props take time to get ready so return null when uid not avaialble
        if (!this.props.user) {
            return null;
        }

        if (this.props.user.authUser) {
            return (
                <div>
                    <div className="col s12 l6">
                        <div className="card">
                            <div className="card-content pCard">
                                <span className="card-title">{this.props.title}</span>
                                {this.plotDeposits()}
                            </div>
                            <div className="card-action pCard">
                                <div className="center-align">
                                    <button onClick={this.viewDetails} className="waves-effect waves-light dash-btn blue darken-4 btn">More Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <Redirect to="/signin" />
            );
        }
    }
}

export default withRouter(withAuthUserContext(DepositByAll));