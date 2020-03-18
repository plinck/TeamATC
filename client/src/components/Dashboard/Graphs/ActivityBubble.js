import React from 'react';
import Plot from 'react-plotly.js';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';
import ActivityBubbleModal from './ActivityBubbleModal';
import { Card, CardContent, Box } from '@material-ui/core';


import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";

class ActivityBubble extends React.Component {

    state = {
        clickedDistance: 0,
        clickedDate: 0,
        open: false
    }


    plotActivities = () => {
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
                }]
        };

        console.log(this.props)
        let activities = this.props.activities;
        let adjustedActivites = activities.map(activity => {
            let distance = activity.distance;
            if (activity.distanceUnits === "Yards") {
                distance = activity.distance / 1760;
            }
            switch (activity.activityType) {
                case "Swim":
                    distance *= 10;
                    break;
                case "Run":
                    distance *= 3;
                    break;
                default:
                    break;
            }
            return { distance: distance, duration: activity.duration, displayName: activity.displayName };
        })

        let xData = activities.map(activity => new Date(activity.activityDateTime));
        let yData = adjustedActivites.map(activity => {
            return activity.distance;
        });

        let size = adjustedActivites.map(activity => (activity.distance * 1));
        let hover = adjustedActivites.map(activity => `${activity.displayName} ${activity.distance.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
        let groups = activities.map(activity => activity.activityType);
        // let groups = activities.map(activity => {
        //     const userInitials = activity.displayName.length > 1 ? activity.displayName.substring(0, 2) : "NN";
        //     return(userInitials);
        // });

        const latestDate = new Date().toISOString().split('T')[0];
        var d = new Date();
        d.setDate(d.getDate() - 30);
        let earliestDate = d.toISOString().split('T')[0];


        return (
            <div>
                <ActivityBubbleModal open={this.state.open} displayInfo={this.state.clickedDistance} date={this.state.clickedDate} />
                <Plot
                    data={[
                        {
                            type: 'scatter',
                            mode: 'markers',
                            x: xData,
                            y: size,
                            text: hover,
                            "hoverinfo": "text",
                            marker: {
                                size: yData,
                                sizemode: "area",
                                sizeref: .09
                            },
                            transforms: [{
                                type: 'groupby',
                                groups: groups,
                                styles: [
                                    { target: 'Bike', value: { marker: { color: '#ff0000' } } },
                                    { target: 'Swim', value: { marker: { color: '#0099ff' } } },
                                    { target: 'Run', value: { marker: { color: '#33cc32' } } },

                                ]
                            },]
                        }]}
                    layout={
                        {
                            autosize: true,
                            xaxis: {
                                autorange: false,
                                range: [earliestDate, latestDate],
                                rangeselector: selectorOptions,

                            },
                            yaxis: {
                                autorange: true
                            },
                            showlegend: true,
                            margin: {
                                l: 30,
                                r: 30,
                                b: 20,
                                t: 20,
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
                            clickedDistance: data.points[0].text,
                            clickedDate: data.points[0].x,
                            clickedEmail: hover,
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
                <Card>
                    <CardContent>
                        <Box className="row" fontStyle="oblique" fontWeight="fontWeightBold">
                            <span style={{ color: 'grey' }}>{this.props.title ? this.props.title : 'Activity Heat Map'}</span>
                        </Box>
                        {this.plotActivities()}
                    </CardContent>
                </Card>
            );
        } else {
            return (
                <Redirect to="/signin" />
            );
        }
    }
}

export default withRouter(withAuthUserContext(ActivityBubble));