import React from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

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
            searchBy: "",
            filterByString: null
        };
    }

    getActivities = (resultLimit, teamName, teamUid, userUid, startDate, endDate) => {
        // Get with security
        // comes back sorted already
        ActivityDB.getAll(resultLimit, teamName, teamUid, userUid, startDate, endDate)
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
            if (this.props.filterByString) {
                this.setState({filterByString: this.props.filterByString});
                this.refreshPage(this.props.filterByString);
            } else {
                this.refreshPage();
            }
        }

    }

    refreshPage(filterByString) {

        if (filterByString === undefined || filterByString === null) {
            filterByString = this.state.filterByString;
        }

        switch(filterByString) {
            case "All":
                this.getActivities()
                break;
            case "Team":                            
                this.getActivities(50, undefined, this.props.user.teamUid, undefined, undefined, undefined)
                break;
            case "Mine":
                this.getActivities(50, undefined, undefined, this.props.user.uid, undefined, undefined)
                break;
            default:
                if (this.props.user.uid === undefined || this.props.user.uid === null) {
                    this.getActivities()
                } else {
                    this.getActivities(50, undefined, undefined, this.props.user.uid, undefined, undefined)
                }
            }     
    }

    filterByChange = (filterString) => {
        this.setState({filterByString: filterString});
        // console.log(`Filter By ${filterString} activities`);
        this.refreshPage(filterString);
    }

    // Delete this article from MongoDB
    activityDelete = (id) => {
        ActivityDB.delete( id )
        .then(res => {
            console.log("Deleted activity");
            this.refreshPage();
        })
        .catch(err => {
            alert(err);
            console.error(err); 
        });
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
            return (<div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div>)
        } 

        // Search and filter
        let searchBy = this.state.searchBy;
        let filterByString = this.state.filterByString;

        let activities = this.state.activities;
        if (this.props.user.authUser) {
            // Conditional rendering
            let activityView = 
                <div>
                    <br></br>
                    <div className="row">
                        <div className="col s2 m2 text-bold blue-text">
                            Activities ({filterByString ? filterByString : 'All'})
                        </div>
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
                            <Button className="waves-effect waves-light btn"
                                onClick={() => this.filterByChange("All")}>All
                            </Button>
                        </div>
                        <div className="col s1 m1">
                            <Button className="waves-effect waves-light btn"
                                onClick={() => this.filterByChange("Team")}>Team
                            </Button>
                        </div>
                        <div className="col s1 m1">
                            <Button className="waves-effect waves-light btn"
                                onClick={() => this.filterByChange("Mine")}>Mine
                            </Button>
                        </div>
                        <div className="col s3 offset-s5 m3 offset-m5 blue-text input-field inline">
                            <input id="searchBy" name="searchBy" type="text" value={searchBy} onChange={this.onChange} />
                            <label htmlFor="searchBy">Search</label>                            
                            <i className="material-icons prefix">search</i>
                        </div>
                    </div>

                    <div className={classes.root}>
                        {activities.map((activity) => {
                            return (
                                <div key={activity.id}>
                                    <Activity activity={activity}
                                        layoutType={this.props.layoutType}
                                        activityDelete={this.activityDelete}
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
                                    <Link to="/activities">Activities ({filterByString})</Link>
                                </span>
                                
                                {activities.map((activity) => {
                                    return (
                                        <div key={activity.id}>
                                            <ActivityCard 
                                                activity={activity} layoutType={this.props.layoutType}
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