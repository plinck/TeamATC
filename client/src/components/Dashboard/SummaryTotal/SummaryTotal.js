import React from 'react';
import { Link } from 'react-router-dom';
import './SummaryTotal.css'
import { Grid, Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    bikeText: {
        color: '#ff0000'
    },
    swimText: {
        color: "#0099ff"
    },
    runText: {
        color: "#33cc32"
    },
    otherText: {
        color: '#ffa500'
    },
}))

const SummaryTotal = (props) => {
    const classes = useStyles();

    // wait for props
    if (!props.currentUserTotals || !props.currentTeamTotals) {
        return (null);
    }

    let userSwimDistanceTotalYards = props.currentUserTotals.swimDistanceTotal * 1760;
    let teamSwimDistanceTotalYards = props.currentTeamTotals.swimDistanceTotal * 1760;
    let allSwimDistanceTotalYards = props.currentAllTotals.swimDistanceTotal * 1760;

    return (
        <Grid container spacing={1}>
            {/*<-- Mine -->*/}
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" >
                            <i>
                                <Link to="/activities" style={{ textDecoration: "none", color: 'grey' }}> Mine</Link>
                            </i>
                        </Typography>
                        {/* Begin Nbr */}
                        <h5>
                            {"Activities: "}
                            {props.currentUserTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h5>
                        <h6 className={classes.swimText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "}
                            {props.currentUserTotals.swimNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>
                        <h6 className={classes.bikeText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "}
                            {props.currentUserTotals.bikeNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>
                        <h6 className={classes.runText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "}
                            {props.currentUserTotals.runNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>
                        <h6 className={classes.otherText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"other"} />{"other: "}
                            {props.currentUserTotals.otherNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>

                        {/* End Nbr */}

                        {/* Begin Distance */}
                        <h5>
                            {"Distance: "}
                            {props.currentUserTotals.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h5>
                        <h6 className={classes.swimText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "}
                            {userSwimDistanceTotalYards.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                        </h6>
                        <h6 className={classes.bikeText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "}
                            {props.currentUserTotals.bikeDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h6>
                        <h6 className={classes.runText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "}
                            {props.currentUserTotals.runDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h6>
                        <h6 className={classes.otherText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"other"} />{"other: "}
                            {props.currentUserTotals.otherDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h6>

                        {/* End Distance */}

                        {/* Begin Duraation */}
                        <h5>
                            {"Duration: "}
                            {props.currentUserTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h5>
                        <h6 className={classes.swimText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "}
                            {props.currentUserTotals.swimDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>
                        <h6 className={classes.bikeText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "}
                            {props.currentUserTotals.bikeDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>
                        <h6 className={classes.runText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "}
                            {props.currentUserTotals.runDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>
                        <h6 className={classes.otherText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"other"} />{"other: "}
                            {props.currentUserTotals.otherDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>

                        {/* End Distance */}
                    </CardContent>
                </Card>
            </Grid>

            {/*<-- Team -->*/}
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" >
                            <i>
                                <Link to="/activities" style={{ textDecoration: "none", color: 'grey' }}> Team</Link>
                            </i>
                        </Typography>

                        {/* Begin Nbr */}
                        <h5>
                            {"Activities: "}
                            {props.currentTeamTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h5>
                        <h6 className={classes.swimText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "}
                            {props.currentTeamTotals.swimNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>
                        <h6 className={classes.bikeText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "}
                            {props.currentTeamTotals.bikeNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>
                        <h6 className={classes.runText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "}
                            {props.currentTeamTotals.runNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>
                        <h6 className={classes.otherText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"other"} />{"other: "}
                            {props.currentTeamTotals.otherNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>
                        {/* End Nbr */}

                        {/* Begin Distance */}
                        <h5>
                            {"Distance: "}
                            {props.currentTeamTotals.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h5>
                        <h6 className={classes.swimText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "}
                            {teamSwimDistanceTotalYards.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                        </h6>
                        <h6 className={classes.bikeDistanceTotal}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "}
                            {props.currentTeamTotals.bikeDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h6>
                        <h6 className={classes.runText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "}
                            {props.currentTeamTotals.runDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h6>
                        <h6 className={classes.otherDistanceTotal}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"other"} />{"other: "}
                            {props.currentTeamTotals.otherDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h6>
                        {/* End Distance */}

                        {/* Begin Duraation */}
                        <h5>
                            {"Duration: "}
                            {props.currentTeamTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h5>
                        <h6 className={classes.swimText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "}
                            {props.currentTeamTotals.swimDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>
                        <h6 className={classes.bikeText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "}
                            {props.currentTeamTotals.bikeDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>
                        <h6 className={classes.runText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "}
                            {props.currentTeamTotals.runDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>
                        <h6 className={classes.otherText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"other"} />{"other: "}
                            {props.currentTeamTotals.otherDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>

                        {/* End Distance */}
                    </CardContent>
                </Card>
            </Grid >

            {/*<-- All -->*/}
            < Grid item xs={12} md={4} >
                <Card>
                    <CardContent>
                        <Typography variant="h6" >
                            <i>
                                <Link to="/activities" style={{ textDecoration: "none", color: 'grey' }}> All Activities</Link>
                            </i>
                        </Typography>

                        {/* Begin Nbr */}
                        <h5>
                            {"Activities: "}
                            {props.currentAllTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h5>
                        <h6 className={classes.swimText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "}
                            {props.currentAllTotals.swimNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>
                        <h6 className={classes.bikeText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "}
                            {props.currentAllTotals.bikeNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>
                        <h6 className={classes.runText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "}
                            {props.currentAllTotals.runNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>
                        <h6 className={classes.otherText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"other"} />{"other: "}
                            {props.currentAllTotals.otherNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </h6>

                        {/* End Nbr */}

                        {/* Begin Distance */}
                        <h5>
                            {"Distance: "}
                            {props.currentAllTotals.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h5>
                        <h6 className={classes.swimText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "}
                            {allSwimDistanceTotalYards.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                        </h6>
                        <h6 className={classes.bikeText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "}
                            {props.currentAllTotals.bikeDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h6>
                        <h6 className={classes.runText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "}
                            {props.currentAllTotals.runDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h6>
                        <h6 className={classes.otherText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"other"} />{"other: "}
                            {props.currentAllTotals.otherDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                        </h6>

                        {/* End Distance */}

                        {/* Begin Duraation */}
                        <h5>
                            {"Duration: "}
                            {props.currentAllTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h5>
                        <h6 className={classes.swimText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "}
                            {props.currentAllTotals.swimDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>
                        <h6 className={classes.bikeText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "}
                            {props.currentAllTotals.bikeDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>
                        <h6 className={classes.runText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "}
                            {props.currentAllTotals.runDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>
                        <h6 className={classes.otherText}>
                            <img style={{ maxHeight: '20px' }} src={"/images/icons8-triathlon-50.png"} alt={"other"} />{"other: "}
                            {props.currentAllTotals.otherDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                        </h6>

                        {/* End Distance */}
                    </CardContent>
                </Card>
            </Grid >
        </Grid >
    )
}

export default SummaryTotal;