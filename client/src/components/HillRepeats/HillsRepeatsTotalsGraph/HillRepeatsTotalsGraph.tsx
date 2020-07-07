/*tslint:disable:no-import-side-effect*/
/*tslint:disable:no-submodule-imports*/
/*tslint:disable:no-implicit-dependencies */
/*tslint:disable:object-literal-shorthand */
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

// Must keep userRepeatData together for sorting
interface RepeatsForDate {
    date?: Date,
    userRepeatData?: Array<{displayName: string, nbrRepeats: number, totalRepeats?: number}>
}

class HillRepeatsTotalsGraph extends React.Component<Props> {
    hillRepeatsListener: any;

    plotGraph() {
        let allRepeatsByDate: Array<RepeatsForDate> = [];
        const totalDict: any = {};

        this.props.hillRepeats.forEach((repeat: HillRepeat) => {
            // find the index of the date in the array
            const idx = allRepeatsByDate.findIndex((repeatsForOneDate: RepeatsForDate) => {
                const repeatsForOneDateStartOfDate = moment(repeatsForOneDate.date).startOf("day").toDate();
                const repeatStartOfDate = moment(repeat.repeatDateTime).startOf("day").toDate();

                // cant compare dates since they are never equal
                const foundIdx = repeatsForOneDateStartOfDate.getTime() === repeatStartOfDate.getTime();
                return foundIdx;
            });
            if (idx > -1) {       
                // Found, results for this oone so add to it
                allRepeatsByDate[idx].date = repeat.repeatDateTime;  // redudant

                allRepeatsByDate[idx].userRepeatData.push({displayName: repeat.displayName, nbrRepeats: repeat.repeats, totalRepeats: 0});

            } else {
                // New
                const displayNames: Array<string> = Array<string>();
                const userRepeats: Array<number> = Array<number>();
                displayNames.push(repeat.displayName);
                userRepeats.push(repeat.repeats);

                const newRepeatsForDate: RepeatsForDate = {
                    date: repeat.repeatDateTime,

                    userRepeatData: [{displayName: repeat.displayName, nbrRepeats: repeat.repeats, totalRepeats: 0}]
                }
                allRepeatsByDate.push(newRepeatsForDate);        
            }

            // compute user totals and put in dictionary to display in graph
            let newUserRepeats = repeat.repeats;
            if (totalDict[repeat.displayName]) {
                newUserRepeats += totalDict[repeat.displayName];
            }
            totalDict[repeat.displayName] = newUserRepeats;

        });

        allRepeatsByDate = allRepeatsByDate.sort((a, b) => {
            return (a.date > b.date) ? 1 : -1;
        });

        const dateRepeatsTrace: Plotly.Data[] = [];

        allRepeatsByDate.forEach((repeat: RepeatsForDate) => {
            const displayDate = moment(repeat.date).format("MM-DD");

            repeat.userRepeatData = repeat.userRepeatData.map((userRepeat: any) => {
                const total = totalDict[userRepeat.displayName];
                let newUserRepeat = userRepeat;
                newUserRepeat.totalRepeats = total;
                return newUserRepeat;
            });

            // Getting sum of numbers
            repeat.userRepeatData = repeat.userRepeatData.sort((a,b) => {
                return (a.totalRepeats < b.totalRepeats) ? 1 : -1;
            });

            const trace: Plotly.Data = {
                x: repeat.userRepeatData.map(userRepeat => userRepeat.displayName),
                y: repeat.userRepeatData.map(userRepeat => userRepeat.nbrRepeats),
                name: displayDate,
                type: "bar",
                text: repeat.userRepeatData.map(userRepeat => `Total ${userRepeat.totalRepeats}`),
                hovertemplate: '<i>Repeats</i>: %{y}' +
                    '<br> %{text}'
            } 
            dateRepeatsTrace.push(trace);
        });

        const data: Plotly.Data[] = dateRepeatsTrace;
        const layout: Plotly.Layout & any = { 
            barmode: 'stack',
         };        
        
        return (
            <Plot
                data={data}
                layout={layout}
                useResizeHandler={true}
                style={{ width: "100%", height: "100%" }}
                config={{
                    displaylogo: false,
                    responsive: true,
                    displayModeBar: true,
                    scrollZoom: true,
                    modeBarButtonsToRemove: ['select2d', 'lasso2d',
                        "hoverClosestCartesian", "hoverCompareCartesian",
                        "sendDataToCloud", "toggleSpikelines"
                    ]
                }}
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