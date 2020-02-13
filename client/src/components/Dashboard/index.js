import React from 'react';
import './dashboard.css';
import { Link } from 'react-router-dom';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { Redirect } from 'react-router';
import Distance from './Distance/Distance';

import ActivityByDay from "./Graphs/ActivityByDay";


// import ActivityByUser from "./Graphs/ActivityByUser";
// import DepositBubble from "./Graphs/DepositBubble";
// import DepositByDenomination from "./Graphs/DepositByDenomination";
// import ProvisionalCreditOverTime from "./Graphs/ProvisionalCreditOverTime"

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Util from '../Util/Util';

class Home extends React.Component {
    state = {
        activities: [],
        nbrActivities: 0,
        distance: 0,
        duration: 0,
        loadingFlag: false
    }

    componentDidMount() {
        this._mounted = true;
        this.setState({ loadingFlag: true })

        Util.apiGet("/api/firestore/activities")
            .then(res => {
                console.log(res.data);
                if (this._mounted) {
                    this.setState({ activities: res.data })
                    this.setState({ loadingFlag: false })
                }
            })
            .catch(err => console.error(err));

        Util.apiGet("/api/firestore/getTotalActivities")
        .then(res => {
            if (this._mounted) {
                this.setState({
                    nbrActivities: res.data.nbrActivities,
                    distance: res.data.distance,
                    duration: res.data.duration
                })
            }
        })
        .catch(err => console.error(err));
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    render() {
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