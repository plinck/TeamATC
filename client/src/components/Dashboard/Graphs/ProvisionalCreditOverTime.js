import React from 'react';
import Plot from 'react-plotly.js';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';


import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";

class ProvisionalCreditOverTime extends React.Component {
    plotDeposits = () => {
        const selectorOptions = {
            buttons: [
                {
                    step: 'day',
                    stepmode: 'backward',
                    count: 7,
                    label: '1w'
                }, {
                    step: 'month',
                    stepmode: 'backward',
                    count: 1,
                    label: '1m'
                }, {
                    step: 'month',
                    stepmode: 'backward',
                    count: 6,
                    label: '6m'
                }, {
                    step: 'year',
                    stepmode: 'todate',
                    count: 1,
                    label: 'YTD'
                }, {
                    step: 'year',
                    stepmode: 'backward',
                    count: 1,
                    label: '1y'
                }, {
                    step: 'all',
                }]
        };


        let lines = [];

        // console.log(archivedData);

        let combiedData = this.props.balance.filter(data => data.time);

        
        const sortedByDate = combiedData.sort((a, b) => {
            return (a.time > b.time) ? 1 : -1;
        });

        const times = sortedByDate.map((activity) => {
            return (new Date(activity.time));
        });

        const balances = sortedByDate.map((activity) => {
            return (activity.balance);
        });


        const formattedAmounts = balances.map(balance => "$" + balance.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

        lines.push({
            "hoverinfo": "text",
            line: { width: 2.5 },
            type: 'scatter',
            mode: 'lines',
            name: "Provisional Credit Over Time",
            x: times,
            y: balances,
            text: formattedAmounts
        });


        const earliestDate = times.length > 0 ? times[0] : new Date();
        const latestDate = times.length > 0 ? times[times.length - 1] : new Date();


        return (
            <Plot
                data={lines}
                layout={
                    {
                        autosize: true,
                        xaxis: {
                            autorange: true,
                            range: [earliestDate, latestDate],
                            rangeselector: selectorOptions,
                            rangeslider: { earliestDate, latestDate },
                        },
                        margin: {
                            l: 50,
                            r: 50,
                            b: 10,
                            t: 10,
                        },
                        yaxis: {
                            tickprefix: "$",
                            separatethousands: true
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
            pathname: '/activities'
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
                                <span className="card-title">{this.props.title ? this.props.title : 'DepositByAll'}</span>
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

export default withRouter(withAuthUserContext(ProvisionalCreditOverTime));