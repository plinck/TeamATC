import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { withStyles } from '@material-ui/core/styles';
import CalculateTotals from "./CalculateTotals/CalculateTotals.js"
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Redirect } from "react-router";
import SummaryTotal from "./SummaryTotal/SummaryTotal";
import ResultsCard from "./ResultsCard/ResultsCard";
import ActivitiesCard from './ActivitiesCard/ActivitiesCard';
import ActivityBubble from "./Graphs/ActivityBubble";
import ActivityByDay from "./Graphs/ActivityByDay";
import ActivityTotalsGraphs from "./Graphs/ActivityTotalsGraphs";
import ActivityTypeBreakdown from "./Graphs/ActivityTypeBreakdown";
import PointsBreakdownGraph from './Graphs/PointsBreakdown';
//Reports
import { Container, Card, CardContent, Grid, CircularProgress } from '@material-ui/core'
import Util from "../Util/Util";

const styles = theme => ({
    root: {
        [theme.breakpoints.up('md')]: {
            marginLeft: "57px",
        }
    },
    card: {
        height: "100%"
    }
});

const ReactGridLayout = WidthProvider(RGL);
const originalLayout = getFromLS("layout") || [];
/**
 * This layout demonstrates how to sync to localstorage.
 */
class Dashboard extends React.PureComponent {
    static defaultProps = {
        className: "layout",
        cols: 12,
        rowHeight: 30,
        onLayoutChange: function () { }
    };

    constructor(props) {
        super(props);

        this.state = {
            layout: JSON.parse(JSON.stringify(originalLayout)),
            loadingFlag: true,
            activities: [],
            myActivities: [],
        };

        this.onLayoutChange = this.onLayoutChange.bind(this);
        this.resetLayout = this.resetLayout.bind(this);
    }

    activeListener = undefined;
    totals = {};
    activitiesUpdated = false;

    resetLayout() {
        this.setState({
            layout: []
        });
    }

    onLayoutChange(layout) {
        /*eslint no-console: 0*/
        saveToLS("layout", layout);
        this.setState({ layout });
        this.props.onLayoutChange(layout); // updates status display
    }
    componentDidMount() {
        this._mounted = true;
        this.setState({ loadingFlag: true });

        let allDBRefs = Util.getDBRefs();
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
            this.activitiesUpdated = true;
            this.setState({
                loadingFlag: false
            });
        }, (error) => {
            console.error(`Error attaching listener: ${error}`);
        });
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

    async myActivitiesFilter() {
        const activities = this.state.activities;
        let myActivities = [];

        myActivities = activities.filter(activity => {
            if (activity.uid === this.props.user.uid) {
                return activity;
            } else {
                return false;
            }
        });
        this.setState({ myActivities: myActivities });
    }


    render() {
        const { classes } = this.props;
        if (this.state.loadingFlag) {
            return (<Grid container style={{ marginTop: '10px' }} justify="center"><CircularProgress /> <p>Loading ...</p> </Grid>)
        }

        // Some props take time to get ready so return null when uid not avaialble
        if (this.props.user.uid === null || this.props.user.teamUid === null) {
            return null;
        }

        // if the listener updated the state
        if (this.activitiesUpdated) {
            this.totals = CalculateTotals.totals(this.state.activities, this.props.user.teamUid, this.props.user.teamName,
                this.props.user.uid, this.props.user.displayName);
            this.myActivitiesFilter();
            this.activitiesUpdated = false;
        }

        // Some need to catch up for some reason - I had to refresh browser after going to activities page
        if (!this.totals || !this.totals.userR || !this.totals.teamR) {
            return null;
        }

        let myActivities = this.state.myActivities;
        if (this.props.user.authUser) {
            return (
                <div style={{ backgroundColor: "#f2f2f2" }} className={classes.root}>
                    <Container maxWidth="xl" style={{ marginTop: "10px" }}>
                        <button onClick={this.resetLayout}>Reset Layout</button>
                        <ReactGridLayout
                            {...this.props}
                            layout={this.state.layout}
                            onLayoutChange={this.onLayoutChange}
                        >
                            <div key="1" data-grid={{ w: 4, h: 6, x: 0, y: 0, minW: 4, minH: 6, maxW: 6 }}>
                                <ResultsCard teamTotals={this.totals.teamR} userTotals={this.totals.userR} onlyTeams={true} />
                            </div>
                            <div key="2" data-grid={{ w: 4, h: 6, x: 4, y: 0, minW: 4, minH: 6, maxW: 6 }}>
                                <ActivitiesCard name={this.props.user.displayName} activity={myActivities} />
                            </div>
                            <div key="3" data-grid={{ w: 4, h: 11, x: 8, y: 0, minW: 4, minH: 6, maxW: 6 }}>
                                <ResultsCard teamTotals={this.totals.teamR} userTotals={this.totals.userR} onlyTeams={false} />
                            </div>
                            <div key="4" data-grid={{ w: 4, h: 6, x: 0, y: 1, minW: 4, minH: 6, maxW: 6 }}>
                                <ActivityTypeBreakdown
                                    title={`All Athletes`}
                                    currentTotalsShare={this.totals.all}
                                />
                            </div>
                            <div key="5" data-grid={{ w: 2, h: 3, x: 4, y: 1 }}>
                                <Card className={classes.card}>
                                    <CardContent>
                                        <span className="text">5</span>
                                    </CardContent>
                                </Card>
                            </div>
                        </ReactGridLayout>
                    </Container>
                </div>
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
            ls = JSON.parse(global.localStorage.getItem("rgl-7")) || {};
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls[key];
}

function saveToLS(key, value) {
    if (global.localStorage) {
        global.localStorage.setItem(
            "rgl-7",
            JSON.stringify({
                [key]: value
            })
        );
    }
}


export default withAuthUserContext(withStyles(styles)(Dashboard));