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

interface RepeatsForUser {
    dates?: Array<Date>,
    displayName: string,
    userRepeats: Array<number>,
    totalRepeats?: number
}
interface RepeatsForDate {
    date?: Date,
    userRepeatInfoArray?: Array<RepeatsForUser>,
    displayNames: Array<string>,
    userRepeats: Array<number>
}

class HillRepeatsTotalsGraph extends React.Component<Props> {
    hillRepeatsListener: any;

    plotGraph() {
        let allRepeatsByDate: Array<RepeatsForDate> = [];
        let allRepeatsByUser: Array<RepeatsForUser> = [];
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
                allRepeatsByDate[idx].displayNames.push(repeat.displayName);
                allRepeatsByDate[idx].userRepeats.push(repeat.repeats);

                const displayNamesIdx = allRepeatsByDate[idx].userRepeatInfoArray.findIndex((userRepeat: RepeatsForUser) => {
                    const foundIdx = userRepeat.displayName === repeat.displayName;
                    return foundIdx;
                });
                if (displayNamesIdx > -1) {       
                    allRepeatsByDate[idx].userRepeatInfoArray[displayNamesIdx].displayName = repeat.displayName;
                    allRepeatsByDate[idx].userRepeatInfoArray[displayNamesIdx].userRepeats.push(repeat.repeats);
                    allRepeatsByDate[idx].userRepeatInfoArray[displayNamesIdx].totalRepeats += repeat.repeats;
                } else {
                    allRepeatsByDate[idx].userRepeatInfoArray.push({
                        displayName: repeat.displayName,
                        userRepeats: [repeat.repeats],
                        totalRepeats: repeat.repeats
                    });
                }
            } else {
                // New
                const displayNames: Array<string> = Array<string>();
                const userRepeats: Array<number> = Array<number>();
                displayNames.push(repeat.displayName);
                userRepeats.push(repeat.repeats);

                const newRepeatsForDate: RepeatsForDate = {
                    date: repeat.repeatDateTime,
                    userRepeatInfoArray: [{displayName: repeat.displayName, userRepeats: userRepeats, totalRepeats: repeat.repeats}],
                    displayNames: displayNames,
                    userRepeats: userRepeats
                }
                allRepeatsByDate.push(newRepeatsForDate);        
            }

            // Now, populate the array of user repeats
            const userIndex = allRepeatsByUser.findIndex((repeatsForOneUser: RepeatsForUser) => {
                const repeatUser = repeat.displayName;

                // cant compare dates since they are never equal
                const foundIdx = repeatUser === repeatsForOneUser.displayName;
                return foundIdx;
            });
            if (userIndex > -1) {       
                // Found, results for this oone so add to it
                allRepeatsByUser[userIndex].displayName = repeat.displayName;
                allRepeatsByUser[userIndex].dates.push(repeat.repeatDateTime);
                allRepeatsByUser[userIndex].userRepeats.push(repeat.repeats);
                allRepeatsByUser[userIndex].totalRepeats += repeat.repeats;
            } else {
                const userRepeats: Array<number> = Array<number>();
                userRepeats.push(repeat.repeats);
                
                allRepeatsByUser.push({
                    dates: [repeat.repeatDateTime],
                    displayName: repeat.displayName,
                    userRepeats: userRepeats,
                    totalRepeats: repeat.repeats
                });
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
        allRepeatsByUser = allRepeatsByUser.sort((a, b) => {
            return (a.displayName > b.displayName) ? 1 : -1;
        });

        const dateRepeatsTrace: Plotly.Data[] = [];

        allRepeatsByDate.forEach((repeat: RepeatsForDate) => {
            const displayDate = moment(repeat.date).format("MM-DD");

            let totalRepeats: Array<string> = [];
            repeat.displayNames.forEach((name: string) => {
                const total = totalDict[name];
                totalRepeats.push(`Total ${total}`);
            });

            // const allDisplayNames = repeat.userRepeatInfoArray.map(userRepeatInfo => {
            //     return userRepeatInfo.displayName;
            // }); 
            // const allUserRepeats = repeat.userRepeatInfoArray.map(userRepeatInfo => {
            //     return userRepeatInfo.userRepeats;
            // }); 

            const trace: Plotly.Data = {
                x: repeat.displayNames,
                y: repeat.userRepeats,
                name: displayDate,
                type: "bar",
                text: totalRepeats,
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