import React from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';

import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import Activity from './Activity';
import ActivityCard from './ActivityCard';
import ActivityDB from './ActivityDB';

import { withStyles } from '@material-ui/core/styles';

// export csv functionality
// eslint-disable-next-line no-unused-vars
import { CSVLink, CSVDownload } from "react-csv";


const styles = theme => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    progress: {
        margin: theme.spacing.unit * 2,
    },
});

class Activities extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activities: null,
            activityLimitBy: null
        };
    }

    getActivities = () => {
        // Get with security
        // comes back sorted already
        ActivityDB.getActivityWithUser()
            .then(res => {
                let activities = res;
                this.setState({ activities: activities });
            })
            .catch(err => {
                console.error(err);
            });
    };

    // get all on mount
    componentDidMount() {
        // check to see if we already have activities passed
        // if so, dont go get them again
        if (this.props.activities) {
            this.setState({ activities: this.props.activities });   
        } else {
            this.getActivities();
        }

    }

    render() {
        const { classes } = this.props;

        // Some props take time to get ready so return null when uid not avaialble
        if (this.props.user.uid === null) {
            return null;
        }

        if (typeof this.state.activities === 'undefined') {
            console.error("Fatal Error")
            return (<div> <p>FATAL ERROR Gettng activities ...</p> </div>)
        }
        if (this.state.activities === null) {
            console.log("No Activities yet")
            return (<div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div>)
        } 

        let activities = this.state.activities
        if (this.props.user.authUser) {
            // Conditional rendering
            let activityView = 
                <div>
                    <br></br>
                    <CSVLink
                    data={activities}
                    filename={'teamatc-transactions.csv'}
                    className='btn blue darken-4'
                    target="_blank">
                    EXPORT TO CSV</CSVLink>
                    <div className={classes.root}>
                        <div className="row">
                            <h5 className="col s6 m3">Time</h5>
                            <h5 className="col s6 m3">User</h5>
                            <h5 className="col s6 m3 offset-m3">Team</h5>
                            <h5 className="col s6 m3">Activity</h5>
                            <h5 className="col s6 m3">Duration</h5>
                            <h5 className="col s6 m3 offset-m3">Distance</h5>
                        </div>

                        {activities.map((activity) => {
                            return (
                                <div key={activity.id}>
                                    <Activity activity={activity} layoutType={this.props.layoutType}
                                    />
                                </div>
                            );
                        })} 
                    </div>
                </div>
                
            if ((this.props.layoutType) && (this.props.layoutType === "userCard")){
                // card?
                activityView = 
                <div>
                    <div className="col s12 m4">
                        <div className="card">
                            <div className="card-content pCard">
                                <span className="card-title">
                                    <Link to="/activity/activitieslist">Activities</Link>
                                </span> 
                                <div className="row">
                                    <p className="col s12 offset-s1 m5">Activity</p>
                                    <p className="col s7 offset-s1 m4">Date</p>
                                    <p className="col s2 offset-s2 m2 offset-m1">Distance</p>
                                </div> 
                                {activities.map((activity) => {
                                    return (
                                        <div key={activity.id}>
                                            <ActivityCard activity={activity} layoutType={this.props.layoutType}
                                            />
                                        </div>
                                    );
                                })} 
                            </div>
                            <div className="card-action pCard">
                                <div className="center-align">
                                    <Link to="/activity/activitieslist" className="waves-effect waves-light dash-btn blue darken-4 btn activityBtn">More Details</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            return (
                <div className="container">
                    {activityView}
                </div>
            );
        } else {
            return (
                <Redirect to="/dashboard" />
            );
        } // if (this.props.user.authUser)
    }// render()
} // class


export default withRouter(withAuthUserContext(withStyles(styles)(Activities)));