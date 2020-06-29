import React from 'react';
import moment from "moment";

import Plot from 'react-plotly.js';
import Box from '@material-ui/core/Box';
import { Card, CardContent, Tooltip } from '@material-ui/core';
import LaunchIcon from '@material-ui/icons/Launch';

import { withContext } from "../../Auth/Session/Context";
import { ContextType } from "../../../interfaces/Context.Types";
import { HillRepeat } from "../../../interfaces/HillRepeat";

interface OwnProps {
    hillRepeats: Array<HillRepeat>;
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
    hillRepeatsListener: any;

    plotGraph() {
        let allRepeatsByDate: Array<RepeatsForDate> = [];

        this.props.hillRepeats.forEach((repeat: HillRepeat) => {
            // find the index of the date in the array
            const idx = allRepeatsByDate.findIndex((repeatsForOneDate: RepeatsForDate) => {
                const foundIdx = repeatsForOneDate.date === repeat.repeatDateTime;
                return foundIdx;
            });
            if (idx > -1) {       
                // Found, results for this oone so add to it
                allRepeatsByDate[idx].date = repeat.repeatDateTime;  // redudant
                allRepeatsByDate[idx].userNames.push(repeat.displayName);
                allRepeatsByDate[idx].userRepeats.push(repeat.repeats);
            } else {
                // New
                const userNames: Array<string> = Array<string>();
                const userRepeats: Array<number> = Array<number>();
                userNames.push(repeat.displayName);
                userRepeats.push(repeat.repeats);

                const newRepeatsForDate: RepeatsForDate = {
                    date: repeat.repeatDateTime,
                    userNames: userNames,
                    userRepeats: userRepeats
                }
                allRepeatsByDate.push(newRepeatsForDate);    
            }
        });

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