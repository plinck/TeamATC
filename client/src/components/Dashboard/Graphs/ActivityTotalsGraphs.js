import React from 'react';
import Plot from 'react-plotly.js';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';

import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";

class ActivityTotalsGraphs extends React.Component {
    // Dnt need constructor but leave sig in case I need to addd to it
    // constructor(props) {
    //     super(props);

    // }
    
    plotGraph() {
        // Grab props
        let distanceTotal  = this.props.currentTotalsShare.distanceTotal;
        let swimDistanceTotal  = this.props.currentTotalsShare.swimDistanceTotal;
        let swimPointsTotal  = swimDistanceTotal * 10;
        let bikeDistanceTotal  = this.props.currentTotalsShare.bikeDistanceTotal;
        let bikePointsTotal  = bikeDistanceTotal;
        let runDistanceTotal  = this.props.currentTotalsShare.runDistanceTotal;
        let runPointsTotal  = runDistanceTotal * 3;
        let durationTotal = this.props.currentTotalsShare.durationTotal;
        let nbrActivities = this.props.currentTotalsShare.nbrActivities;
        let swimNbrActivities = this.props.currentTotalsShare.swimNbrActivities;
        let swimDurationTotal = this.props.currentTotalsShare.swimDurationTotal;
        let bikeNbrActivities = this.props.currentTotalsShare.bikeNbrActivities;
        let bikeDurationTotal = this.props.currentTotalsShare.bikeDurationTotal;
        let runNbrActivities = this.props.currentTotalsShare.runNbrActivities;
        let runDurationTotal = this.props.currentTotalsShare.runDurationTotal
        let pointsTotal  = swimPointsTotal + bikePointsTotal + runPointsTotal;

        let trace1 = {
            x: ['Activities', 'Points', 'Duration', 'ActualDist'],
            y: [swimNbrActivities, swimPointsTotal, swimDurationTotal, swimDistanceTotal],
            name: 'Swim',
            type: 'bar'
        };
        
        let trace2 = {
            x: ['Activities', 'Points', 'Duration', 'ActualDist'],
            y: [bikeNbrActivities, bikePointsTotal, bikeDurationTotal, bikeDistanceTotal],
            name: 'Bike',
            type: 'bar'
        };
        
        let trace3 = {
            x: ['Activities', 'Points', 'Duration', 'ActualDist'],
            y: [runNbrActivities, runPointsTotal, runDurationTotal, runDistanceTotal],
            name: 'Run',
            type: 'bar'
        };
        
        let trace4 = {
            x: ['Activities', 'Points', 'Duration', 'ActualDist'],
            y: [nbrActivities, pointsTotal, durationTotal, distanceTotal],
            name: 'Total',
            type: 'bar'
        };
        
        let data = [trace1, trace2, trace3, trace4];
        let layout = {barmode: 'stack'};
        
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

    render() {
        // Some props take time to get ready so return null when uid not avaialble
        if (!this.props.user) {
            return null;
        }

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

export default withRouter(withAuthUserContext(ActivityTotalsGraphs));