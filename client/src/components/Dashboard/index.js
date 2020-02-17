import React from 'react';
import './dashboard.css';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { Redirect } from 'react-router';
import SummaryTotal from './SummaryTotal/SummaryTotal';
import Activities from "../Activity/Activities";

import ActivityByDay from "./Graphs/ActivityByDay";


// import ActivityByUser from "./Graphs/ActivityByUser";
// import DepositBubble from "./Graphs/DepositBubble";
// import DepositByDenomination from "./Graphs/DepositByDenomination";
// import ProvisionalCreditOverTime from "./Graphs/ProvisionalCreditOverTime"

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Util from '../Util/Util';
import ActivityDB from '../Activity/ActivityDB';

class Home extends React.Component {
    state = {
        activities: [],
        nbrActivities: 0,
        distanceTotal: 0,
        durationTotal: 0,
        loadingFlag: false
    }
    activeListener = undefined;

    componentDidMount() {
        this._mounted = true;
        this.setState({ loadingFlag: true })
        const db = Util.getFirestoreDB();   // active firestore db ref

        let ref = db.collection("activities")
            .orderBy("activityDateTime", "desc");
        this.activeListener = ref.onSnapshot((querySnapshot) => {
            let activities = this.state.activities;
            let nbrActivities = this.state.nbrActivities;
            let distanceTotal = this.state.distanceTotal;
            let durationTotal = this.state.durationTotal;

            querySnapshot.docChanges().forEach( change => {               
                if (change.type === "added") {
                    console.log(`New Activity `);
                    let activity = {};
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();
                    activities.push(activity); 
                    nbrActivities += 1;
                    if (activity.distanceUnits && activity.distanceUnits === "Yards") {
                        distanceTotal += activity.distance / 1760;
                    } else {
                        distanceTotal += activity.distance;
                    }
                    if (activity.durationUnits && activity.durationUnits === "Minutes") {
                        durationTotal += activity.duration / 60;
                    } else {
                        durationTotal += activity.duration;    
                    }
                    this.setState({
                        nbrActivities: nbrActivities,
                        distanceTotal: distanceTotal,
                        durationTotal: durationTotal
                    })    
                }
                if (change.type === "modified") {
                    console.log(`Modified Activity: ${change.doc.id}`);
                }
                if (change.type === "removed") {
                    console.log(`Removed Activity: ${change.doc.id}`);
                }
            });
            if (this._mounted) {
                this.setState({ activities: activities })
                this.setState({ loadingFlag: false })
            }
        }, (error) => {
            console.error(`Error attaching listener: ${error}`)
        });
    }

    componentWillUnmount() {
        this._mounted = false;
        
        // kill the listener
        if (this.activeListener) {
            this.activeListener();
            console.log(`Detached listener`)
        }
    }

    render() {
        // Some props take time to get ready so return null when uid not avaialble
        if (this.props.user.uid === null) {
            return null;
        }
        
        if (this.props.user.authUser) {
            return (
                <div>
                    {this.state.loadingFlag ?
                        <Grid container justify="center">
                            <CircularProgress /> <p>Loading ...</p>
                        </Grid>
                        :
                        <div className="container">
                            <div className="row">
                                <SummaryTotal 
                                    nbrActivities={this.state.nbrActivities} distanceTotal={this.state.distanceTotal} durationTotal={this.state.durationTotal}
                                    disabled={this.props.user.isAdmin ? false : this.props.user.isCashier ? false : true}
                                />
                            </div>

                            <div className="row">
                            <ActivityByDay
                            title={"Total Activities By Day"}
                            activities={this.state.activities}
                            />
                            </div>
                            
                            <Activities filterByString="Mine" layoutType="userCard"/>
                        </div>

                    }
                </div>
            );
        } else {
            return (
                <Redirect to="/signin" />
            );
        }

    }
}

export default withAuthUserContext(Home);