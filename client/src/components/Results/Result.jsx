import React from "react";
import { withRouter } from "react-router-dom";
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { TableCell, TableRow } from "@material-ui/core";

import { withStyles } from "@material-ui/core/styles";

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
  mobile: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
});

class Result extends React.Component {
  calcPercentComplete(total, challengeDistance) {
    if (challengeDistance === 0) {
      return ("100%");
    } else {
      const percent = total/challengeDistance * 100;
      const displayPercent = percent.toFixed(0).toString().replace(/\B(?=(\d{0})+(?!\d))/g, ",");
      return (`${displayPercent}%`);
    }
  }
  render() {
    // Deconstruct Props
    const {
      challengeUid,
      overallRecord,
      teamRecord,
      teamUid,
      teamName,
      userRecord,
      uid,
      displayName,
      distanceTotal,
      pointsTotal,
      durationTotal,
      nbrActivities,
      swimDistanceTotal,
      swimPointsTotal,
      swimNbrActivities,
      swimDurationTotal,
      bikeDistanceTotal,
      bikePointsTotal,
      bikeNbrActivities,
      bikeDurationTotal,
      rank,
      runDistanceTotal,
      runPointsTotal,
      runNbrActivities,
      runDurationTotal,
      otherDistanceTotal,
      otherPointsTotal,
      otherNbrActivities,
      otherDurationTotal,
      updateDateTime,
    } = this.props.result;

    // make sure you have a user before displaying
    if (this.props.user.uid === null) {
      return null;
    }

    // Band odd rows for clarity
    let rowBg = "";
    if (this.props.index % 2 === 0) {
      rowBg = "info.main";
    }
    if (this.props.result.teamRecord && !this.props.onlyTeams) {
      rowBg = "yellow";
    }

    // <TableCell>Place</TableCell>
    // <TableCell>Name</TableCell>
    // <TableCell>Team</TableCell>
    // <TableCell>Time</TableCell>
    // <TableCell>Progress</TableCell>
    // <TableCell>Total</TableCell>

    return (
      <TableRow 
      key={this.props.index} 
      hover
      tabIndex={-1} 
      style={{ backgroundColor: `${rowBg}` }}>
        <TableCell>{rank}</TableCell>
        <TableCell>
          {uid && uid === this.props.user.uid ? (
            <img
              style={{ maxHeight: "20px" }}
              src={"/images/me.png"}
              alt={"me"}
            />
          ) : (
            null
          )}
          {userRecord ? displayName : teamName}
        </TableCell>
        <TableCell>{teamName}</TableCell>
        <TableCell align="right">
          {durationTotal
            .toFixed(0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </TableCell>
        <TableCell align="right">
          {this.props.context.challengeDistance ? this.calcPercentComplete(pointsTotal, this.props.context.challengeDistance) : "NA"}
        </TableCell>
        <TableCell align="right">
          {pointsTotal
            .toFixed(0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </TableCell>
        <TableCell align="right">
          {swimPointsTotal
            .toFixed(0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </TableCell>
        <TableCell align="right">
          {bikePointsTotal
            .toFixed(0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </TableCell>
        <TableCell align="right">
          {runPointsTotal
            .toFixed(0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </TableCell>
        <TableCell align="right">
          {otherPointsTotal
            .toFixed(0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </TableCell>
      </TableRow>
    ); // return
  } // render()
} // class

export default withAuthUserContext(withRouter(withStyles(styles)(Result)));
