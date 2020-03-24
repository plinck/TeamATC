import React, { useState, useEffect } from 'react';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Container, makeStyles, Grid } from '@material-ui/core';
import TeamDB from "./TeamDB"
import TeamForm from './TeamForm';
import Team from "./Team"
import UserDB from "../User/UserDB.js"

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
    },
    messages: {
        color: 'red'
    }

}))

const Teams = (props) => {
    const classes = useStyles();

    const [teams, setTeams] = useState([{}]);

    const [currentTeamId, setCurrentTeamId] = useState();
    const [message, setMessage] = useState();

    // When editting. make sure you set the id to ensure form gets proper record.
    const handleEditTeam = (id) => {
        setCurrentTeamId(id);
    }

    // When an update occurs you must also clear the current challnge ID since it needs to be NULL/undefined
    const handleUpdateTeam = (id) => {
        setCurrentTeamId(undefined);
        fetchData();
    }

    const handleDeleteTeam = (id) => {
        if (id) {
            TeamDB.delete(id).then(res => {
                fetchData();
            }).catch(err => {
                setMessage(`Error deleting team with id: ${id}, error: ${err}`);
            });
        }
    }

    const handleJoinTeam = (teamUid) => {
        UserDB.updateTeam(props.user.uid, teamUid).then(() => {
            // User now assigned to new team
            setMessage(`joined team with ID ${teamUid}`);
        }).catch(err => {
            console.error(`Error joining team: ${teamUid} for user: ${props.uid}`);
        });
    }

    // MAIN START : --
    // get teams at load - this is like compnent
    const fetchData = () => {
        TeamDB.getTeams().then(teams => {
            setTeams(teams);
            // Each time you refresh, make sure the currnt id is cleared
        }).catch(err => setMessage(err));
    }

    // Make sure useEffect only gets called once --
    // i.e. if you dont use optional parameter (array of properities to watch), it
    // will fire this function every single time the component is refreshed which isnt cool.
    useEffect(() => {
        fetchData();
    }, []);

    const userCanUpdateTeam = (props.user && props.user.isAdmin) ? true : false;

    return (
        <div className={classes.main}>
            <div className={classes.root}>
                <Container maxWidth="xl">{message ? <h5 className={classes.messages}>{message}</h5> : ""}
                    <Grid container style={{ minHeight: "75vh" }} spacing={2} justify="center" alignItems="center">
                        {userCanUpdateTeam ?
                            <Grid item xs={12} md={5}>
                                <TeamForm id={currentTeamId}
                                    handleUpdateTeam={handleUpdateTeam}
                                />
                            </Grid> : ""
                        }
                        {teams.map((team, index) => {
                            return (<Team key={index} team={team}
                                handleEditTeam={handleEditTeam}
                                handleDeleteTeam={handleDeleteTeam}
                                handleJoinTeam={handleJoinTeam}
                            />)
                        })
                        }
                    </Grid>
                </Container>
            </div>
        </div>
    )
}

export default withAuthUserContext(Teams);