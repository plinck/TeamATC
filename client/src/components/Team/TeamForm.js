import React, { useState, useEffect } from 'react';
import { Card, CardContent, TextField, Typography, Button, CardActions } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import TeamDB from "./TeamDB"

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

const TeamForm = (props) => {
    const classes = useStyles();

    // This is the team state object - i.e.
    // This object holds the actual state for this objct
    // The other state vars are used for managing flow etc and not
    // directly tied to the actual domain object.  This keeps things cleaner, IMO
    const CLEAR_TEAM_VALUES = {
        id : undefined,
        description : "",
        name : "",
    }
    const TEAM_INITIAL_VALUES = {
        id : props.id,
        description : "",
        name : "",
    }
    const [team, setTeam] = useState(TEAM_INITIAL_VALUES);

    const [message, setMessage] = React.useState("");

    // Domain object handlers
    const handleDescriptionChange = event => {
        setTeam({...team, description: event.target.value})
    };
    const handleNameChange = event => {
        setTeam({...team, name: event.target.value})
    };

    const handleSave = (event) => {
        event.preventDefault();
        
        if (team.id) {
            TeamDB.update(team).then(res => {
                setMessage(`Team Successfully Updated`);
                setTeam({...CLEAR_TEAM_VALUES})
                props.handleUpdateTeam(); 
            }).catch(err => {
                setMessage(`Error updating team ${err}`);
            });  
        } else {
            TeamDB.create(team).then(id => {
                setMessage(`Team Successfully Created`);
                setTeam({...CLEAR_TEAM_VALUES})
                props.handleUpdateTeam(); 
            }).catch(err => {
                setMessage(`Error creating team ${err}`);
            });   
        } 
    }

    const handleCreateNew = (event) => {
        event.preventDefault();
        
        setTeam({...CLEAR_TEAM_VALUES})
    }

    // MAIN START : --
    // get teams at load - this is like compnent
    const fetchData = (teamUid) => {
        TeamDB.get(teamUid).then (team => {
            setTeam(team);
        }).catch(err => setMessage(err));
    }
    
    useEffect(() => {
        // if an id is present, get the data from firestore for updating
        if (props.id) {
            fetchData(props.id);
        }
    }, [props.id]);

    // console.log(`Team: ${JSON.stringify(team)}`);

    return (
        <Card>
            <CardContent>
                {message != null ? <p>{message}</p> : ""}
                <Typography variant="h5">Team</Typography>
                <form noValidate autoComplete="off">
                    <TextField
                        className={classes.fullWidth}
                        id="name"
                        label="Team Name"
                        variant="outlined"
                        value={team.name}
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
                        value={team.description}
                        onChange={handleDescriptionChange}

                        placeholder="Tell your competitors about the team."
                        inputProps={{
                            style: { padding: '18px' }
                        }} />
                </form>
            </CardContent>
            <CardActions>
                <Button 
                    variant="contained"
                    color="primary" 
                    type="submit"
                    onClick={handleSave}
                    >{team.id ? "Update" : "Create"}
                </Button>
                {team.id ? 
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
            </CardActions>
        </Card>
    )
}

export default TeamForm;