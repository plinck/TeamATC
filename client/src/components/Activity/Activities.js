import React from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';
import Box from "@material-ui/core/Box";
import { Button } from '@material-ui/core';

// For select input field
import FormControl from '@material-ui/core/FormControl';
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import Activity from './Activity';
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
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        minWidth: 200
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
            lastActivityDoc: undefined,
            searchBy: "",
            filterByString: "Mine",
            filterBy: "Mine",
            orderBy: "None",
            isLoading: true
        };
    }

    // Get All Activities on Mount - check if anything passed
    componentDidMount() {
        let filterByString = undefined;

        filterByString = this.props.location && this.props.location.state ? this.props.location.state.filterByString : undefined;

        if (!filterByString) {
            if (this.props.filterByString) {
                filterByString = this.props.filterByString
            } 
        }

        if (this.props.activities) {
            this.setState({ activities: this.props.activities });   
        } else {
            if (filterByString) {
                this.setState({filterByString: filterByString, filterBy: filterByString});
                this.getFilteredActivities(filterByString);
            } else {
                this.getFilteredActivities();
            }
        }
    }

    // ************************************************************
    // Database Interaction Methods   
    // ************************************************************
    // Get activities with a filter
    getFilteredActivities = (filterByString, lastActivityDoc) => {
        if (!filterByString || filterByString === null) {
            filterByString = this.state.filterByString;
        }

        let filterObj = {
            filterName: undefined,
            filterValue: undefined
        }

        switch(filterByString) {
            case "All":
                filterObj = undefined;
                break;
            case "Team":                            
                filterObj.filterName = "teamUid";
                filterObj.filterValue = this.props.user.teamUid;
                break;
            case "Mine":
                filterObj.filterName = "uid";
                filterObj.filterValue = this.props.user.uid;
                break;
            default:
                filterObj.filterName = "uid";
                filterObj.filterValue = this.props.user.uid;
            }     

        this.setState({isLoading: true});
        ActivityDB.getFiltered(filterObj, undefined, lastActivityDoc)
        .then(res => {
            let activities = res.activities;
            this.setState({ activities: activities, lastActivityDoc: res.lastActivityDoc, isLoading: false});
        }).catch(err => {
            this.setState({isLoading: false});
            console.error(err);
        });
    };

    // Get next page
    getNextPage = () => {
       let filterBy = this.state.filterBy;
       let lastActivityDoc = this.state.lastActivityDoc;
       let filterObj = {
            filterName: undefined,
            filterValue: undefined
       }

        switch(filterBy) {
            case "All":
                filterObj = undefined;
                break;
            case "Team":                            
                filterObj.filterName = "teamUid";
                filterObj.filterValue = this.props.user.teamUid;
                break;
            case "Mine":
                filterObj.filterName = "uid";
                filterObj.filterValue = this.props.user.uid;
                break;
            default:
                filterObj = undefined;
            }     

        this.setState({isLoading: true});
        ActivityDB.getFiltered(filterObj, undefined, lastActivityDoc)
        .then(res => {
            let activities = res.activities;
            this.setState({ activities: activities, lastActivityDoc: res.lastActivityDoc, isLoading: false});
        }).catch(err => {
            this.setState({isLoading: false});
            console.error(err);
        });
    };

    // Get acvities in certain order 
    getOrderedActivities = (orderBy) => {
        if (orderBy === undefined || orderBy === null) {
            orderBy = this.state.orderBy;
        }

        let orderObj = {
            orderName: undefined,
            orderValue: undefined
        }

        switch(orderBy) {
            case "Team":                            
                orderObj.orderName = "teamName";
                orderObj.orderValue = undefined;       // Ascending - "desc" is alternative
                break;
            case "Type":
                orderObj.orderName = "activityType";
                orderObj.orderValue = undefined;       // Ascending - "desc" is alternative
                break;
            default:
                orderObj = undefined;
            }     

        // Get with security
        // comes back sorted already
        this.setState({isLoading: true});
        ActivityDB.getOrdered(orderObj)
            .then(res => {
                let activities = res;
                this.setState({ activities: activities, isLoading: false});
            })
            .catch(err => {
                this.setState({isLoading: false});
                console.error(err);
            });
    };

    // Delete this activity
    activityDelete = (id) => {
        ActivityDB.delete( id )
        .then(res => {
            console.log("Deleted activity");
            this.getFilteredActivities();
        })
        .catch(err => {
            alert(err);
            console.error(err); 
        });
    }
    
    // ************************************************************
    // Form Change Handlers - try to keeo grouped    
    // ************************************************************
    // general change
    handleChange = event => {
        // Set Units
        switch (event.target.name) {
            case "filterBy":
                this.setState({
                    "filterByString": event.target.value,
                    "filterBy": event.target.value,
                });
                this.getFilteredActivities(event.target.value);
                break;
            case "orderBy":
                this.setState({
                    "orderBy": event.target.value
                });
                this.getOrderedActivities(event.target.value);
                break;
            case "searchBy": 
                this.setState({
                    [event.target.name]: event.target.value,
                });
                this.getFilteredActivities(event.target.value);
                break;
            default:
                break;
        }
    };

    // ************************************************************
    // Build JSX Components   
    // ************************************************************

    // Now we can render page - DO NOT change state in render()
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
        if (this.state.activities === null || this.state.isLoading) {
            return (<div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div>)
        } 

        // Search and filter
        //let searchBy = this.state.searchBy;
        let filterBy = this.state.filterBy;
        //let orderBy = this.state.orderBy;
        let activities = this.state.activities;
        
        const sortFilterRow = 
            <Box className="row"  border={1} m={1} p={0}>
                <FormControl className={`${classes.formControl} col s3 m3`} variant="filled">
                    <InputLabel id="filterByLabel">Filter By</InputLabel>
                    <Select
                        labelId="filterByLabel"
                        id="filterBy"
                        value={filterBy}
                        name="filterBy"
                        type="text"
                        margin="normal"
                        className={classes.textField}
                        style={{marginTop: 23, marginBottom: 16, padding: 0}}
                        onChange={this.handleChange}
                        >
                        <MenuItem value={"Mine"}>Mine</MenuItem>
                        <MenuItem value={"Team"}>Team</MenuItem>
                        <MenuItem value={"All"}>All</MenuItem>
                    </Select>
                </FormControl>

                {/*  Get rid of order by for now.  
                <FormControl variant="filled" className={`${classes.formControl} col s3 m3`}>
                    <InputLabel id="orderByLabel">Order By</InputLabel>
                    <Select
                        labelId="orderByLabel"
                        name="orderBy"
                        id="orderBy"
                        value={orderBy}
                        onChange={this.handleChange}
                        className={classes.textField}
                        style={{marginTop: 23, marginBottom: 16, padding: 0}}
                        >
                        <MenuItem value={"None"}><em>None</em></MenuItem>
                        <MenuItem value={"Team"}>Team</MenuItem>
                        <MenuItem value={"Type"}>Type</MenuItem>
                    </Select>
                </FormControl>
                */}

                {/* Get rid of seacrh until we can implement it 
                <div className="col s3 m3 blue-text input-field inline align-right">
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
                                marginTop: 0,
                                marginBottom: 16,
                                padding: 15
                            }, 
                            endAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                        onChange={this.handleChange}
                        />
                </div>
                */}
                
                <div className="col s2 m2">
                    <Link to="/activityform">
                        <i style={{cursor: 'pointer', marginTop: 5, marginRight: 1}}
                            className="material-icons indigo-text text-darken-4">add
                        </i>{" "}
                    </Link>
                    <CSVLink
                        data={activities}
                        filename={'teamatc-transactions.csv'}
                        target="_blank">
                        <i style={{cursor: 'pointer', marginTop: 5, marginRight: 1}}
                            className="material-icons indigo-text text-darken-4">system_update_alt
                        </i>
                    </CSVLink> 
                    <Button onClick={this.getNextPage}>Page
                        {/*
                            <i style={{cursor: 'pointer', marginTop: 5, marginRight: 1}}
                            className="material-icons indigo-text text-darken-4">skip_previous
                        </i>
                        */}
                        <i style={{cursor: 'pointer', marginTop: 5, marginRight: 1}}
                            className="material-icons indigo-text text-darken-4">skip_next
                        </i>
                    </Button>
                </div>
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

        if (this.props.user.authUser) {
            // Conditional rendering
            let activityView = 
                <div>
                    {sortFilterRow}
                    {headerRow}
                    <div className={classes.root}>
                        {activities.map((activity, index) => {
                            return (
                                <div key={activity.id}>
                                    <Activity activity={activity}
                                        activityDelete={this.activityDelete}
                                        index={index}
                                    />
                                </div>
                            );
                        })} 
                    </div>
                </div>

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