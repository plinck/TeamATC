import React from 'react';
import ActivityForm from "./ActivityForm.jsx";
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    [theme.breakpoints.up('md')]: {
      marginLeft: "57px",
    },
    paddingTop: "10px"
  }
});

class ActivityPage extends React.Component {

  render() {
    const { classes } = this.props
    // deconstrcut prop from authContext
    let id = null;
    if (this.props.location.state) {
      id = this.props.location.state.id;
    }

    // // Some props take time to get ready so return null when uid not avaialble
    // if (id === null) {
    //   return null;
    // }

    return (
      <div className={classes.root}>
        <ActivityForm
          id={id}
        />
      </div>
    );
  }
}

export default withStyles(styles)(ActivityPage);