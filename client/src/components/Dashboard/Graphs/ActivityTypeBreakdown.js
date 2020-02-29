import React from 'react';
import Plot from 'react-plotly.js';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';
import Grid from "@material-ui/core/Grid";

import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";

class ActivityTypeBreakdown extends React.Component {
            
    plotGraph() {
        // Grab props
        // let distanceTotal  = this.props.currentTotalsShare.distanceTotal;
        let swimDistanceTotal  = this.props.currentTotalsShare.swimDistanceTotal;
        let swimPointsTotal  = swimDistanceTotal * 10;
        let bikeDistanceTotal  = this.props.currentTotalsShare.bikeDistanceTotal;
        let bikePointsTotal  = bikeDistanceTotal;
        let runDistanceTotal  = this.props.currentTotalsShare.runDistanceTotal;
        let runPointsTotal  = runDistanceTotal * 3;
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
                hole:  donutHoleSize,          
                type: 'pie'
            }
        ];
            
        let layout = {
            height: 275,
            width: 275,
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
            grid: {rows: 1, columns: 1},
            annotations: [
                {
                  font: {
                    size: 16
                  },
                  showarrow: false,
                  text: 'Points',
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
        // Some props take time to get ready so return null when uid not avaialble
        if (!this.props.user) {
            return null;
        }

        if (this.props.user.authUser) {
            return (
                <Grid container justify="center">
                    <div className="card" justify="center">
                        <div className="card-content pCard">
                            <span className="card-title">{this.props.title ? this.props.title : 'Totals'}</span>
                            {this.plotGraph()}
                        </div>
                    </div>
                </Grid>
            );
        } else {
            return (
                <Redirect to="/signin" />
            );
        }
    }
}

export default withRouter(withAuthUserContext(ActivityTypeBreakdown));