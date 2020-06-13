import React from 'react';
import { Redirect } from 'react-router';
import { withContext } from "../Auth/Session/Context";
import { Button, StyleRules, WithStyles, createStyles, Theme, withStyles } from "@material-ui/core";

import Util from "../Util/Util";
import { ContextType } from "../../interfaces/Context.Types";
import { Challenge } from '../../interfaces/Challenge';


const styles: (theme: Theme) => StyleRules<string> = theme =>
  createStyles({
    root: {
      [theme.breakpoints.up('md')]: {
        marginLeft: "57px",
      },
      paddingTop: "10px"
    }
  });

interface ContextProps {
    context: ContextType;
}

type Props =  WithStyles<typeof styles> & ContextProps;

class AdminFunctions extends React.Component<Props> {
  
  recalculateTotals(challengeUid: string) {
    const firebase = Util.getFirebaseAuth();

    if (challengeUid && challengeUid !== "") {
      const request = {challengeUid};
      
      const forceRecalculation = firebase.functions.httpsCallable('forceRecalculation');
      forceRecalculation(request).then((res) => {
          // Read result of the Cloud Function.
          console.log(`Sent request to recalculating totals for challenge: ${challengeUid}`);
      }).catch(err => {
          console.error(`${err}`);
        });
    } else {
      console.error(`No challengeUid Found, cant recalc totals`);
    }
  }

  deleteActvitiesPastChallenge(challenge: Challenge) {
    const firebase = Util.getFirebaseAuth();

    if (challenge && challenge.id !== "") {
      // CANT PASS DATES Through FB functions - how fucking sad --- seems horrible
      // See: https://stackoverflow.com/questions/53685449/cant-return-a-date-from-a-firebase-cloud-function
      // const endDate = challenge.endDate.getTime();
      const request = {challenge};
      
      const deleteActvitiesPastChallengeEnd = firebase.functions.httpsCallable('deleteActvitiesPastChallengeEnd');
      deleteActvitiesPastChallengeEnd(request).then((res) => {
          // Read result of the Cloud Function.
          console.log(`Sent request to deleteActvitiesPastChallengeEnd: ${challenge.name}`);
      }).catch(err => {
          console.error(`${err}`);
        });
    } else {
      console.error(`No challenge Found`);
    }
  }

  updateBlankActivityTeams(challengeUid: string) {
    const firebase = Util.getFirebaseAuth();

    if (challengeUid && challengeUid !== "") {
      const request = {challengeUid};
      
      const updateBlankActivityTeamName = firebase.functions.httpsCallable('updateBlankActivityTeamName');
      updateBlankActivityTeamName(request).then((res) => {
          // Read result of the Cloud Function.
          console.log(`Sent request to updateBlankActivityTeamName: ${challengeUid}`);
      }).catch(err => {
          console.error(`${err}`);
        });
    } else {
      console.error(`No challenge Found`);
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
          <hr />
          <Button 
            onClick={() => this.deleteActvitiesPastChallenge(this.props.context.challenge)}
            variant="contained"
            color="primary"
            className={classes.button}>
              Delete Actitiies Past Challenge End
          </Button>
          <hr />
          <Button 
            onClick={() => this.updateBlankActivityTeams(this.props.context.challengeUid)}
            variant="contained"
            color="primary"
            className={classes.button}>
              updateBlankActivityTeamName
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
