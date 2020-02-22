import React from 'react';
import Plot from 'react-plotly.js';
import _ from "underscore";
import moment from "moment";
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';

import { withAuthUserContext } from "../../Auth/Session/AuthUserContext";

class SampleClassGraphCard extends React.Component {
            
    plotGraph() {
        let trace1 = {
            x: ['Activities', 'Distance', 'Duration'],
            y: [20, 14, 23],
            name: 'Swim',
            type: 'bar'
        };
        
        let trace2 = {
            x: ['Activities', 'Distance', 'Duration'],
            y: [12, 18, 29],
            name: 'Bike',
            type: 'bar'
        };
        
        let trace3 = {
            x: ['Activities', 'Distance', 'Duration'],
            y: [6, 42, 17],
            name: 'Run',
            type: 'bar'
        };
        
        let data = [trace1, trace2, trace3];
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

export default withRouter(withAuthUserContext(SampleClassGraphCard));