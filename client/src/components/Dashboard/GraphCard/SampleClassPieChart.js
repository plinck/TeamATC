import React from 'react';
import Plot from 'react-plotly.js';
import _ from "underscore";
import moment from "moment";
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';

import { withContext } from "../../Auth/Session/Context";

class stravangrokClassPieChart extends React.Component {
            
    plotGraph() {

        let ultimateColors = [
            ['rgb(0, 153, 255)', 'rgb(255, 0, 0)', 'rgb(51, 204, 50)'],
          ];

        let chartValues = [
            [12, 145, 39],
            [8, 9, 12]
        ];

        let chartLabels = [
            ["Swim", "Bike", "Run"],
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
        if (!this.props.context) {
            return null;
        }

        const displayName = this.props.context.displayName;

        if (this.props.context.authUser) {
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

export default withRouter(withContext(stravangrokClassPieChart));