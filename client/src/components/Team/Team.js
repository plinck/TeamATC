import React from 'react';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { makeStyles, Grid, Card, CardContent, Typography, Button, Divider } from '@material-ui/core';

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


const Team = (props) => {
    const classes = useStyles();

    const handleEditTeam = (id) => {
        props.handleEditTeam(id); 
    }    

    const handleDeleteTeam = (id) => {
        props.handleDeleteTeam(id); 
    }   

    const handleJoinTeam = (id, name) => {
        props.handleJoinTeam(id, name); 
    }    

    // dont ket non-admin delete or edit 
    const enableEdit = (props.user && props.user.isAdmin) ? true : false;
    // Dont allow anyone to delete a team with assigned users or acvities
    // This logic will come later
    const allowDeleteTeam = true;

    return (
            <Grid item xs={12} md={5}>
                <Card>
                    <CardContent style={{ textAlign: "center" }}>
                        <Typography variant="h5">Challenge: {props.user.challengeName}</Typography>
                        <Typography variant="h5">Team: {props.team.name}</Typography>
                        <Typography>{props.team.description}</Typography>
                        <Divider></Divider>
                        {enableEdit ?
                            <div>
                                <Button 
                                    className={classes.button}
                                    variant="contained"
                                    color="primary" 
                                    onClick={() => {handleEditTeam(props.team.id)}}
                                    >Edit
                                </Button>
                                {allowDeleteTeam ?
                                    <Button 
                                        className={classes.button}
                                        variant="contained"
                                        color="primary" 
                                        onClick={() => {handleDeleteTeam(props.team.id)}}
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
                        onClick={() => {handleJoinTeam(props.team.id, props.team.name)}}
                        >Select/Join
                    </Button>

                    </CardContent>
                </Card>
            </Grid>
    )
}

export default withAuthUserContext(Team);