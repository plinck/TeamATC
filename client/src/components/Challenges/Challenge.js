import React, { useState } from 'react';
import { makeStyles, Grid, Card, CardContent, Typography, Button, Divider } from '@material-ui/core';
import moment from "moment";

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
                    </CardContent>
                </Card>
            </Grid>
    )
}

export default Challenge;