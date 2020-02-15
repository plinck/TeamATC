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
        activities: null,
        nbrActivities: 0,
        distanceTotal: 0,
        durationTotal: 0,
        loadingFlag: false
    }

    componentDidMount() {
        this._mounted = true;
        this.setState({ loadingFlag: true })

        // note res,data is NOT using in local DB get since only node sends back JSON in res.data
        ActivityDB.get()
            .then(res => {
                if (this._mounted) {
                    this.setState({ activities: res })
                    this.setState({ loadingFlag: false })
                }
            })
            .catch(err => console.error(err));

        Util.apiGet("/api/activity/activityTotals")
        .then(res => {
            if (this._mounted) {
                this.setState({
                    nbrActivities: res.data.nbrActivities ? res.data.nbrActivities : 0,
                    distanceTotal: res.data.distanceTotal ? res.data.distanceTotal : 0,
                    durationTotal: res.data.durationTotal ? res.data.durationTotal : 0
                })
            }
        })
        .catch(err => console.error(err));
    }

    componentWillUnmount() {
        this._mounted = false;
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
                            
                            <Activities activityLimitBy="user" layoutType="userCard"/>
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