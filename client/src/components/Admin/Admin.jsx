import React from 'react';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';

import Users from "../User/Users.jsx"
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Container, Grid, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';



const styles = theme => ({
    root: {
        [theme.breakpoints.up('md')]: {
            marginLeft: "57px",
        },
        paddingTop: "10px"
    }
});

class Admin extends React.Component {

    // route to new user ( create )
    createUser = () => {
        this.props.history.push({
            pathname: '/userform'
        });
    }

    // go back to where you came from
    goBack = () => {
        this.props.history.goBack();
    }

    render() {
        const { classes } = this.props
        const message = this.props && this.props.location && this.props.location.state ? this.props.location.state.message : "";

        if (this.props.user.authUser && this.props.user.isAdmin) {
            return (
                <div className={classes.root}>
                    <Container >
                        <Grid container>
                            <br />
                            <Button variant="contained" color="primary" onClick={this.createUser}>Create User</Button>
                        </Grid>
                        <Users />
                        <div>{message}</div>
                    </Container>
                </div>
            );
        } else if (this.props.user.authUser) {
            return (
                <Redirect to="/actitivies" />
            );
        } else {
            return (
                <Redirect to="/signin" />
            );
        }
    }
}

export default withRouter(withAuthUserContext(withStyles(styles)(Admin)));