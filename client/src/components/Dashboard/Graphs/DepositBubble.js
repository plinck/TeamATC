import React from 'react';
import Plot from 'react-plotly.js';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';
import DepositModal from './DepositModal';


import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";

class DepositByAll extends React.Component {

    state = {
        clickedAmount: 0,
        clickedDate: 0,
        open: false
    }


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



        let combiedData = this.props.activities.concat(this.props.depositsArchive);

        let xData = combiedData.map(activity => new Date(activity.time));

        let yData = combiedData.map(activity => {
            let bills = 0;
            bills = activity.ones + activity.fives + activity.tens + activity.twenties + activity.fifties + activity.hundreds;
            return bills;
        });

        let size = combiedData.map(activity => activity.amount);

        let hover = size.map(amount => "$" + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

        let groups = combiedData.map(activity => activity.email);

        return (
            <div>
                <DepositModal open={this.state.open} amount={this.state.clickedAmount} date={this.state.clickedDate}/>
                <Plot
                    data={[
                        {
                            type: 'scatter',
                            mode: 'markers',
                            x: xData,
                            y: yData,
                            text: hover,
                            "hoverinfo": "text",
                            marker: {
                                size: size,
                                sizemode: "area",
                                sizeref: .7
                            },
                            transforms: [{
                                type: 'groupby',
                                groups: groups,
                            }]
                        }]}
                    layout={
                        {
                            autosize: true,
                            xaxis: {
                                autorange: true,
                                rangeselector: selectorOptions,
                            },
                            showlegend: true,
                            margin: {
                                l: 50,
                                r: 50,
                                b: 30,
                                t: 10,
                            },
                            // yaxis: {
                            //     tickprefix: "$",
                            //     separatethousands: true
                            // }
                        }
                    }
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%" }}
                    config={{ displayModeBar: false }}
                    onClick={('plotly_click', (data) => {

                        this.setState({
                            clickedAmount: data.points[0].text,
                            clickedDate: data.points[0].x,
                            open: true
                        });

                    })}
                />
            </div>
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
                    <div className="col s12 l12">
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

export default withRouter(withAuthUserContext(DepositByAll));