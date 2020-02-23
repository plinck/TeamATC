import React from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Box from "@material-ui/core/Box";
import SearchIcon from "@material-ui/icons/Search";
import TextField from '@material-ui/core/TextField';
import { InputAdornment } from '@material-ui/core';

// For select input field
import FormControl from '@material-ui/core/FormControl';
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

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
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120
      },
    inputFix: {
        marginTop: 50
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
        //style for font size
    resize:{
        fontSize:200
    }
});

class Activities extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activities: null,
            searchBy: "",
            filterByString: null,
            filterBy: "All"
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

    onChange = event => {
        // Set Units
        if (event.target.name === "searchBy") {
            this.setState({
                [event.target.name]: event.target.value,
            });
        } else {
            if (event.target.name === "filterBy") {
                this.setState({
                    "filterByString": event.target.value,
                });
                this.refreshPage(event.target.value);
            } 
        }
    };

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
        let filterBy = this.state.filterBy;
        
        const sortFilterRow = 
            <Box className="row"  border={1} m={0} p={0}>
            {/*
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
                */}

                <form className={classes.container} noValidate autoComplete="off" >
                        <FormControl variant="outlined" required className={classes.formControl}>
                            <InputLabel id="filterByLabel">Filter By</InputLabel>
                            <Select
                                labelId="filterByLabel"
                                id="filterBy"
                                value={filterBy}
                                name="filterBy"
                                type="text"
                                margin="normal"
                                className={classes.textField}
                                style={{marginTop: 23, marginBottom: 16, padding: 0}}>
                                onChange={this.onChange}
                                <MenuItem value={"Mine"}>Mine</MenuItem>
                                <MenuItem value={"Team"}>Team</MenuItem>
                                <MenuItem value={"All"}>All</MenuItem>
                            </Select>
                        </FormControl>

                    <div className="blue-text input-field inline align-right">
                            <TextField
                            id="searchBy"
                            name="searchBy"
                            value={searchBy}
                            label="Search"
                            type='text'
                            variant="outlined"
                            margin="normal"
                            className={classes.textField}
                            InputProps={{
                                style: {
                                    margin: 0,
                                    padding: 19
                                }, 
                                endAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                            onChange={this.onChange}
                        />
                    </div>
                </form>
            </Box>

        const headerRow = 
        <Box className="row"  fontStyle="oblique" fontWeight="fontWeightBold" border={1} m={0}>
            <div className="col s1 m1">
            </div>
            <div className="col s4 m2 truncate">
                Team
            </div>
            <div className="black-text col s4 m2 truncate">
                Athlete
            </div>
            <div className="blue-text col s3 m2 truncate">
                Date
            </div>
            <div className="red-text col s4 m2 truncate">
                Name
            </div>
            <div className="green-text col s4 m1 truncate">
                Hrs
            </div>
            <div className="green-text col s4 m1 truncate">
                Distance
            </div>
        </Box>


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

                    {sortFilterRow}
                    {headerRow}
                    <div className={classes.root}>
                        {activities.map((activity, index) => {
                            return (
                                <div key={activity.id}>
                                    <Activity activity={activity}
                                        layoutType={this.props.layoutType}
                                        activityDelete={this.activityDelete}
                                        index={index}
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
                                
                                {activities.map((activity, index) => {
                                    return (
                                        <div key={activity.id}>
                                            <ActivityCard 
                                                activity={activity} layoutType={this.props.layoutType} index={index}
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