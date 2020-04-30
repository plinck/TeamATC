import React from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { ButtonGroup, Grid, CircularProgress, Button, Container, FormControl, InputLabel, MenuItem, Select, Typography, Tooltip } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add';
import GetAppIcon from '@material-ui/icons/GetApp';
import PoolIcon from '@material-ui/icons/Pool';
import DirectionsBikeIcon from '@material-ui/icons/DirectionsBike';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import BuildIcon from '@material-ui/icons/Build';

import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import Activity from './Activity';
import ActivityDB from './ActivityDB';

import { withStyles } from '@material-ui/core/styles';
// eslint-disable-next-line no-unused-vars
import { CSVLink, CSVDownload } from "react-csv";

const styles = theme => ({
    act: {
        width: '100%',
        overflow: "auto",
        [theme.breakpoints.up('md')]: {
            height: "79vh"
        },
        height: "74vh"
    },
    root: {
        [theme.breakpoints.up('md')]: {
            marginLeft: "57px",
        },
        paddingTop: "10px"
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    progress: {
        margin: theme.spacing(2),
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    inputFix: {
        marginTop: 50
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    //style for font size
    resize: {
        fontSize: 200
    },
    csvButton: {
        [theme.breakpoints.down('md')]: {
            display: "none"
        },
        textDecoration: "none"
    }
});

class Activities extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activities: [],
            lastActivityDoc: undefined,
            searchBy: "",
            filterByString: "Mine",
            filterBy: "Mine",
            orderBy: "None",
            isLoading: true,
            typeFilter: "All"
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
                this.setState({ filterByString: filterByString, filterBy: filterByString });
                this.getFilteredActivities(filterByString);
            } else {
                this.getFilteredActivities();
            }
        }
    }

    filterByType(type) {
        this.setState({ typeFilter: type })
    }

    displayFilter(activities) {
        if (this.state.typeFilter === "All") return activities
        if (this.state.typeFilter === "Swim") return activities.filter(act => act.activityType === "Swim")
        if (this.state.typeFilter === "Bike") return activities.filter(act => act.activityType === "Bike")
        if (this.state.typeFilter === "Run") return activities.filter(act => act.activityType === "Run")
        if (this.state.typeFilter === "Other") return activities.filter(act => act.activityType === "Other")
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

        switch (filterByString) {
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

        this.setState({ isLoading: true });
        ActivityDB.getFiltered(filterObj, undefined, lastActivityDoc)
            .then(res => {
                let activities = res.activities;
                this.setState({ activities: activities, lastActivityDoc: res.lastActivityDoc, isLoading: false });
            }).catch(err => {
                this.setState({ isLoading: false });
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

        switch (filterBy) {
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

        this.setState({ isLoading: true });
        ActivityDB.getFiltered(filterObj, undefined, lastActivityDoc)
            .then(res => {
                let newActivities = res.activities;
                let joined = this.state.activities.concat(newActivities)
                this.setState({ activities: joined, lastActivityDoc: res.lastActivityDoc, isLoading: false });
            }).catch(err => {
                this.setState({ isLoading: false });
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

        switch (orderBy) {
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
        this.setState({ isLoading: true });
        ActivityDB.getOrdered(orderObj)
            .then(res => {
                let activities = res;
                this.setState({ activities: activities, isLoading: false });
            })
            .catch(err => {
                this.setState({ isLoading: false });
                console.error(err);
            });
    };

    // Delete this activity
    activityDelete = (id) => {
        ActivityDB.delete(id)
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
            return (<Grid container style={{ marginTop: '10px' }} justify="center"><CircularProgress /> <p>Loading ...</p> </Grid>)

        }

        if (!this.state.activities || this.state.activities === null) {
            console.error("Fatal Error")
            return (<div> <p>FATAL ERROR Gettng activities ...</p> </div>)
        }

        // Search and filter
        //let searchBy = this.state.searchBy;
        let filterBy = this.state.filterBy;
        //let orderBy = this.state.orderBy;
        let activities = this.state.activities;

        const sortFilterRow =
            <Grid container>
                <Grid
                    container
                    item
                    xs={12}
                    direction="row"
                    justify="space-between"
                    alignItems="center">
                    <Grid item xs={6}>
                        <Typography variant="h4">
                            Activities
                    </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={6}
                        style={{ textAlign: "right" }}>
                        <Link to="/activityform" style={{ color: 'grey', textDecoration: "none" }}>
                            <Tooltip title="New Activity">
                                <Button color="default" startIcon={<AddIcon />}>
                                    New Activity
                                </Button>
                            </Tooltip>
                        </Link>
                        <CSVLink
                            className={classes.csvButton}
                            data={activities}
                            filename={'teamatc-transactions.csv'}
                            target="_blank">
                            <Button color="default" startIcon={<GetAppIcon />}>
                                Export CSV
                                </Button>
                        </CSVLink>
                    </Grid>
                </Grid>
                <Grid
                    container
                    item
                    xs={12}
                    direction="row"
                    justify="space-between"
                    alignItems="center">
                    <Grid item xs={12} md={6}>
                        <FormControl className={classes.formControl}>
                            <InputLabel id="filterByLabel">Filter By</InputLabel>
                            <Select
                                labelId="filterByLabel"
                                id="filterBy"
                                name="filterBy"
                                value={filterBy}
                                onChange={this.handleChange}
                                label="Filter By"
                            >
                                <MenuItem value={"Mine"}>Mine</MenuItem>
                                <MenuItem value={"Team"}>Team</MenuItem>
                                <MenuItem value={"All"}>All</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid
                        item
                        xs={6}
                        style={{ textAlign: "right" }}>
                        <ButtonGroup color="primary">
                            <Tooltip title="All">
                                <Button onClick={() => this.filterByType("All")} variant={this.state.typeFilter === "All" ? "contained" : "outlined"} >All</Button>
                            </Tooltip>
                            <Tooltip title="Swim">
                                <Button onClick={() => this.filterByType("Swim")} variant={this.state.typeFilter === "Swim" ? "contained" : "outlined"}><PoolIcon /></Button>
                            </Tooltip>
                            <Tooltip title="Bike">
                                <Button onClick={() => this.filterByType("Bike")} variant={this.state.typeFilter === "Bike" ? "contained" : "outlined"}><DirectionsBikeIcon /></Button>
                            </Tooltip>
                            <Tooltip title="Run">
                                <Button onClick={() => this.filterByType("Run")} variant={this.state.typeFilter === "Run" ? "contained" : "outlined"}><DirectionsRunIcon /></Button>
                            </Tooltip>
                            <Tooltip title="Other">
                                <Button onClick={() => this.filterByType("Other")} variant={this.state.typeFilter === "Other" ? "contained" : "outlined"}><BuildIcon /></Button>
                            </Tooltip>
                        </ButtonGroup>
                    </Grid>
                    {/* <Button onClick={this.getNextPage}>Page
                        <i style={{ cursor: 'pointer', marginTop: 5, marginRight: 1 }}
                            className="material-icons indigo-text text-darken-4">skip_next
                        </i>
                    </Button> */}
                </Grid>
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
            </Grid >


        if (this.props.user.authUser) {
            // Conditional rendering
            let activityView =
                <div>
                    {sortFilterRow}
                    <div className={classes.act}>
                        {this.displayFilter(activities).map((activity, index) => {
                            return (
                                <div key={activity.id}>
                                    <Activity activity={activity}
                                        activityDelete={this.activityDelete}
                                        index={index}
                                    />
                                </div>
                            );
                        })}
                        {this.state.activities.length >= 100 ? <div style={{ textAlign: "center" }}>
                            <Button disabled={this.state.isLoading} onClick={this.getNextPage} variant="contained" color="primary">{this.state.isLoading ? <CircularProgress size={14} /> : "Load More"}</Button>
                        </div> : null}
                    </div>
                </div>

            return (
                <div style={{ backgroundColor: "#f2f2f2" }} className={classes.root}>
                    <Container maxWidth="xl">
                        {activityView}
                    </Container>
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