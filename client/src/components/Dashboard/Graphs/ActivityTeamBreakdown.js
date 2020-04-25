import React from 'react';
import Plot from 'react-plotly.js';
import _ from "underscore";
import moment from "moment";
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';

import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";

class ActivityTeamBreakdown extends React.Component {
            
    plotGraph() {
        // Grab props
        let distanceTotal  = this.props.currentTotalsShare.distanceTotal;
        let durationTotal = this.props.currentTotalsShare.durationTotal;
        let nbrActivities = this.props.currentTotalsShare.nbrActivities;
        let pointsTotal  = swimPointsTotal + bikePointsTotal + runPointsTotal;
        let swimDistanceTotal  = this.props.currentTotalsShare.swimDistanceTotal;
        let swimPointsTotal  = swimDistanceTotal * 10;
        let swimNbrActivities = this.props.currentTotalsShare.swimNbrActivities;
        let swimDurationTotal = this.props.currentTotalsShare.swimDurationTotal;
        let bikeDistanceTotal  = this.props.currentTotalsShare.bikeDistanceTotal;
        let bikePointsTotal  = bikeDistanceTotal;
        let bikeNbrActivities = this.props.currentTotalsShare.bikeNbrActivities;
        let bikeDurationTotal = this.props.currentTotalsShare.bikeDurationTotal;
        let runNbrActivities = this.props.currentTotalsShare.runNbrActivities;
        let runDurationTotal = this.props.currentTotalsShare.runDurationTotal
        let runDistanceTotal  = this.props.currentTotalsShare.runDistanceTotal;
        let runPointsTotal  = runDistanceTotal * 3;
        let otherDistanceTotal  = this.props.currentTotalsShare.otherDistanceTotal;
        let otherPointsTotal  = otherDistanceTotal;
        let otherNbrActivities = this.props.currentTotalsShare.otherNbrActivities;
        let otherDurationTotal = this.props.currentTotalsShare.otherDurationTotal;
      
        

        let ultimateColors = [
            ['rgb(0, 153, 255)', 'rgb(255, 0, 0)', 'rgb(51, 204, 50)', 'rgb(100, 65, 0)'],
          ];

        let chartValues = [
            [swimDistanceTotal, bikeDistanceTotal, runDistanceTotal, otherDistanceTotal],
            [swimDurationTotal, bikeDurationTotal, runDurationTotal, otherDistanceTotal]
        ];

        let chartLabels = [
            ["Swim", "Bike", "Run", "Other"],
        ]

        let data = [
            {
                values: chartValues[0],
                labels: chartLabels[0],
                type: 'pie',
                hoverinfo: 'label+value',
                name: 'Distance',
                //mode: 'markers+text',
                text: chartLabels[0],
                textposition: 'inside',
                marker: {
                    colors: ultimateColors[0]
                },    
                domain: {
                    row: 0,
                    column: 0
                }                  
            },
            {
                values: chartValues[1],
                labels: chartLabels[0],
                type: 'pie',
                hoverinfo: 'label+value',
                name: 'Duration',
                text: chartLabels[0],
                textposition: 'inside',
                marker: {
                    colors: ultimateColors[0]
                }, 
                domain: {
                    row: 0,
                    column: 1
                }                        
            }
        ];
            
        let layout = {
            title: {text: "Distance / Duration"},
            height: 350,
            width: 350,
            margin: {t: 30, b: 30, l: 30, r: 30, pad : 0},
            showlegend: false,
            grid: {rows: 1, columns: 2},
        };
                
        return (
            <Plot
                data={data}
                layout={layout}
                style={{ width: "100%", height: "100%" }}
                config={{ displayModeBar: false }}
            />
        );
    }

    render() {
        // Some props take time to get ready so return null when uid not avaialble
        if (!this.props.user) {
            return null;
        }

        const displayName = this.props.user.displayName;

        if (this.props.user.authUser) {
            return (
                <div>
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title">{this.props.title ? this.props.title : 'Totals'}</span>
                            {this.plotGraph()}
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

export default withRouter(withAuthUserContext(ActivityTeamBreakdown));