import React from "react";
import { withRouter } from "react-router-dom";
import { Redirect } from "react-router";
import {
  Grid,
  CircularProgress,
  Button,
  Container,
  Typography,
} from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import { Table, TableBody, TableHead, TableCell, TableRow } from '@material-ui/core';

import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import Result from "./Result";
import { ResultsDB } from "./ResultsDB";

import { withStyles } from "@material-ui/core/styles";
// eslint-disable-next-line no-unused-vars
import { CSVLink } from "react-csv";

const styles = (theme) => ({
  resultStyle: {
    width: "100%",
    overflow: "auto",
    [theme.breakpoints.up("md")]: {
      height: "79vh",
    },
    height: "65.5vh",
  },
  root: {
    [theme.breakpoints.up("md")]: {
      marginLeft: "57px",
    },
    paddingTop: "10px",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  progress: {
    margin: theme.spacing(2),
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  inputFix: {
    marginTop: 50,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  //style for font size
  resize: {
    fontSize: 200,
  },
  csvButton: {
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
    textDecoration: "none",
  },
});

class Results extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: [],
      orderBy: "None",
    };
  }

  // Get All Results on Mount - check if anything passed
  componentDidMount() {
    const challengeUid = this.props.user.challengeUid;
    if (challengeUid && challengeUid !== "") {
      const resultsDB = new ResultsDB();
      resultsDB.getAll(challengeUid).then( results => {
        this.setState({results: results});
      }).catch(err => {
        console.error(`${err}`);

      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.user.challengeUid && this.props.user.challengeUid !== prevProps.user.challengeUid) {
      const challengeUid = this.props.user.challengeUid;
      if (challengeUid && challengeUid !== "") {
        const resultsDB = new ResultsDB();
        resultsDB.getAll(challengeUid).then( results => {
          this.setState({results: results});
        }).catch(err => {
          console.error(`${err}`);
        });
      }
    }
  }

  // ************************************************************
  // Build JSX Components
  // ************************************************************

  // Now we can render page - DO NOT change state in render()
  render() {
    const { classes } = this.props;

    // Some props take time to get ready so return null when uid not avaialble
    if (this.props.user.uid === null || !this.props.user.challengeUid || this.props.user.challengeUid === "") {
      return (
        <Grid container style={{ marginTop: "10px" }} justify="center">
          <CircularProgress /> <p>Loading ...</p>{" "}
        </Grid>
      );
    }

    if (!this.state.results || this.state.results === null) {
      console.error("Fatal Error");
      return (
        <div>
          {" "}
          <p>FATAL ERROR Gettng results ...</p>{" "}
        </div>
      );
    }

    let orderBy = this.state.orderBy;
    let overallResults = this.state.results.overallResults;
    let teamResults = this.state.results.teamResults;
    let userResults = this.state.results.userResults;
    if (!userResults || !teamResults || !overallResults) {
      return (
        <Grid container style={{ marginTop: "10px" }} justify="center">
          <CircularProgress /> <p>Loading ...</p>{" "}
        </Grid>
      );
    }

    const sortFilterRow = (
      <Grid container>
        <Grid
          container
          item
          xs={12}
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid item xs={6}>
            <Typography variant="h4">Results</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: "right" }}>
            <CSVLink
              className={classes.csvButton}
              data={userResults}
              filename={"results.csv"}
              target="_blank"
            >
              <Button color="default" startIcon={<GetAppIcon />}>
                Export CSV
              </Button>
            </CSVLink>
          </Grid>
        </Grid>
      </Grid>
    );

    if (this.props.user.authUser) {
      let leaderBoardHeaderRow =
        <TableHead>
            <TableRow>
                <TableCell>Place</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Total</TableCell>
                <TableCell align="right">Swim</TableCell>
                <TableCell align="right">Bike</TableCell>
                <TableCell align="right">Run</TableCell>
                <TableCell align="right">Other</TableCell>
            </TableRow>
        </TableHead>

      return (
        <div style={{ backgroundColor: "#f2f2f2" }} className={classes.root}>
          <Container maxWidth="xl">
            {sortFilterRow}
            <Table size="small" >
              {leaderBoardHeaderRow}
              <TableBody>
                  {userResults.map((result, index) => {
                    return (
                      <div key={index}>
                        <Result
                          result={result}
                          index={index}
                        />
                      </div>
                    );
                  })}
              </TableBody>
            </Table>
          </Container>
        </div>
      );
    } else {
      return <Redirect to="/" />;
    } // if (this.props.user.authUser)
  } // render()
} // class

export default withRouter(withAuthUserContext(withStyles(styles)(Results)));