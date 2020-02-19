import React from "react";
import { Link } from "react-router-dom";
import Plot from "react-plotly.js";
import _ from "underscore";
import moment from "moment";
import { Redirect } from "react-router";
import { withRouter } from "react-router-dom";

import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";

class ActivityByDay extends React.Component {
    plotActivities = (uid) => {
        const selectorOptions = {
            buttons: [
                {
                    step: "day",
                    stepmode: "backward",
                    count: 7,
                    label: "1w"
                }, {
                    step: "month",
                    stepmode: "backward",
                    count: 1,
                    label: "1m"
                }, {
                    step: "month",
                    stepmode: "backward",
                    count: 6,
                    label: "6m"
                }, {
                    step: "year",
                    stepmode: "todate",
                    count: 1,
                    label: "YTD"
                }, {
                    step: "year",
                    stepmode: "backward",
                    count: 1,
                    label: "1y"
                }, {
                    step: "all",
                }]
        };

        let combiedData = this.props.activities;

        const sortedByDate = combiedData.sort((a, b) => {
            return (a.activityDateTime > b.activityDateTime) ? 1 : -1;
        });

        // split activities by day into object with all activities for each day
        let groups = _.groupBy(sortedByDate, (activity) => {
            let jsDate = new Date(activity.activityDateTime);
            return moment(jsDate).startOf("day").format();
        });

        // turn complex object into array by day with total for the day and each days activities (for stacking later)
        var dayActivities = _.map(groups, (activity, day) => {
            let totalObj = activity.reduce((a, b) => {
                return ({ distance: a.distance + b.distance });
            });
            let total = totalObj.distance;
            return {
                day: day,
                total: total,
                times: activity
            };
        });
        // console.log(dayActivities);

        // convert to javascript date object so plotly can recognize it as a proper date
        const days = dayActivities.map((activity) => {
            let jsDate = new Date(activity.day);
            // Convert to just day without time
            let month = "" + (jsDate.getMonth() + 1);
            let day = "" + jsDate.getDate();
            let year = jsDate.getFullYear();

            if (month.length < 2) month = "0" + month;
            if (day.length < 2) day = "0" + day;

            return [year, month, day].join("-");
        });

        const earliestDate = days.length > 0 ? days[0] : new Date();
        const latestDate = days.length > 0 ? days[days.length - 1] : new Date();

        const distances = dayActivities.map((activity) => {
            return (activity.total);
        });

        const formattedDistance = distances.map(distance => distances.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

        // STILL NEED To stack all activities for that day

        return (
            <Plot
                data={[
                    {
                        type: "bar",
                        mode: "stack",
                        name: "Activities by Day",
                        x: days,
                        y: distances,
                        marker: { color: "rgb(13, 71, 161)" },
                        "hoverinfo": "text",
                        "line": { "width": 0.5 },
                        text: formattedDistance,
                    },
                ]}
                layout={
                    {
                        autosize: true,
                        /* title: "Activities By User" */
                        xaxis: {
                            autorange: true,
                            range: [earliestDate, latestDate],
                            rangeselector: selectorOptions,
                            rangeslider: { earliestDate, latestDate },
                        },
                        yaxis: {
                            tickprefix: "$",
                            separatethousands: true
                        },
                        margin: {
                            l: 60,
                            r: 20,
                            b: 10,
                            t: 10,
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
            pathname: "/activities"
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
                                <span className="card-title">{this.props.title ? this.props.title : "ActivityByDay"}</span>
                            </div>
                            <div className="card-action pCard">
                                <div className="center-align">
                                    <Link to="/activities" className="waves-effect waves-light dash-btn blue darken-4 btn activityBtn">More Details</Link>

                                </div>
                            </div>
                        </div>
                    </div>
                    {/*}
                    <div className="col s12 l6">
                        <div className="card">
                            <div className="card-content pCard">
                                <span className="card-title">{this.props.title ? this.props.title : "ActivityByDay"}</span>
                                {this.plotActivities()}
                            </div>
                            <div className="card-action pCard">
                                <div className="center-align">
                                    <button onClick={this.viewDetails} className="waves-effect waves-light dash-btn blue darken-4 btn">More Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    */}
                </div>
            );
        } else {
            return (
                <Redirect to="/signin" />
            );
        }
    }
}

export default withRouter(withAuthUserContext(ActivityByDay));