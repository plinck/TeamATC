import React, { useState, useEffect } from 'react';
import { Card, CardContent, TextField, Typography, Button, CardActions } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import AddIcon from "@material-ui/icons/Add";
import { Fab } from "@material-ui/core";

import ChallengeDB from "./ChallengeDB"
import Photo from "../Util/Photo.js"

const useStyles = makeStyles(theme => ({
    buttonStyles: {    
        margin: '5px',   
    },
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
    const CLEAR_CHALLENGE_VALUES = {
        id : undefined,
        description : "",
        endDate : new Date(),
        isCurrentChallenge : false,
        name : "",
        photoObj : null,
        startDate : new Date(),
    }
    const CHALLENGE_INITIAL_VALUES = {
        id : props.id,
        description : "",
        endDate : new Date('2020-08-18T21:11:54'),
        isCurrentChallenge : false,
        name : "",
        photoObj: null,
        startDate : new Date() 
    }
    const [challenge, setChallenge] = useState(CHALLENGE_INITIAL_VALUES);
    const [message, setMessage] = React.useState("");
    const [photoFile, setPhotoFile] = React.useState(null);

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

    const handlePhotoUpload = (event) => {
        event.preventDefault();

        if (event.target.files.length > 0) {
            console.log(event.target.files[0]);
            const photoFile = event.target.files[0];
            setPhotoFile(photoFile);
        }
    }

    const uploadPhotoToGoogleStorage = () => {
        return new Promise((resolve, reject) => {
            if (photoFile) {
                Photo.uploadPhoto(photoFile, "challenge").then(photoObj => {
                    photoObj.fileTitle = "challenge";
                    resolve(photoObj);
                }).catch(err => {
                    setMessage(`Error uploading photo for challenge ${err}`);
                    reject(err);
                });
            } else {
                resolve(null);
            }
        }); // Promise
    }

    const handleSave = (event) => {
        event.preventDefault();

        uploadPhotoToGoogleStorage().then (photoObj => {
            console.log(`uploaded photo`);
            // NOW chain promises to update or create challenge
            challenge.photoObj = photoObj ? photoObj : null;
            if (challenge.id) {
                ChallengeDB.update(challenge);
            } else {
                ChallengeDB.create(challenge);
            }
        }).then(res => {
            setMessage(`Challenge Successfully Updated`);
            setChallenge({...CLEAR_CHALLENGE_VALUES});
            setPhotoFile(null);
            props.handleUpdateChallenge(); // refresh parent
        }).catch(err => {
            setMessage(`Error uploading photo for challenge ${err}`); 
        })
    }

    const handleCreateNew = (event) => {
        event.preventDefault();
        
        setChallenge({...CLEAR_CHALLENGE_VALUES})
        setPhotoFile(null)
    }

    // MAIN START : --
    // get challenges at load - this is like compnent
    const fetchData = (challengeUid) => {
        ChallengeDB.get(challengeUid).then (challenge => {
            setChallenge(challenge);
        }).catch(err => setMessage(err));
    }
    
    useEffect(() => {
        // if an id is present, get the data from firestore for updating
        if (props.id) {
            fetchData(props.id);
        }
    }, [props.id]);

    console.log(`Challenge: ${JSON.stringify(challenge)}`);

    return (
        <Card>
            <CardContent>
                {message != null ? <p>{message}</p> : ""}
                <Typography variant="h5">Challenge</Typography>
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
                    <div>
                        <Button 
                            className={classes.buttonStyles}
                            variant="contained"
                            color="primary" 
                            type="submit"
                            onClick={handleCreateNew}
                            >Create New
                        </Button>
                    </div>
                    : ""
                }
                <label htmlFor="file">
                    <input
                        id="file"
                        name="file"
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                    />
                    <Fab
                        color="secondary"
                        size="small"
                        component="span"
                        aria-label="add"
                        variant="extended">
                        <AddIcon /> Select Image 
                    </Fab>{photoFile ? photoFile.name : ""}
                </label>

            </CardActions>
        </Card>
    )
}

export default ChallengeForm;