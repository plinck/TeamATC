import React, { useState, useEffect } from 'react';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Container, Typography, makeStyles, Grid } from '@material-ui/core';
import TeamDB from "./TeamDB"
import TeamForm from './TeamForm';
import Team from "./Team"
import UserDB from "../User/UserDB.js"
import TeamMembersModal from './TeamMembersModal';

const useStyles = makeStyles(theme => ({
    root: {
        [theme.breakpoints.up('md')]: {
            marginLeft: "57px",
            height: "calc(100vh - 95px)"
        },
        background: 'url(/images/ATC-repeating-background.png) center center fixed',
        backgroundSize: "cover",
        height: 'calc(100vh - 65px)',
        overflow: "hidden"
    },
    container: {
        height: "100%",
        overflowY: "auto"
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
    const [openTeamMembers, setOpenTeamMembers] = useState(false)

    const [teams, setTeams] = useState([{}]);

    const [currentTeamId, setCurrentTeamId] = useState();
    const [message, setMessage] = useState();
    const [selectedTeamUid, setSelectedTeamUid] = useState();
    const [selectedTeamName, setSelectedTeamName] = useState();

    const handleOpenTeamMembers = (teamUid, teamName) => {
        setSelectedTeamUid(teamUid);
        setSelectedTeamName(teamName);
        setOpenTeamMembers(true);
    }

    const handleClose = () => {
        setOpenTeamMembers(false)
    }


    // When editting. make sure you set the id to ensure form gets proper record.
    const handleEditTeam = (id) => {
        setCurrentTeamId(id);
    }

    // When an update occurs you must also clear the current ID since it needs to be NULL/undefined
    const handleUpdateTeam = (id) => {
        setCurrentTeamId(null);
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

    const handleJoinTeam = (teamUid, teamName) => {
        UserDB.updateTeam(props.user.uid, teamUid, teamName).then(() => {
            // User now assigned to new team
            setMessage(`joined team ${teamName}`);
            props.history.push({
                pathname: '/dashboard'
            });
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
    }, [props.user]);

    const userCanUpdateTeam = (props.user && props.user.isAdmin) ? true : false;

    return (
        <div className={classes.root}>
            <Container className={classes.container} maxWidth="xl">
                <TeamMembersModal id="TeamMembersModal" teamUid={selectedTeamUid} teamName={selectedTeamName} handleClose={handleClose} open={openTeamMembers}/>

                {message ? <Typography color="primary" variant="subtitle1" align="center">{message}</Typography> : ""}
                <Grid style={{ marginTop: '10px' }} container spacing={2} justify="center" alignItems="center">
                    {userCanUpdateTeam ?
                        <Grid item xs={12} md={5}>
                            <TeamForm id={currentTeamId}
                                handleUpdateTeam={handleUpdateTeam}
                            />
                        </Grid> : null
                    }
                    <Grid style={{ marginTop: '10px' }} container spacing={2} justify="center" alignItems="center">
                        {teams.map((team, index) => {
                            return (<Team key={index} team={team}
                                handleEditTeam={handleEditTeam}
                                handleDeleteTeam={handleDeleteTeam}
                                handleJoinTeam={handleJoinTeam}
                                handleOpenTeamMembers={handleOpenTeamMembers}
                            />)
                        })
                        }

                    </Grid>
                </Grid>
            </Container>
        </div>
    )
}

export default withAuthUserContext(Teams);