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
import TextField from "@material-ui/core/TextField";


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
            activityLimitBy: null,
            searchBy: "",
            filterBy: ""
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
            this.refreshPage();
        }

    }

    refreshPage() {
        this.getActivities();
    }

    onChange = event => {
        // Set Units
        if (event.target.name === "searchBy") {
            this.setState({
                [event.target.name]: event.target.value,
            });
        }
    };

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

        // Search and filter
        let searchBy = this.state.searchBy;
        let filterBy = this.state.filterBy;

        let activities = this.state.activities
        if (this.props.user.authUser) {
            // Conditional rendering
            let activityView = 
                <div>
                    <br></br>
                    <div className="row">
                        <p className="col s2 m2 text-bold blue-text">Activities</p>
                        <Link to="/activityform" className="col s2 offset-s5 m2 offset-m4 btn blue darken-4">New</Link>
                        <CSVLink
                        data={activities}
                        filename={'teamatc-transactions.csv'}
                        className='col s2 offset-s1 m2 offset-m1 btn blue darken-4'
                        target="_blank">
                        EXPORT TO CSV</CSVLink>    
                    </div>

                    <div className="row">                        
                        <div className="col s1 m1 green-text left-align">Filter: </div>
                        <div className="col s1 m1">
                            <img style={{maxHeight: '24px'}} src="/images/icons8-swimming-50.png" />
                        </div>
                        <div className="col s1 m1">
                            <img style={{maxHeight: '24px'}} src="/images/icons8-triathlon-50.png" />
                        </div>
                        <div className="col s1 m1">
                            <img style={{maxHeight: '24px'}} src="/images/icons8-running-50.png" />
                        </div>
                        <div className="col s3 offset-s5 m3 offset-m5 blue-text input-field inline">
                            <input id="searchBy" name="searchBy" type="text" value={searchBy} onChange={this.onChange} />
                            <label for="searchBy">Search</label>                            
                            <i class="material-icons prefix">search</i>
                        </div>
                    </div>

                    <div className={classes.root}>
                        {activities.map((activity) => {
                            return (
                                <div key={activity.id}>
                                    <Activity activity={activity} layoutType={this.props.layoutType} refreshPage={this.refreshPage}
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
                                    <Link to="/activities">Activities</Link>
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
                                    <Link to="/activities" className="waves-effect waves-light dash-btn blue darken-4 btn activityBtn">More Details</Link>
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