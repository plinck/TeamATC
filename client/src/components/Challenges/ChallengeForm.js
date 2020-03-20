import React, { useState } from 'react';
import { Card, CardContent, TextField, Typography, Button, CardActions } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import ChallengeDB from "./ChallengeDB"

const useStyles = makeStyles(theme => ({
    fullWidth: {
        margin: `${theme.spacing(1)}px 0px`,
        width: "100%",
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 2,
    },
    formControl: {
        [theme.breakpoints.up('md')]: {
            width: 'calc(50% - 16px)',
            margin: theme.spacing(1),
        },
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            margin: `${theme.spacing(1)}px 0px`,
        },
    }
}));

const ChallengeForm = (props) => {
    const classes = useStyles();

    // This is the challenge state object - i.e.
    // This object holds the actual state for this objct
    // The other state vars are used for managing flow etc and not
    // directly tied to the actual domain object.  This keeps things cleaner, IMO
    const CHALLENGE_INITIAL_VALUES = {
        id : props.id,
        description : "",
        endDate : new Date('2020-08-18T21:11:54'),
        isCurrentChallenge : false,
        name : "",
        startDate : new Date() 
    }
    const [challenge, setChallenge] = React.useState(CHALLENGE_INITIAL_VALUES);


    const [message, setMessage] = React.useState("");

    // Domain object handlers
    const handleDescriptionChange = event => {
        setChallenge({...challenge, description: event.target.value})
    };
    const handleEndDateChange = date => {
        setChallenge({...challenge, endDate: date})
    };
    const handleNameChange = event => {
        setChallenge({...challenge, name: event.target.value})
    };
    const handleStartDateChange = date => {
        setChallenge({...challenge, startDate: date})
    };

    const handleSave = (event) => {
        event.preventDefault();
        
        if (challenge.id) {
            ChallengeDB.update(challenge).then(res => {
                setMessage(`Challenge Successfully Updated`);
            }).catch(err => {
                setMessage(`Error updating challenge ${err}`);
            });  
        } else {
            ChallengeDB.create(challenge).then(id => {
                setChallenge({...challenge, id: id})
                setMessage(`Challenge Successfully Created`);
            }).catch(err => {
                setMessage(`Error creating challenge ${err}`);
            });   
        } 
    }

    const handleDelete = (event) => {
        event.preventDefault();
        
        if (challenge.id) {
            ChallengeDB.delete(challenge.id).then(res => {
                setChallenge({...challenge, id: undefined})
                setMessage(`Challenge Successfully Deleted`);
            }).catch(err => {
                setMessage(`Error deleting challenge ${err}`);
            });  
        } 
    }

    return (
        <Card>
            <CardContent>
                {message != null ? <p>{message}</p> : ""}
                <Typography variant="h5">Create a New Challenge</Typography>
                <form noValidate autoComplete="off">
                    <TextField
                        className={classes.fullWidth}
                        id="name"
                        label="Challenge Name"
                        variant="outlined"
                        value={challenge.name}
                        onChange={handleNameChange}

                        inputProps={{
                            style: { padding: '18px' }
                        }} />
                    <TextField
                        className={classes.fullWidth}
                        id="description"
                        label="Description"
                        variant="outlined"
                        multiline
                        value={challenge.description}
                        onChange={handleDescriptionChange}

                        placeholder="Tell your competitors about the challenge."
                        inputProps={{
                            style: { padding: '18px' }
                        }} />

                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            className={classes.formControl}
                            margin="normal"
                            id="startDate"
                            label="Select a Challenge Begin Date"
                            format="MM/dd/yyyy"
                            value={challenge.startDate}
                            onChange={handleStartDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            className={classes.formControl}
                            margin="normal"
                            id="endDate"
                            label="Select a Challenge End Date"
                            format="MM/dd/yyyy"
                            value={challenge.endDate}
                            onChange={handleEndDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </form>
            </CardContent>
            <CardActions>
                <Button 
                    variant="contained"
                    color="primary" 
                    type="submit"
                    onClick={handleSave}
                    >{challenge.id ? "Update" : "Create"}
                </Button>
                {challenge.id ? 
                    <Button 
                        variant="contained"
                        color="primary" 
                        type="submit"
                        onClick={handleDelete}
                        >Delete
                    </Button>
                    : ""
                }
            </CardActions>
        </Card>
    )
}

export default ChallengeForm;