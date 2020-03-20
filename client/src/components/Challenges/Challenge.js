import React from 'react';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { makeStyles, Grid, Card, CardContent, Typography, Button, Divider } from '@material-ui/core';
import moment from "moment";
import {CHALLENGE} from "../Environment/Environment";

const useStyles = makeStyles(theme => ({
    main: {
        background: 'url(/images/ATC-repeating-background.png) center center fixed',
        backgroundSize: "cover",
        height: 'calc(100vh - 64px)',
        overflow: "hidden"
    },
    root: {
        [theme.breakpoints.up('md')]: {
            marginLeft: "57px",
        },
    },
    button: {
        margin: '15px'
    }
}))


const Challenge = (props) => {
    const classes = useStyles();

    const handleEditChallenge = (id) => {
        props.handleEditChallenge(id); 
    }    

    const handleDeleteChallenge = (id) => {
        props.handleDeleteChallenge(id); 
    }   

    const handleJoinChallenge = (id) => {
        props.handleJoinChallenge(id); 
    }    

    // dont ket non-admin delete or edit 
    const enableEdit = (props.user && props.user.isAdmin) ? true : false;
    // Dont aloow ANYONE to delete main/default challenge
    const allowDeleteChallenge = props.challenge.id !== CHALLENGE ? true : false;

    return (
            <Grid item xs={12} md={5}>
                <Card>
                    <CardContent style={{ textAlign: "center" }}>
                        <Typography variant="h5">Challenge</Typography>
                        <Typography variant="h5">{props.challenge.name}</Typography>
                        <Typography variant="h5">{props.challenge.description}</Typography>
                        <Typography variant="h5">Start: {moment(props.challenge.startDate).format("MM-DD-YYYY")}</Typography>
                        <Typography variant="h5">End: {moment(props.challenge.endDate).format("MM-DD-YYYY")}</Typography>
                        <Divider></Divider>
                        {enableEdit ?
                            <div>
                                <Button 
                                    className={classes.button}
                                    variant="contained"
                                    color="primary" 
                                    onClick={() => {handleEditChallenge(props.challenge.id)}}
                                    >Edit
                                </Button>
                                {allowDeleteChallenge ?
                                    <Button 
                                        className={classes.button}
                                        variant="contained"
                                        color="primary" 
                                        onClick={() => {handleDeleteChallenge(props.challenge.id)}}
                                        >Delete
                                    </Button>
                                    : ""
                                }
                            </div>
                        : ""
                        }
                        <Button 
                        className={classes.button}
                        variant="contained"
                        color="primary" 
                        onClick={() => {handleJoinChallenge(props.challenge.id)}}
                        >Select/Join
                    </Button>

                    </CardContent>
                </Card>
            </Grid>
    )
}

export default withAuthUserContext(Challenge);