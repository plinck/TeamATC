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
import ChallengeDB from '../Challenges/ChallengeDB';
import { connect } from 'react-redux';

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
    },
    mobile: {
        touchAction: "auto !important"
    }
});

class Dashboard extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            layouts: JSON.parse(JSON.stringify(originalLayouts)),
            activities: this.props.activities,
            myActivities: [],
            totals: {},
            challenge: {}
        };
    }

    activeListener = undefined;

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

        // try not to do any sorting or filtering to make it fast
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
                activities,
                totals,
                myActivities
            });
        }, (err) => {
            console.error(`Error attaching listener: ${err}`);
        });
    }

    fetchData(challengeId) {
        ChallengeDB.getFiltered().then(challenges => {
            let currentChallenge = challenges.filter(challenge => challenge.id === challengeId)
            this.setState({ challenge: currentChallenge[0] })
        })
            .catch(err => console.log(err));
    }

    componentDidMount() {
        this._mounted = true;
        let layouts = getFromLS("layouts") || {};
        this.setState({ layouts: JSON.parse(JSON.stringify(layouts)) });
        // console.log(`this.props.user.challengeUid: ${this.props.user.challengeUid}`);
        if (this.props.user.challengeUid) {
            // this.createListener(this.props.user.challengeUid)
            //this.prepareDashboardFromActivities();
            this.fetchData(this.props.user.challengeUid)
        }
    }

    componentDidUpdate(prevProps) {
        // console.log(`prevProps.user.challengeUid: ${prevProps.user.challengeUid}`);
        if (this.props.user.challengeUid && this.props.user.challengeUid !== prevProps.user.challengeUid) {
            if (this.activeListener) {
                this.activeListener();
                // console.log(`Detached listener`);
            }
            // console.log(this.props.user.challengeUid)
            // this.createListener(this.props.user.challengeUid)
            //this.prepareDashboardFromActivities();
            this.fetchData(this.props.user.challengeUid)
        }
        if (this.props.nbrUpdates !== prevProps.nbrUpdates) {
            // console.log(`Activities Updates`);
            //this.prepareDashboardFromActivities();
        }
    }

    prepareDashboardFromActivities() {
        let activities = this.props.activities;
        let nbrRenderredActivities = this.props.activities.length
        console.log(`nbrRenderredActivities: ${nbrRenderredActivities}`);

        const totals = CalculateTotals.totals(activities, this.props.user.teamUid, this.props.user.teamName,
            this.props.user.uid, this.props.user.displayName);
        let myActivities = this.myActivitiesFilter(activities);
        this.setState({
            totals,
            myActivities,
            nbrRenderredActivities
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

    sendUpdate() {
        this.forceUpdate();
    }

    render() {
        const { classes } = this.props;

        // // Some need to catch up for some reason - I had to refresh browser after going to activities page
        // if (!this.state.totals || !this.state.totals.all || !this.state.totals.userR || !this.state.totals.teamR) {
        //     return (<Grid container style={{ marginTop: '10px' }} justify="center"><CircularProgress /> <p>Loading ...</p> </Grid>)
        // }
        if (!this.props.activities) {
            return (<Grid container style={{ marginTop: '10px' }} justify="center"><CircularProgress /> <p>Loading ...</p> </Grid>)
        }

        let activities = this.props.activities;
        //console.log(`Renderring ${activities.length} number of activities, last activity added: ${activities.length > 0 ? JSON.stringify(activities[activities.length-1]): "NA"}`);
        // let myActivities = this.state.myActivities;
        // let totals = this.state.totals;
        let nbrUpdates = this.props.nbrUpdates; // to force copmponents to update
        
        // let myActivities = this.myActivitiesFilter(activities);
        let myActivities = activities.filter(activity => activity.uid === this.props.user.uid);
        // console.log(`Last myActivity: ${myActivities.length > 0 ? JSON.stringify(myActivities[myActivities.length-1]): "NA"}`);

        const totals = CalculateTotals.totals(activities, this.props.user.teamUid, this.props.user.teamName,
            this.props.user.uid, this.props.user.displayName);

        if (this.props.user.authUser) {
            return (
                <div style={{ backgroundColor: "#f2f2f2" }} className={classes.root}>
                    <Container maxWidth="xl">
                        <ResponsiveReactGridLayout
                            cols={{ lg: 12, md: 12, sm: 4, xs: 4, xxs: 2 }}
                            className="layout"
                            rowHeight={30}
                            layouts={this.state.layouts}
                            isDraggable={this.props.width <= 600 ? false : true}
                            isResizable={this.props.width <= 600 ? false : true}
                            onLayoutChange={(layout, layouts) =>
                                this.onLayoutChange(layout, layouts)
                            }
                        >
                            {this.state.challenge && this.state.challenge.startCity ?
                                <div key="11" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 12, h: 12, x: 0, y: 0, minW: 6, minH: 11, maxW: 12, maxH: 18 }}>
                                    <GoogleMap
                                        nbrUpdates={nbrUpdates}
                                        challenge={this.state.challenge}
                                        title={this.state.challenge.name}
                                        start={this.state.challenge.startCity}
                                        end={this.state.challenge.endCity}
                                        waypoints={this.state.challenge.waypoints}
                                        teamResults={totals.teamR}
                                        endDate={this.state.challenge.endDate}
                                        callbackParent={() => this.onChildChanged()} />
                                </div> : <></>}
                            <div key="12" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 4, x: 0, y: 1, minW: 3, minH: 4, maxW: 4, maxH: 5 }}>
                                <TeamWidget
                                    team={this.props.user.teamName}
                                    challenge={this.props.user.challengeName}
                                />
                            </div>
                            <div key="1" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 6, x: 4, y: 1, minW: 4, minH: 6, maxW: 6 }}>
                                <ResultsCard teamTotals={totals.teamR} userTotals={totals.userR} onlyTeams={true} />
                            </div>
                            <div key="2" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 6, x: 8, y: 1, minW: 4, minH: 6, maxW: 6 }}>
                                <ActivitiesCard nbrUpdates={nbrUpdates} name={this.props.user.displayName} activity={myActivities} />
                            </div>
                            <div key="3" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 11, x: 8, y: 1, minW: 4, minH: 6, maxW: 6 }}>
                                <ResultsCard user={this.props.user} teamTotals={totals.teamR} userTotals={totals.userR} onlyTeams={false} />
                            </div>
                            <div key="4" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 8, x: 0, y: 2, minW: 3, minH: 8, maxW: 6, maxH: 9 }}>
                                <ActivityTypeBreakdown
                                    title={`All Athletes`}
                                    currentTotalsShare={totals.all}
                                />
                            </div>
                            <div key="5" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 8, x: 4, y: 2, minW: 3, minH: 8, maxW: 6, maxH: 9 }}>
                                <ActivityTypeBreakdown
                                    title={`${this.props.user.displayName}`}
                                    currentTotalsShare={totals.user}
                                />
                            </div>
                            <div key="6" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 8, x: 8, y: 2, minW: 3, minH: 8, maxW: 6, maxH: 9 }}>
                                <ActivityTypeBreakdown
                                    title={`Team ${this.props.user.teamName}`}
                                    currentTotalsShare={totals.team}
                                />
                            </div>
                            <div key="7" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 8, h: 10, x: 0, y: 4, minW: 6, minH: 10, maxW: 12, maxH: 10 }}>
                                <ActivityBubble
                                    title={"Heatmap (All Athletes)"}
                                    activities={activities}
                                    callbackParent={() => this.onChildChanged()}
                                />
                            </div>
                            <div key="8" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 9, x: 8, y: 4, minW: 3, minH: 9, maxW: 6, maxH: 10 }}>
                                <PointsBreakdownGraph
                                    title={`Points by Team`}
                                    graphType="Team"
                                    totals={totals}
                                />
                            </div>
                            <div key="9" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 9, x: 0, y: 6, minW: 3, minH: 9, maxW: 6, maxH: 10 }}>
                                <PointsBreakdownGraph
                                    title={`Top Members`}
                                    graphType="User"
                                    totals={totals}
                                />
                            </div>
                            <div key="10" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 9, x: 4, y: 6, minW: 3, minH: 9, maxW: 6, maxH: 10 }}>
                                <ActivityByDay
                                    title={"Activity By Day"}
                                    activities={activities}
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

// NOTE: Using nbrUpdates since REACT uses SHALLOW test to see if re-render 
// needs to be done.  It does not check objects within state, just the top layer of state
const mapStateToProps = (state) => {
    // console.log(`mapStateToProps State, nbrActivities: ${state.activities.length}, updates: ${state.nbrUpdates}`)
    return {
        ...state,
        nbrUpdates: state.nbrUpdates,
        activities: state.activities
    }
}  

export default connect(mapStateToProps)(withAuthUserContext(withStyles(styles)(WidthProvider(Dashboard))));