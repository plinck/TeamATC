import React from 'react';
import './dashboard.css';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { Redirect } from 'react-router';
import Distance from './Distance/Distance';

import ActivityByDay from "./Graphs/ActivityByDay";
import ActivityList from "../Activities/ActivityList";


// import ActivityByUser from "./Graphs/ActivityByUser";
// import DepositBubble from "./Graphs/DepositBubble";
// import DepositByDenomination from "./Graphs/DepositByDenomination";
// import ProvisionalCreditOverTime from "./Graphs/ProvisionalCreditOverTime"

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Util from '../Util/Util';

class Home extends React.Component {
    state = {
        activities: null,
        nbrActivities: 0,
        distance: 0,
        duration: 0,
        loadingFlag: false
    }

    componentDidMount() {
        this._mounted = true;
        this.setState({ loadingFlag: true })

        Util.apiGet("/api/activity/activities")
            .then(res => {
                console.log(res.data);
                if (this._mounted) {
                    this.setState({ activities: res.data })
                    this.setState({ loadingFlag: false })
                }
            })
            .catch(err => console.error(err));

        Util.apiGet("/api/activity/activityTotals")
        .then(res => {
            if (this._mounted) {
                this.setState({
                    nbrActivities: res.data.nbrActivities ? res.data.nbrActivities : 0,
                    distance: res.data.distance ? res.data.distance : 0,
                    duration: res.data.duration ? res.data.duration : 0
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
                                <Distance 
                                    nbrActivities={this.state.nbrActivities} distance={this.state.distance} duration={this.state.distance}
                                    disabled={this.props.user.isAdmin ? false : this.props.user.isCashier ? false : true}
                                />
                            </div>


                            <div className="row">
                                <ActivityByDay
                                    title={"Total Activities By Day"}
                                    activities={this.state.activities}
                                />

                                {/*this.props.user.isUser ? null :
                                    <ActivityByUser
                                        title={"Activities By User"}
                                        activities={this.state.activities}
                                />*/}
                            </div>
                            {/* TEST GETTING ACTIVITIES */}
                            <div className="row">
                                <ActivityList
                                />
                            </div>
                            
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