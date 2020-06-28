import React from 'react';
import moment from "moment";

import Plot from 'react-plotly.js';
import Box from '@material-ui/core/Box';
import { Card, CardContent, Tooltip } from '@material-ui/core';
import LaunchIcon from '@material-ui/icons/Launch';

import { withContext } from "../../Auth/Session/Context";
import { ContextType } from "../../../interfaces/Context.Types";

interface OwnProps {
    repeats: Array<any>;
}

interface ContextProps {
    context: ContextType;
  }  

// Exposed to user's of component - not styles
type PublicProps = OwnProps;
type Props = PublicProps & ContextProps & any;

interface RepeatsForDate {
    date?: Date,
    userNames: Array<string>,
    userRepeats: Array<number>
}

class HillRepeatsTotalsGraph extends React.Component<Props> {
    
    plotGraph() {
        let allRepeatsByDate: Array<RepeatsForDate> = [
            {
                date: new Date('06/03/2020'),
                userNames: ['Paul', "Jerome", "Jessica"],
                userRepeats: [5, 8, 10]
            },
            {
                date: new Date('06/10/2020'),
                userNames: ['Paul', "Jerome", "Steph", "Jessica"],
                userRepeats: [8, 2, 9, 11]
            },
            {
                date: new Date('06/17/2020'),
                userNames: ['Paul', "Jerome", "Steph", "Jessica"],
                userRepeats: [9, 6, 9, 12]
            },
            {
                date: new Date('06/24/2020'),
                userNames: ['Paul', "Jerome", "Steph", "Jessica"],
                userRepeats: [16, 5, 8, 12]
            },
            {
                date: new Date('07/01/2020'),
                userNames: ['Paul', "Jerome", "Steph"],
                userRepeats: [12, 4, 7]
            },
            {
                date: new Date('07/08/2020'),
                userNames: ['Paul', "Jerome", "Steph", "Jessica"],
                userRepeats: [16, 5, 8, 12]
            },
        ]

        let dateRepeatsTrace: Plotly.Data[] = [];

        allRepeatsByDate.forEach((repeat: RepeatsForDate) => {
            const displayDate = moment(repeat.date).format("MM-DD");

            const trace: Plotly.Data = {
                x: repeat.userNames,
                y: repeat.userRepeats,
                name: displayDate,
                type: "bar"
            } 
            dateRepeatsTrace.push(trace);
        });

        let data: Plotly.Data[] = dateRepeatsTrace;
        let layout:Plotly.Layout & any = {barmode: 'stack'};
        
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

    handleClick = () => {
        // test
    }

    render() {
        // Some props take time to get ready so return null when uid not avaialble
        if (!this.props.context || !this.props.context.authUser) {
            return null;
        }

        return (
            <Card style={{ height: '100%' }}>
                <CardContent>
                    <Box className="row" m={2} fontStyle="oblique" fontWeight="fontWeightBold">
                        <Tooltip title="Totals">
                            <span onClick={this.handleClick}>
                                Totals
                            </span>
                        </Tooltip>
                        <div style={{ float: 'right' }}>
                            <Tooltip title="Show All Totals">
                                <div onClick={this.handleClick}>
                                    <LaunchIcon />
                                </div>
                            </Tooltip>
                        </div>
                        <div className="card-content pCard">
                            {this.plotGraph()}
                        </div>
                    </Box>   
                </CardContent>
            </Card> 
        );
    }
}

export default withContext(HillRepeatsTotalsGraph);