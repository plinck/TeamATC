import React from 'react';
import { Redirect } from 'react-router';
import { withContext } from "../Auth/Session/Context";
import { withStyles } from '@material-ui/core/styles';
import Util from "../Util/Util";
import {  Button } from "@material-ui/core";

const styles = theme => ({
  root: {
    [theme.breakpoints.up('md')]: {
      marginLeft: "57px",
    },
    paddingTop: "10px"
  }
});

class AdminFunctions extends React.Component {
  
  recalculateTotals(challengeUid) {
    const firebase = Util.getFirebaseAuth();

    if (challengeUid && challengeUid !== "") {
      const request = {challengeUid: challengeUid};
      
      const forceRecalculation = firebase.functions.httpsCallable('forceRecalculation');
      forceRecalculation(request).then( (res) => {
          // Read result of the Cloud Function.
          console.log(`Sent request to recalculating totals for challenge: ${challengeUid}`);
      }).catch(err => {
          console.error(`${err}`);
        });
    } else {
      console.error(`No challengeUid Found, cant recalc totals`);
    }
  }


  render() {

    const { classes } = this.props;

    // Some props take time to get ready so return null when uid not avaialble
    if (this.props.context.uid === null) {
      return null;
    }

    if (this.props.context.isAdmin) {
      return (
        <div className={classes.root}>
          <Button 
            onClick={() => this.recalculateTotals(this.props.context.challengeUid)}
            variant="contained"
            color="primary"
            className={classes.button}>
              Recalculate Totals
          </Button>
        </div>
      );
    } else {
      return (
        <Redirect to="/signin" />
      );
    }
  }
}

export default withContext(withStyles(styles)(AdminFunctions));