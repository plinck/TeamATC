import React from 'react';
import Plot from 'react-plotly.js';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';

import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";
import { Card, CardContent, Box } from '@material-ui/core';

const PointsBreakdownGraph = (props) => {

    let path = "";
    path = props.totals;

    const plotGraph = () => {

        let teams = path.slice(0, 5).map((team) => team.userOrTeamName)
        let swimPoints = path.slice(0, 5).map(team => team.swimPointsTotal | 0);
        let bikePoints = path.slice(0, 5).map(team => team.bikePointsTotal | 0);
        let runPoints = path.slice(0, 5).map(team => team.runPointsTotal | 0);
        let otherPoints = path.slice(0, 5).map(team => team.otherPointsTotal | 0);

        let trace1 = {
            x: teams,
            y: swimPoints,
            name: 'Swim',
            type: 'bar',
            marker: {
                color: '#0099ff'
            }
        };

        let trace2 = {
            x: teams,
            y: bikePoints,
            name: 'Bike',
            type: 'bar',
            marker: {
                color: "#ff0000"
            }
        };

        let trace3 = {
            x: teams,
            y: runPoints,
            name: 'Run',
            type: 'bar',
            marker: {
                color: "#33cc32"
            }
        };

        let trace4 = {
            x: teams,
            y: otherPoints,
            name: 'Other',
            type: 'bar',
            marker: {
                color: "#ffa500"
            }
        };

        let data = [trace1, trace2, trace3, trace4];
        let layout = {
            barmode: 'stack', autosize: true,
            height: 300,
            margin: {
                l: 30,
                r: 4,
                b: 60,
                t: 20,
                pad: 0
            },
        };

        return (
            <Plot
                data={data}
                layout={layout}
                useResizeHandler={true}
                style={{ width: "100%", height: "100%" }}
                config={{ displayModeBar: false }}
            />
        );
    }

    // Some props take time to get ready so return null when uid not avaialble
    if (!props.user) {
        return null;
    }

    if (props.user.authUser) {
        return (
            <Card style={{ height: "100%" }}>
                <CardContent>
                    <Box className="row" fontStyle="oblique" fontWeight="fontWeightBold">
                        <span style={{ color: 'grey' }}>{props.title ? props.title : 'Totals'}</span>
                    </Box>
                    {plotGraph()}
                </CardContent>
            </Card>
        );
    } else {
        return (
            <Redirect to="/signin" />
        );
    }
}

export default withRouter(withAuthUserContext(PointsBreakdownGraph));