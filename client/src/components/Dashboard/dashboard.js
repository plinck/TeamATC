import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { withStyles } from '@material-ui/core/styles';
import CalculateTotals from "./CalculateTotals/CalculateTotals.js"
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Redirect } from "react-router";
import ResultsCard from "./ResultsCard/ResultsCard";
import ActivitiesCard from './ActivitiesCard/ActivitiesCard';
import ActivityBubble from "./Graphs/ActivityBubble";
import ActivityByDay from "./Graphs/ActivityByDay";
import ActivityTypeBreakdown from "./Graphs/ActivityTypeBreakdown";
import PointsBreakdownGraph from './Graphs/PointsBreakdown';
import { Container, Grid, CircularProgress } from '@material-ui/core'
import Util from "../Util/Util";
import GoogleMap from './GoogleMap/GoogleMap';
import TeamWidget from './TeamWidget/TeamWidget';


const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || {};

const styles = theme => ({
    root: {
        [theme.breakpoints.up('md')]: {
            marginLeft: "57px",
        },
        paddingTop: "10px"
    },
    bubble: {
        [theme.breakpoints.down('md')]: {
            display: "none"
        },
    },
    card: {
        height: "100%"
    }
});

class Dashboard extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            layouts: JSON.parse(JSON.stringify(originalLayouts)),
            loadingFlag: true,
            activities: [],
            myActivities: [],
            totals: {},
        };
    }

    static get defaultProps() {
        return {
            className: "layout",
            cols: { lg: 12, md: 12, sm: 4, xs: 4, xxs: 2 },
            rowHeight: 30
        };
    }
    onChildChanged() {
        this.setState({ isDraggable: false })
    }

    activeListener = undefined;

    resetLayout() {
        this.setState({ layouts: {} })
    }


    onLayoutChange(layout, layouts) {
        saveToLS("layouts", layouts);
        this.setState({ layouts });
    }

    createListener(challengeUid) {
        let allDBRefs = Util.getChallengeDependentRefs(challengeUid);
        const dbActivitiesRef = allDBRefs.dbActivitiesRef;

        let ref = dbActivitiesRef
            .orderBy("activityDateTime", "desc");
        this.activeListener = ref.onSnapshot((querySnapshot) => {
            let activities = this.state.activities;

            let activity = {};
            querySnapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();
                    activities.push(activity);
                }
                if (change.type === "modified") {
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();

                    // swap activity in array with new
                    let oldActivityAndIndex = this.searchForActivity(activity.id, "id", activities);
                    if (oldActivityAndIndex) {
                        // replace current activity in array with new one
                        activities[oldActivityAndIndex.index] = activity;
                    }
                }
                if (change.type === "removed") {
                    // console.log(`Removed Activity: ${change.doc.id}`);
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();

                    // Delete activity from array 
                    let oldActivityAndIndex = this.searchForActivity(activity.id, "id", activities);
                    if (oldActivityAndIndex) {
                        // remove it
                        activities.splice(oldActivityAndIndex.index, 1);
                    }
                }
            });
            const totals = CalculateTotals.totals(activities, this.props.user.teamUid, this.props.user.teamName,
                this.props.user.uid, this.props.user.displayName);
            let myActivities = this.myActivitiesFilter(activities);
            this.setState({
                loadingFlag: false,
                activities,
                totals,
                myActivities
            });
        }, (error) => {
            console.error(`Error attaching listener: ${error}`);
        });
    }

    componentDidMount() {
        this._mounted = true;
        let layouts = getFromLS("layouts") || {};
        this.setState({ loadingFlag: true, layouts: JSON.parse(JSON.stringify(layouts)) });
        if (this.props.user.challengeUid) {
            this.createListener(this.props.user.challengeUid)
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.user.challengeUid && this.props.user.challengeUid !== prevProps.user.challengeUid) {
            if (this.activeListener) {
                this.activeListener();
                // console.log(`Detached listener`);
            }
            console.log(this.props.user.challengeUid)
            this.createListener(this.props.user.challengeUid)
        }
    }
    // Search for object in array based on key using uniqure ID
    searchForActivity(keyValue, keyName, searchArray) {
        for (var i = 0; i < searchArray.length; i++) {
            if (searchArray[i][keyName] === keyValue) {
                return ({ activity: searchArray[i], index: i });
            }
        }
        return undefined;
    }

    // Search for object in array based on key using uniqure ID
    searchForIndex(keyValue, keyName, searchArray) {
        for (var i = 0; i < searchArray.length; i++) {
            if (searchArray[i][keyName] === keyValue) {
                return ({ itemFound: searchArray[i], index: i });
            }
        }
        return undefined;
    }

    componentWillUnmount() {
        this._mounted = false;

        // kill the listener
        if (this.activeListener) {
            this.activeListener();
            // console.log(`Detached listener`);
        }
    }

    myActivitiesFilter(activities) {
        let myActivities = [];
        myActivities = activities.filter(activity => {
            if (activity.uid === this.props.user.uid) {
                return activity;
            } else {
                return false;
            }
        });
        return myActivities;
    }


    render() {
        const { classes } = this.props;
        if (this.state.loadingFlag) {
            return (<Grid container style={{ marginTop: '10px' }} justify="center"><CircularProgress /> <p>Loading ...</p> </Grid>)
        }


        // Some need to catch up for some reason - I had to refresh browser after going to activities page
        if (!this.state.totals || !this.state.totals.userR || !this.state.totals.teamR) {
            return null;
        }

        let myActivities = this.state.myActivities;
        if (this.props.user.authUser) {
            return (
                <div style={{ backgroundColor: "#f2f2f2" }} className={classes.root}>
                    <Container maxWidth="xl">
                        {/* <button onClick={() => this.resetLayout()}>Reset Layout</button> */}
                        <ResponsiveReactGridLayout
                            cols={{ lg: 12, md: 12, sm: 4, xs: 4, xxs: 2 }}
                            className="layout"
                            rowHeight={30}
                            layouts={this.state.layouts}
                            onLayoutChange={(layout, layouts) =>
                                this.onLayoutChange(layout, layouts)
                            }
                        >
                            <div key="11" data-grid={{ w: 12, h: 12, x: 0, y: 0, minW: 6, minH: 11, maxW: 12, maxH: 18 }}>
                                <GoogleMap
                                    title="Haynes City for Bethany"
                                    start='San Francisco, CA'
                                    end='Haines City, FL'
                                    waypoints={[{
                                        location: "Coeur d'Alene, ID",
                                        latlng: { lat: 47.6735, lng: -116.7812 }
                                    },
                                    {
                                        location: "St George, UT",
                                        latlng: { lat: 37.0965, lng: -113.5684 }
                                    },
                                    {
                                        location: "Houston, TX",
                                        latlng: { lat: 29.7604, lng: -95.3698 }
                                    },
                                    {
                                        location: "Madison, WI",
                                        latlng: { lat: 43.0731, lng: -89.4012 }
                                    },
                                    {
                                        location: "Louisville, KY",
                                        latlng: { lat: 38.2527, lng: -85.7585 }
                                    },
                                    {
                                        location: "Chattanooga, TN",
                                        latlng: { lat: 35.0456, lng: -85.3097 }
                                    },
                                    {
                                        location: "Panama City, FL",
                                        latlng: { lat: 30.1588, lng: -85.6602 }

                                    }
                                    ]}
                                    teamTotals={this.state.totals.teamR}
                                    callbackParent={() => this.onChildChanged()} />
                            </div>
                            <div key="12" data-grid={{ w: 4, h: 4, x: 0, y: 1, minW: 3, minH: 4, maxW: 4, maxH: 5 }}>
                                <TeamWidget
                                    team={this.props.user.teamName}
                                    challenge={this.props.user.challengeName}
                                />
                            </div>
                            <div key="1" data-grid={{ w: 4, h: 6, x: 4, y: 1, minW: 4, minH: 6, maxW: 6 }}>
                                <ResultsCard teamTotals={this.state.totals.teamR} userTotals={this.state.totals.userR} onlyTeams={true} />
                            </div>
                            <div key="2" data-grid={{ w: 4, h: 6, x: 8, y: 1, minW: 4, minH: 6, maxW: 6 }}>
                                <ActivitiesCard name={this.props.user.displayName} activity={myActivities} />
                            </div>
                            <div key="3" data-grid={{ w: 4, h: 11, x: 8, y: 1, minW: 4, minH: 6, maxW: 6 }}>
                                <ResultsCard teamTotals={this.state.totals.teamR} userTotals={this.state.totals.userR} onlyTeams={false} />
                            </div>
                            <div key="4" data-grid={{ w: 4, h: 8, x: 0, y: 2, minW: 3, minH: 8, maxW: 6, maxH: 9 }}>
                                <ActivityTypeBreakdown
                                    title={`All Athletes`}
                                    currentTotalsShare={this.state.totals.all}
                                />
                            </div>
                            <div key="5" data-grid={{ w: 4, h: 8, x: 4, y: 2, minW: 3, minH: 8, maxW: 6, maxH: 9 }}>
                                <ActivityTypeBreakdown
                                    title={`${this.props.user.displayName}`}
                                    currentTotalsShare={this.state.totals.user}
                                />
                            </div>
                            <div key="6" data-grid={{ w: 4, h: 8, x: 8, y: 2, minW: 3, minH: 8, maxW: 6, maxH: 9 }}>
                                <ActivityTypeBreakdown
                                    title={`Team ${this.props.user.teamName}`}
                                    currentTotalsShare={this.state.totals.team}
                                />
                            </div>
                            <div key="7" data-grid={{ w: 8, h: 10, x: 0, y: 4, minW: 6, minH: 10, maxW: 12, maxH: 10 }}>
                                <ActivityBubble
                                    title={"Heatmap (All Athletes)"}
                                    activities={this.state.activities}
                                    callbackParent={() => this.onChildChanged()}
                                />
                            </div>
                            <div key="8" data-grid={{ w: 4, h: 9, x: 8, y: 4, minW: 3, minH: 9, maxW: 6, maxH: 10 }}>
                                <PointsBreakdownGraph
                                    title={`Points by Team`}
                                    graphType="Team"
                                    totals={this.state.totals}
                                />
                            </div>
                            <div key="9" data-grid={{ w: 4, h: 9, x: 0, y: 6, minW: 3, minH: 9, maxW: 6, maxH: 10 }}>
                                <PointsBreakdownGraph
                                    title={`Top Members`}
                                    graphType="User"
                                    totals={this.state.totals}
                                />
                            </div>
                            <div key="10" data-grid={{ w: 4, h: 9, x: 4, y: 6, minW: 3, minH: 9, maxW: 6, maxH: 10 }}>
                                <ActivityByDay
                                    title={"Activity By Day"}
                                    activities={this.state.activities}
                                />
                            </div>

                        </ResponsiveReactGridLayout>
                    </Container>
                </div >
            );
        } else {
            return (
                <Redirect to="/signin" />
            );
        }
    }
}

function getFromLS(key) {
    let ls = {};
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem("rgl-8")) || {};
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls[key];
}

function saveToLS(key, value) {
    if (global.localStorage) {
        global.localStorage.setItem(
            "rgl-8",
            JSON.stringify({
                [key]: value
            })
        );
    }
}


export default withAuthUserContext(withStyles(styles)(Dashboard));