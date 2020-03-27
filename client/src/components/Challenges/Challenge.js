import React from 'react';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { makeStyles, Grid, Card, CardContent, Typography, Button, CardMedia, CardActions, Divider } from '@material-ui/core';
import moment from "moment";
import { CHALLENGE } from "../Environment/Environment";

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
    }
}))


const Challenge = (props) => {
    const classes = useStyles();

    const handleEditChallenge = (id) => {
        props.handleEditChallenge(id);
    }

    const handleDeleteChallenge = (challenge) => {
        props.handleDeleteChallenge(challenge);
    }

    const handleJoinChallenge = (challenge) => {
        props.handleJoinChallenge(challenge);
    }

    // dont ket non-admin delete or edit 
    const enableEdit = (props.user && props.user.isAdmin) ? true : false;
    // Dont aloow ANYONE to delete main/default challenge
    const allowDeleteChallenge = props.challenge.id !== CHALLENGE ? true : false;

    return (
        <Grid item xs={12} md={4}>
            <Card style={{ height: "100%" }}>
                <CardMedia
                    style={{ height: '250px' }}
                    image={props.challenge.photoObj ? props.challenge.photoObj.url : "/images/smallbusiness.jpg"}
                    title={props.challenge.photoObj ? props.challenge.photoObj.fileName : ""}
                />
                <CardContent style={{ textAlign: "center" }}>
                    <Typography variant="h5">{props.challenge.name}</Typography>
                    <Typography variant="subtitle1" align="left">{props.challenge.description}</Typography>
                    <Typography variant="subtitle1" align="left">
                        {moment(props.challenge.startDate).format("MM-DD-YYYY")}{` thru `}
                        {moment(props.challenge.endDate).format("MM-DD-YYYY")}
                    </Typography>
                </CardContent>
                <CardActions>
                    {enableEdit ?
                        <>
                            <Button
                                color="primary"
                                onClick={() => { handleEditChallenge(props.challenge.id) }}
                            >Edit
                                </Button>
                            {allowDeleteChallenge ?
                                <Button
                                    color="primary"
                                    onClick={() => { handleDeleteChallenge(props.challenge) }}
                                >Delete
                                    </Button>
                                : ""
                            }
                        </>
                        : ""
                    }
                    <Button
                        color="primary"
                        onClick={() => { handleJoinChallenge(props.challenge) }}
                    >Select/Join
                    </Button>
                </CardActions>

            </Card>
        </Grid>
    )
}

export default withAuthUserContext(Challenge);