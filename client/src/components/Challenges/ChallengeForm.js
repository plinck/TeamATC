import React, { useState, useEffect } from 'react';
import { Card, CardContent, TextField, Typography, Button, CardActions, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import LocationSearchBar from './LocationSearchBar';
import Waypoints from './Waypoints';
import AddIcon from "@material-ui/icons/Add";
import { Fab } from "@material-ui/core";
import moment from "moment";

import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import ChallengeDB from "./ChallengeDB"
import ChallengeAPI from "./ChallengeAPI"

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
    // This object holds the actual state for this object
    // The other state vars are used for managing flow etc and not
    // directly tied to the actual domain object.  This keeps things cleaner, IMO
    const CLEAR_CHALLENGE_VALUES = {
        id: undefined,
        description: "",
        endDate:  moment(new Date('2020-08-18T21:11:54')).endOf("day").toDate(),
        isCurrentChallenge: false,
        name: "",
        photoObj: null,
        startDate: moment(new Date()).startOf("day").toDate(),
        startCity: "",
        startCityGeometry: "",
        endCity: "",
        endCityGeometry: "",
        waypoints: [],
        isSwim : true,
        isBike : true,
        isRun : true,
        isOther : true,
        mapCalculation : "all"
    }
    const CHALLENGE_INITIAL_VALUES = {
        id: props.id,
        description: "",
        endDate: moment(new Date('2020-08-18T21:11:54')).endOf("day").toDate(),
        isCurrentChallenge: false,
        name: "",
        photoObj: null,
        startDate: moment(new Date()).startOf("day").toDate(),
        startCity: "",
        startCityGeometry: "",
        endCity: "",
        endCityGeometry: "",
        waypoints: [],
        isSwim : true,
        isBike : true,
        isRun : true,
        isOther : true,
        mapCalculation : "all"
    }
    const [challenge, setChallenge] = useState(CHALLENGE_INITIAL_VALUES);
    const [message, setMessage] = React.useState("");
    const [photoFile, setPhotoFile] = React.useState(null);

    // Domain object handlers
    const onChange = ((fieldName, newValue) => {
        console.log(`fieldName: ${fieldName}, newValue: ${newValue}`);
        setChallenge({...challenge, 
            [fieldName] : newValue
        });
    });
    
    const handleDescriptionChange = event => {
        setChallenge({ ...challenge, description: event.target.value })
    };
    const handleEndDateChange = date => {
        const endOfDay = moment(date).endOf("day").toDate()
        setChallenge({ ...challenge, endDate: endOfDay })
    };
    const handleNameChange = event => {
        setChallenge({ ...challenge, name: event.target.value })
    };
    const handleStartDateChange = date => {
        const startOfDay = moment(date).startOf("day").toDate()
        setChallenge({ ...challenge, startDate: startOfDay })
    };

    const handleStartCityChange = (city, geometry) => {
        setChallenge({ ...challenge, startCity: city, startCityGeometry: geometry })
    }
    const handleEndCityChange = (city, geometry) => {
        setChallenge({ ...challenge, endCity: city, endCityGeometry: geometry })
    }

    const handleAddWaypoint = (city, geometry) => {
        let newWaypoint = {
            location: city,
            geometry: geometry
        }
        let newWaypoints = challenge.waypoints ? challenge.waypoints : []
        newWaypoints.push(newWaypoint)
        setChallenge({ ...challenge, waypoints: newWaypoints })
    }

    const handleDelete = chipToDelete => () => {
        console.log(chipToDelete)
        let filtered = challenge.waypoints.filter(loc => loc.location !== chipToDelete.location);
        setChallenge({ ...challenge, waypoints: filtered })
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
                // first delete the old photo
                const fileName = challenge.photoObj && challenge.photoObj.fileName ? challenge.photoObj.fileName : "";
                Photo.deletePhoto(fileName).then(photoObj => {
                    console.log(`deleted old photo`);
                    return (Photo.uploadPhoto(photoFile, "challenge"));
                }).then((photoObj) => {
                    console.log(`uploaded photo`);
                    photoObj.fileTitle = "challenge";
                    resolve(photoObj);
                }).catch((err) => {
                    setMessage(`Error uploading photo for challenge ${err.message}`);
                    reject(err);
                });
            } else {
                resolve(null);
            }
        }); // Promise
    }

    const handleSave = async (event) => {
        event.preventDefault();
        // NOTE: Add a processing popup
        let originArray = [challenge.startCity];
        let destinationArray = [];
        challenge.waypoints.forEach(waypoint => {
            originArray.push(waypoint.location);
            destinationArray.push(waypoint.location);
        });
        destinationArray.push(challenge.endCity);
        const origins = originArray.join();
        const destinations  = destinationArray.join();

        try {
            let res = await ChallengeAPI.calcDistanceMatrix(origins, destinations);
            console.log(`result from ChallengeAPI.calcDistanceMatrix: ${JSON.stringify(res)}`)
        } catch (err) {
            setMessage(`Error calling ChallengeAPI.calcDistanceMatrix ${err}`);
            return;
        }

        uploadPhotoToGoogleStorage().then(photoObj => {
            // NOW chain promises to update or create challenge
            challenge.photoObj = photoObj ? photoObj : null;
            if (challenge.id) {
                ChallengeDB.update(challenge);
            } else {
                ChallengeDB.create(challenge);
            }
        }).then(res => {
            setMessage(`Challenge Successfully Updated`);
            setChallenge({ ...CLEAR_CHALLENGE_VALUES });
            setPhotoFile(null);
            props.handleUpdateChallenge(); // refresh parent
        }).catch(err => {
            setMessage(`Error uploading photo for challenge ${err}`);
        })
    }

    const handleCreateNew = (event) => {
        event.preventDefault();

        setChallenge({ ...CLEAR_CHALLENGE_VALUES })
        setPhotoFile(null)
    }

    // MAIN START : --
    // get challenges at load 
    const fetchData = (challengeUid) => {
        ChallengeDB.get(challengeUid).then(challenge => {
            setChallenge(challenge);
        }).catch(err => setMessage(err));
    }

    useEffect(() => {
        // if an id is present, get the data from firestore for updating
        if (props.id) {
            fetchData(props.id);
        }
    }, [props.id]);

    // console.log(`Challenge: ${JSON.stringify(challenge)}`);

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
                    <br />
                    <Divider />
                    <br />
                    <Typography variant="h5">Create Route (Not Required)</Typography>
                    <LocationSearchBar value={challenge.startCity} title="Start City" id="startCity"  handleCityChange={handleStartCityChange} />
                    <LocationSearchBar value={challenge.endCity} title="End City" id="endCity" handleCityChange={handleEndCityChange} />
                    <Waypoints handleAddWaypoint={handleAddWaypoint} handleDelete={handleDelete} waypoints={challenge.waypoints} />
                    <br />
                    <hr />
                    <FormControl component="fieldset" className={classes.formControl}>
                      <FormLabel component="legend">Activity Types</FormLabel>
                      <FormGroup row>
                        <FormControlLabel
                          control={
                            <Checkbox 
                                checked={challenge.isSwim}
                                id="isSwim"
                                name="isSwim"
                                value={challenge.isSwim}
                                onChange={() => onChange("isSwim", !challenge.isSwim)}
                            />
                          }
                          label="Swim"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox 
                                checked={challenge.isBike}
                                id="isBike"
                                name="isBike"
                                value={challenge.isBike}
                                onChange={() => onChange("isBike", !challenge.isBike)}
                            />
                          }
                          label="Bike"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox 
                                checked={challenge.isRun}
                                id="isRun"
                                name="isRun"
                                value={challenge.isRun}
                                onChange={() => onChange("isRun", !challenge.isRun)}
                            />
                          }
                          label="Run"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox 
                                checked={challenge.isOther}
                                id="isOther"
                                name="isOther"
                                value={challenge.isOther}
                                onChange={() => onChange("isOther", !challenge.isOther)}
                            />
                          }
                          label="Other"
                        />
                      </FormGroup>
                    </FormControl>
  
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