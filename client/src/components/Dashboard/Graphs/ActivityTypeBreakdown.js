import React from 'react';
import Plot from 'react-plotly.js';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';
import Grid from "@material-ui/core/Grid";
import { Link } from 'react-router-dom';
import LaunchIcon from '@material-ui/icons/Launch';

import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";
import { Card, CardContent, Box, Tooltip } from '@material-ui/core';

class ActivityTypeBreakdown extends React.Component {



    plotGraph() {
        // Grab props
        // let distanceTotal  = this.props.currentTotalsShare.distanceTotal;
        let swimDistanceTotal = this.props.currentTotalsShare.swimDistanceTotal;
        let swimPointsTotal = swimDistanceTotal * 10;
        let bikeDistanceTotal = this.props.currentTotalsShare.bikeDistanceTotal;
        let bikePointsTotal = bikeDistanceTotal;
        let runDistanceTotal = this.props.currentTotalsShare.runDistanceTotal;
        let runPointsTotal = runDistanceTotal * 3;
        // let durationTotal = this.props.currentTotalsShare.durationTotal;
        // let nbrActivities = this.props.currentTotalsShare.nbrActivities;
        // let swimNbrActivities = this.props.currentTotalsShare.swimNbrActivities;
        let swimDurationTotal = this.props.currentTotalsShare.swimDurationTotal;
        // let bikeNbrActivities = this.props.currentTotalsShare.bikeNbrActivities;
        let bikeDurationTotal = this.props.currentTotalsShare.bikeDurationTotal;
        // let runNbrActivities = this.props.currentTotalsShare.runNbrActivities;
        let runDurationTotal = this.props.currentTotalsShare.runDurationTotal
        // let pointsTotal  = swimPointsTotal + bikePointsTotal + runPointsTotal;



        let ultimateColors = [
            ['rgb(0, 153, 255)', 'rgb(255, 0, 0)', 'rgb(51, 204, 50)'],
        ];

        let chartValues = [
            [swimPointsTotal, bikePointsTotal, runPointsTotal],
            [swimDurationTotal, bikeDurationTotal, runDurationTotal]
        ];

        let chartLabels = [
            ["Swim", "Bike", "Run"],
        ]

        let donutHoleSize = .3;

        let data = [
            {
                values: chartValues[0],
                labels: chartLabels[0],
                hoverinfo: 'label+value',
                text: chartLabels[0],
                textposition: 'inside',
                marker: {
                    colors: ultimateColors[0]
                },
                domain: {
                    row: 0,
                    column: 1
                },
                name: 'Points',
                hole: donutHoleSize,
                type: 'pie'
            }
        ];

        let layout = {
            autosize: true,
            margin: {
                l: 4,
                r: 4,
                b: 0,
                t: 0,
                pad: 0
            },
            // paper_bgcolor: '#7f7f7f',
            // plot_bgcolor: '#c7c7c7',

            showlegend: false,
            grid: { rows: 1, columns: 1 },
            annotations: [
                {
                    font: {
                        size: 14
                    },
                    showarrow: false,
                    text: `Points`,
                    x: 0.5,
                    y: 0.5
                },
                // {
                //   font: {
                //     size: 16
                //   },
                //   showarrow: false,
                //   text: 'Miles',
                //   x: 0.82,
                //   y: 0.5
                // }
            ]
        };

        return (
            <Plot
                data={data}
                layout={layout}
                style={{ width: "100%", height: "100%" }}
                useResizeHandler={true}
                config={{ displayModeBar: false }}
            />
        );
    }

    render() {
        const activityBreakdownTitleRow =
            <Box className="row" fontStyle="oblique" fontWeight="fontWeightBold" >
                <div style={{ display: "inline-block", color: "grey" }}>{this.props.title ? this.props.title : 'Totals'}</div>
                <div style={{ display: "inline-block", float: 'right' }}>
                    <Tooltip title="Show Activities">
                        <Link style={{ textDecoration: "none", color: "black" }}
                            to={{
                                pathname: "/activities",
                                state: { filterByString: "Mine" }
                            }}>
                            <LaunchIcon />
                        </Link>
                    </Tooltip>
                </div>
            </Box>
        // Some props take time to get ready so return null when uid not avaialble
        if (!this.props.user) {
            return null;
        }

        if (this.props.user.authUser) {
            return (
                <Card style={{ height: '100%' }}>
                    <CardContent>
                        {activityBreakdownTitleRow}
                        <Grid container justify="center">
                            <Grid item>
                                {this.plotGraph()}
                            </Grid>
                        </Grid>
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

export default withRouter(withAuthUserContext(ActivityTypeBreakdown));