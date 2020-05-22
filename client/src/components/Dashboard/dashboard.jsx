import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { withStyles } from '@material-ui/core/styles';
import { Leaderboard } from "./CalculateTotals/Leaderboard";
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Redirect } from "react-router";
import ResultsCard from "./ResultsCard/ResultsCard.jsx";
import ActivitiesCard from './ActivitiesCard/ActivitiesCard';
import ActivityBubble from "./Graphs/ActivityBubble";
import ActivityByDay from "./Graphs/ActivityByDay";
import ActivityTypeBreakdown from "./Graphs/ActivityTypeBreakdown";
import PointsBreakdownGraph from './Graphs/PointsBreakdown.jsx';
import { Container, Grid, CircularProgress } from '@material-ui/core'
import Util from "../Util/Util";
import GoogleMap from './GoogleMap/GoogleMap';
import TeamWidget from './TeamWidget/TeamWidget';
import ChallengeDB from '../Challenges/ChallengeDB';
import ActivityListener from "../Activity/ActivityListener";

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
            activities: [],
            myActivities: [],
            totals: {},
            challenge: {}
        };

        this.activityListener = undefined;
        this.perf = Util.getFirestorePerf();
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

    resetLayout() {
        this.setState({ layouts: {} })
    }

    onLayoutChange(layout, layouts) {
        saveToLS("layouts", layouts);
        this.setState({ layouts });
    }

    createListener(challengeUid) {
        // This is just to show something on the page while its loading
        this.setState({loadingFlag: true});
        this.renderTotals(this.state.activities);    
        const traceCalculateTotals =  this.perf.trace('traceCalculateTotals');
        const traceFullRetrieval = this.perf.trace('traceFullRetrievalFirestore');
        try {
            traceFullRetrieval.start();
        } catch {
            console.error("traceFullRetrieval not started ...")
        }

        let traceFullRetrievalT1 = new Date();

        ActivityListener.createActivityListener(challengeUid).then( activities => {
            try {
                traceFullRetrieval.incrementMetric('nbrActivities', activities.length);
                traceFullRetrieval.stop();
            } catch {
                //
            }

            let traceFullRetrievalT2 = new Date();
            let traceFullRetrievalDiff = traceFullRetrievalT2.getTime() - traceFullRetrievalT1.getTime();
            console.log(`traceFullRetrievalDiff time is milliseconds: ${traceFullRetrievalDiff}`);
            try {
                traceCalculateTotals.start();
            } catch {
                console.error("traceCalculateTotals not started ...")
            }
    
            this.renderTotals(activities);
            try {
                traceCalculateTotals.stop();
            } catch {
                //
            }

            this.setState({loadingFlag: false});
        }).catch( err => {
            try {
                traceFullRetrieval.stop();
            } catch {
                //
            }

            console.error(`Error attaching listener: ${err}`);
            this.setState({loadingFlag: false});
        });
    }

    createListenerAlt(challengeUid) {
        // This is just to show something on the page while its loading
        this.setState({loadingFlag: true});
        this.renderTotals(this.state.activities);    
        const traceCalculateTotals =  this.perf.trace('traceCalculateTotals');
        const traceFullRetrieval = this.perf.trace('traceFullRetrievalRealtimeDB');
        try {
            traceFullRetrieval.start();
        } catch {
            console.error("traceFullRetrieval not started ...")
        }

        let traceFullRetrievalT1 = new Date();

        ActivityListener.createRealtimeDBActivityListener(challengeUid).then( activities => {
            try {
                traceFullRetrieval.incrementMetric('nbrActivities', activities.length);
                traceFullRetrieval.stop();
            } catch {
                //
            }

            let traceFullRetrievalT2 = new Date();
            let traceFullRetrievalDiff = traceFullRetrievalT2.getTime() - traceFullRetrievalT1.getTime();
            console.log(`traceFullRetrievalDiff time is milliseconds: ${traceFullRetrievalDiff}`);
            try {
                traceCalculateTotals.start();
            } catch {
                console.error("traceCalculateTotals not started ...")
            }
    
            this.renderTotals(activities);
            try {
                traceCalculateTotals.stop();
            } catch {
                //
            }

            this.setState({loadingFlag: false});
        }).catch( err => {
            try {
                traceFullRetrieval.stop();
            } catch {
                //
            }

            console.error(`Error attaching listener: ${err}`);
            this.setState({loadingFlag: false});
        });
    }

    // This is to render interim without waiting for all to be done.
    renderTotals(activities) {
        // console.log(`renderTotals ,teamUid:${this.props.user.teamUid} teamName:${this.props.user.teamName} uid:${this.props.user.uid} displayName:${this.props.user.displayName}`);
        const totals = Leaderboard.calculateLeaderboards(activities,
            this.props.user.teamUid, this.props.user.teamName,
            this.props.user.uid, this.props.user.displayName);
        let myActivities = this.myActivitiesFilter(activities);
        this.setState({
            activities,
            totals,
            myActivities
        });
    }

    fetchData(challengeId) {
        ChallengeDB.getFiltered().then(challenges => {
            let currentChallenge = challenges.filter(challenge => challenge.id === challengeId)
            this.setState({ challenge: currentChallenge[0] })
        }).catch(err => console.error(err));
    }

    componentDidMount() {
        this._mounted = true;
        let layouts = getFromLS("layouts") || {};
        this.setState({ layouts: JSON.parse(JSON.stringify(layouts)) });
        // console.log(`this.props.user.challengeUid: ${this.props.user.challengeUid}`);
        if (this.props.user.challengeUid) {
            this.createListener(this.props.user.challengeUid)
            this.fetchData(this.props.user.challengeUid)
        }
    }

    componentDidUpdate(prevProps) {
        // console.log(`prevProps.user.challengeUid: ${prevProps.user.challengeUid}`);
        // console.log(`this.props.user.challengeUid: ${this.props.user.challengeUid}`);
        if (this.props.user.challengeUid && this.props.user.challengeUid !== prevProps.user.challengeUid) {
            if (this.activityListener) {
                this.activityListener();
                // console.log(`Detached listener`);
            }
            // console.log(this.props.user.challengeUid)
            this.createListener(this.props.user.challengeUid)
            this.fetchData(this.props.user.challengeUid)
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
        if (this.activityListener) {
            this.activityListener();
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

        // Some need to catch up for some reason - I had to refresh browser after going to activities page
        if (!this.state.totals || !this.state.totals.userResults || !this.state.totals.teamResults) {
            return (<Grid container style={{ marginTop: '10px' }} justify="center"><CircularProgress /> <p>Loading ...</p> </Grid>)
        }
        if (!this.props.user) {
            return (<Grid container style={{ marginTop: '10px' }} justify="center"><CircularProgress /> <p>Loading ...</p> </Grid>)
        }
        const currentUserResults = this.state.totals.userResults.find(result => result.uid === this.props.user.uid);
        const currentTeamResults = this.state.totals.teamResults.find(result => result.teamUid === this.props.user.teamUid);

        let myActivities = this.state.myActivities;
        if (this.props.user.authUser) {

            return (
                <div style={{ backgroundColor: "#f2f2f2" }} className={classes.root}>
                    {this.state.loadingFlag ?
                        <Grid container style={{ marginTop: '10px' }} justify="center"><CircularProgress /> <p>Loading/Calculating ...</p> </Grid>
                    : ""}

                    <Container maxWidth="xl">
                        {/* <button onClick={() => this.resetLayout()}>Reset Layout</button> */}
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
                                        challenge={this.state.challenge}
                                        title={this.state.challenge.name}
                                        start={this.state.challenge.startCity}
                                        end={this.state.challenge.endCity}
                                        waypoints={this.state.challenge.waypoints}
                                        teamResults={this.state.totals.teamResults}
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
                                <ResultsCard 
                                    challenge={this.state.challenge}
                                    teamTotals={this.state.totals.teamResults} 
                                    userTotals={this.state.totals.userResults} 
                                    onlyTeams={true} />
                            </div>
                            <div key="2" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 6, x: 8, y: 1, minW: 4, minH: 6, maxW: 6 }}>
                                <ActivitiesCard name={this.props.user.displayName} activity={myActivities} />
                            </div>
                            <div key="3" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 11, x: 8, y: 1, minW: 4, minH: 6, maxW: 6 }}>
                                <ResultsCard 
                                    user={this.props.user} 
                                    challenge={this.state.challenge}
                                    teamTotals={this.state.totals.teamResults} 
                                    userTotals={this.state.totals.userResults} 
                                    onlyTeams={false} />
                            </div>
                            <div key="4" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 8, x: 0, y: 2, minW: 3, minH: 8, maxW: 6, maxH: 9 }}>
                                <ActivityTypeBreakdown
                                    title={`Breakdown - All Athletes`}
                                    currentTotalsShare={this.state.totals.overallResults}
                                />
                            </div>
                            <div key="5" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 8, x: 4, y: 2, minW: 3, minH: 8, maxW: 6, maxH: 9 }}>
                                <ActivityTypeBreakdown
                                    title={`Breakdown - ${this.props.user.displayName}`}
                                    currentTotalsShare={currentUserResults}
                                />
                            </div>
                            <div key="6" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 8, x: 8, y: 2, minW: 3, minH: 8, maxW: 6, maxH: 9 }}>
                                <ActivityTypeBreakdown
                                    title={`Breakdown - Team ${this.props.user.teamName}`}
                                    currentTotalsShare={currentTeamResults}
                                />
                            </div>
                            <div key="7" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 8, h: 10, x: 0, y: 4, minW: 6, minH: 10, maxW: 12, maxH: 10 }}>
                                <ActivityBubble
                                    title={"Heatmap (All Athletes)"}
                                    activities={this.state.activities}
                                    callbackParent={() => this.onChildChanged()}
                                />
                            </div>
                            <div key="8" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 9, x: 8, y: 4, minW: 3, minH: 9, maxW: 6, maxH: 10 }}>
                                <PointsBreakdownGraph
                                    title={`Points by Team`}
                                    graphType="Team"
                                    totals={this.state.totals.teamResults}
                                />
                            </div>
                            <div key="9" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 9, x: 0, y: 6, minW: 3, minH: 9, maxW: 6, maxH: 10 }}>
                                <PointsBreakdownGraph
                                    title={`Top Members`}
                                    graphType="User"
                                    totals={this.state.totals.userResults}
                                />
                            </div>
                            <div key="10" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 4, h: 9, x: 4, y: 6, minW: 3, minH: 9, maxW: 6, maxH: 10 }}>
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


export default withAuthUserContext(withStyles(styles)(WidthProvider(Dashboard)));