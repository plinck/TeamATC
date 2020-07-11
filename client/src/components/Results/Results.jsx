import React from "react";
import { withRouter } from "react-router-dom";
import { Redirect } from "react-router";
import {
  Grid,
  CircularProgress,
  Button,
  Container,
  Typography,
  ButtonGroup,
  Tooltip
} from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";

import { withContext } from "../Auth/Session/Context";
import { ResultsDB } from "./ResultsDB";

import { withStyles } from "@material-ui/core/styles";
// eslint-disable-next-line no-unused-vars
import { CSVLink } from "react-csv";
import EnhancedTable from "./EnhancedTable";

const styles = (theme) => ({
  resultStyle: {
    [theme.breakpoints.up("md")]: {
      height: "90vh",
      marginLeft: "57px",
    },
    height: "91vh",
    paddingTop: "10px",
  },
  tableContainer: {
    overflow: "auto",
  },
  tableHead: {
    fontWeight: 600,
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
      data: 'users'
    };
  }

  // Get All Results on Mount - check if anything passed
  componentDidMount() {
    const challengeUid = this.props.context.challengeUid;
    if (challengeUid && challengeUid !== "") {
      const resultsDB = new ResultsDB();
      resultsDB
        .getAll(challengeUid)
        .then((results) => {
          this.setState({ results: results });
        })
        .catch((err) => {
          console.error(`${err}`);
        });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.context.challengeUid &&
      this.props.context.challengeUid !== prevProps.user.challengeUid
    ) {
      const challengeUid = this.props.context.challengeUid;
      if (challengeUid && challengeUid !== "") {
        const resultsDB = new ResultsDB();
        resultsDB
          .getAll(challengeUid)
          .then((results) => {
            this.setState({ results: results });
          })
          .catch((err) => {
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
    // const teamResults = this.props.context.results.filter(total => total.teamRecord);
    // console.log(teamResults)

    // Some props take time to get ready so return null when uid not avaialble
    if (
      this.props.context.uid === null ||
      !this.props.context.challengeUid ||
      this.props.context.challengeUid === ""
    ) {
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

    let overallResults = this.state.results.overallResults;
    let teamResults = this.state.results.teamResults;
    let userResults = this.state.results.userResults;
    console.log(teamResults);
    if (!userResults || !teamResults || !overallResults) {
      return (
        <Grid container style={{ marginTop: "10px" }} justify="center">
          <CircularProgress /> <p>Loading ...</p>{" "}
        </Grid>
      );
    }

    const sortFilterRow = (
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
          <ButtonGroup color="primary">
            <Tooltip title="Users">
              <Button
              onClick={()=> this.setState({data: "users"})}
              variant= {this.state.data === "users" ? "contained" : "outlined"}
              >Users</Button>
            </Tooltip>
            <Tooltip title="Teams">
              <Button
              onClick={()=> this.setState({data: "teams"})}
              variant={this.state.data === "teams" ? "contained" : "outlined"}
              >Teams</Button>
            </Tooltip>
          </ButtonGroup>
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
    );

    if (this.props.context.authUser) {
      return (
        <div
          style={{ backgroundColor: "#f2f2f2", overflow: "scroll" }}
          className={classes.resultStyle}
        >
          <Container maxWidth="xl">
            <Grid container>
              {sortFilterRow}
              <Grid item xs={12} className={classes.tableContainer}>
                <EnhancedTable
                  data={this.state.data}
                  users={userResults}
                  teams={teamResults}
                />
              </Grid>
            </Grid>
          </Container>
        </div>
      );
    } else {
      return <Redirect to="/" />;
    } // if (this.props.context.authUser)
  } // render()
} // class

export default withRouter(withContext(withStyles(styles)(Results)));
