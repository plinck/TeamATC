import React, { useState, useEffect } from "react";
import MapUser from "./MapUser";
//import { Card, CardContent, Grid, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import {
  Card,
  CardContent,
  Grid,
  Box,
  Typography,
  Button,
  Tooltip,
  ButtonGroup,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import moment from "moment";

const styles = (theme) => ({
  text: {
    marginBottom: "-10px",
  },
  noWrap: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      marginRight: "5px",
    },
  },
  caption: {
    fontStyle: "italic",
  },
  header: {
    marginBottom: "-10px",
    fontWeight: "bold",
  },
  mobile: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
});

const GoogleMapUser = (props) => {
  const { classes } = props;

  const handlePress = (e) => {
    e.stopPropagation();
    props.callbackParent({ isDraggable: false });
  };

  const [totalDist, setTotalDist] = useState(0);
  // legTotals is a copy to Results with the next leg info added to it
  const [legTotals, setLegTotals] = useState(props.results.user);

  const [data, setData] = useState("users");

  const computeTotalDistance = (result) => {
    let totalDist = 0;
    var myroute = result.routes[0];
    for (let i = 0; i < myroute.legs.length; i++) {
      totalDist += myroute.legs[i].distance.value;
    }
    totalDist = totalDist / 1000 / 1.609344; //km to miles
    setTotalDist(totalDist);
  };

  const calcCompletion = (distance) => {
    if (distance >= totalDist) {
      return 100;
    } else {
      return parseInt((distance / totalDist) * 100);
    }
  };

  // Using the results array, attach the leg info to each record
  // legs come from the map component and atre computed after the route is drawn
  // This function goes through each result and sees whwere they are on the route, then
  // attaches next legh info to their results record
  // TODO :- Right now the function state values are not displayed on the dashboard
  // unless you go into the debugger.  It must be a timing issuie with state vars but
  // I have yet to figure it out
  const calcNextLegInfo = (legs, newResults) => {
    let newLegTotals = newResults;
    //Loop through each result - either by team or User
    for (let k = 0; k < newLegTotals.length; k++) {
      let totalDistanceToNextLeg = 0;
      let nextLegName = "";
      let distanceToNextLeg = 0;
      let nextLegCompletionPercent = 0;
      let nextLegIdx = 0;
      let includedDistanceTotal = 0;

      let i = 0;
      // Loop until you find the next leg based on your distance
      // This loop will end where you are "in between" two legs
      // Then you just need to extract the leg info an attach to result record
      includedDistanceTotal += props.challenge.isSwim
        ? newLegTotals[k].swimPointsTotal
        : 0;
      includedDistanceTotal += props.challenge.isBike
        ? newLegTotals[k].bikeDistanceTotal
        : 0;
      includedDistanceTotal += props.challenge.isRun
        ? newLegTotals[k].runPointsTotal
        : 0;
      includedDistanceTotal += props.challenge.isOther
        ? newLegTotals[k].otherDistanceTotal
        : 0;

      for (
        i = 0;
        i < legs.length && totalDistanceToNextLeg < includedDistanceTotal;
        i++
      ) {
        let legDistance = legs[i].distance.value / 1000 / 1.609344; // to miles
        totalDistanceToNextLeg += legDistance;
        nextLegIdx = i;
      }

      nextLegName = legs[nextLegIdx].end_address;
      distanceToNextLeg = totalDistanceToNextLeg - includedDistanceTotal;
      if (distanceToNextLeg <= 0) {
        nextLegCompletionPercent = 100;
      } else if (includedDistanceTotal >= totalDistanceToNextLeg) {
        nextLegCompletionPercent = 100;
      } else {
        nextLegCompletionPercent = parseInt(
          (includedDistanceTotal / totalDistanceToNextLeg) * 100
        );
      }

      newLegTotals[k].nextLegName = nextLegName;
      newLegTotals[k].distanceToNextLeg = distanceToNextLeg
        .toFixed(0)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      newLegTotals[k].nextLegCompletionPercent = nextLegCompletionPercent;
      newLegTotals[k].includedDistanceTotal = includedDistanceTotal;
      newLegTotals[k].includedDistanceTotalDisplay = includedDistanceTotal
        .toFixed(0)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    setLegTotals(newLegTotals);
  };

  let challengeMapIncludes = "";
  if (props.challenge.isSwim) {
    challengeMapIncludes += "Swim(x10) ";
  }
  if (props.challenge.isBike) {
    challengeMapIncludes += "Bike ";
  }
  if (props.challenge.isRun) {
    challengeMapIncludes += "Run(x3) ";
  }
  if (props.challenge.isOther) {
    challengeMapIncludes += "Other ";
  }
  console.log(`updatedResults: ${props.updatedResults}`);

  return (
    <Card style={{ height: "100%" }}>
      <CardContent style={{ height: "100%" }}>
        <Box
          style={{ marginBottom: "10px" }}
          fontStyle="oblique"
          fontWeight="fontWeightBold"
        >
          <span style={{ color: "grey" }}>
            {props.title ? props.title : "Challenge Map"}
          </span>
          <ButtonGroup
            style={{ float: "right" }}
            color="primary"
            onMouseDown={(e) => handlePress(e)}
          >
            <Tooltip title="Users">
              <Button
                size="small"
                onClick={() => setData("users")}
                variant={data === "users" ? "contained" : "outlined"}
              >
                Users
              </Button>
            </Tooltip>
            <Tooltip title="Teams">
              <Button
                size="small"
                onClick={() => setData("teams")}
                variant={data === "teams" ? "contained" : "outlined"}
              >
                Teams
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
        <Grid container style={{ height: "91%" }} spacing={2}>
          <Grid
            style={{ height: "100%", padding: "5px 0px" }}
            item
            xs={12}
            sm={9}
            md={8}
            onMouseDown={(e) => handlePress(e)}
          >
            <MapUser
              id="myMap"
              options={{
                center: { lat: 37.0902, lng: -95.7129 },
                zoom: 8,
                streetViewControl: false,
                fullscreenControl: false,
                mapTypeControl: false,
              }}
              rerender={data}
              challenge={props.challenge}
              results={
                data === "users" ? props.results.user : props.results.team
              }
              updatedResults={props.updatedResults}
              start={props.start}
              end={props.end}
              waypoints={props.waypoints}
              computeTotalDistance={computeTotalDistance}
              calcNextLegInfo={calcNextLegInfo}
              totalDist={totalDist}
            />
          </Grid>
          <Grid
            container
            item
            xs={false}
            sm={3}
            md={4}
            style={{ paddingTop: "0px" }}
          >
            <Grid item xs={12}>
              <Typography variant="h5" style={{ textAlign: "center" }}>
                Challenge Details
              </Typography>
              <ul style={{ margin: "5px 10px" }}>
                <li>Start Point: {props.start} </li>
                <li>End Point: {props.end} </li>
                <li>
                  Total Distance:{" "}
                  {totalDist
                    .toFixed(0)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                  mi
                </li>
                <li>
                  Challenge Ends:{" "}
                  {props.endDate
                    ? moment(props.endDate).format("MM-DD-YYYY")
                    : "N/A"}
                </li>
                <li>Challenge Totals Include: {challengeMapIncludes}</li>
              </ul>
            </Grid>
            <Grid item xs={12} style={{ textAlign: "center" }}>
              <Typography variant="h5">Leaders</Typography>
              <Grid container justify="space-between" alignItems="center">
                <Grid
                  style={{ textAlign: "left" }}
                  className={classes.mobile}
                  item
                  xs
                  md={5}
                >
                  <Typography className={classes.header}>Name</Typography>
                </Grid>
                <Grid className={classes.mobile} item xs={false} md={3}>
                  <Typography className={classes.header}>
                    Distance (mi)
                  </Typography>
                </Grid>
                <Grid className={classes.mobile} item xs={false} md={3}>
                  <Typography className={classes.header}>
                    Completion (%)
                  </Typography>
                </Grid>
              </Grid>
              <hr></hr>
              {legTotals
                .sort((x, y) => {
                  const yDist = y.includedDistanceTotal
                    ? y.includedDistanceTotal
                    : 0;
                  const xDist = x.includedDistanceTotal
                    ? x.includedDistanceTotal
                    : 0;
                  return yDist - xDist;
                })
                .map((result, index) => (
                  <Grid
                    container
                    key={index}
                    justify="space-between"
                    alignItems="center"
                  >
                    <Grid
                      style={{ textAlign: "left" }}
                      className={classes.noWrap}
                      item
                      xs
                      md={5}
                    >
                      <Typography className={classes.text}>
                        {result.userRecord
                          ? result.displayName
                          : result.teamRecord
                          ? result.teamName
                          : "all"}
                      </Typography>
                      <Typography className={classes.caption} variant="caption">
                        Next:{result.nextLegName}
                      </Typography>
                    </Grid>
                    <Grid className={classes.mobile} item xs={false} md={3}>
                      <Typography className={classes.text}>
                        {result.includedDistanceTotalDisplay
                          ? result.includedDistanceTotalDisplay
                          : 0}
                      </Typography>
                      <Typography className={classes.caption} variant="caption">
                        {result.distanceToNextLeg} mi{" "}
                      </Typography>
                    </Grid>
                    <Grid className={classes.mobile} item xs={false} md={3}>
                      <Typography className={classes.text}>
                        {calcCompletion(
                          result.includedDistanceTotal
                            ? result.includedDistanceTotal
                            : 0
                        )}
                        %
                      </Typography>
                      <Typography className={classes.caption} variant="caption">
                        {result.nextLegCompletionPercent}%
                      </Typography>
                    </Grid>
                  </Grid>
                ))}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default withStyles(styles)(GoogleMapUser);
