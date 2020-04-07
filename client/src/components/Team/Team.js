import React from 'react';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import { Grid, Card, CardContent, Typography, Button, CardActions } from '@material-ui/core';

const Team = (props) => {

    const handleEditTeam = (id) => {
        props.handleEditTeam(id);
    }

    const handleDeleteTeam = (id) => {
        props.handleDeleteTeam(id);
    }

    const handleJoinTeam = (id, name) => {
        props.handleJoinTeam(id, name);
    }

    const handleShowTeamMembers = (id, name) => {
        props.handleShowTeamMembers(id, name);
    }

    // dont ket non-admin delete or edit 
    const enableEdit = (props.user && props.user.isAdmin) ? true : false;
    // Dont allow anyone to delete a team with assigned users or acvities
    // This logic will come later
    const allowDeleteTeam = true;

    return (
        <Grid item xs={12} md={4}>
            <Card>
                <CardContent style={{ textAlign: "center" }}>
                    <Typography variant="h5">{props.team.name}</Typography>
                    <Typography variant="subtitle1" align="left">{props.team.description}</Typography>
                </CardContent>
                <CardActions>

                    {enableEdit ?
                        <>
                            <Button
                                color="primary"
                                onClick={() => { handleEditTeam(props.team.id) }}
                            >Edit
                                </Button>
                            {allowDeleteTeam ?
                                <Button
                                    color="primary"
                                    onClick={() => { handleDeleteTeam(props.team.id) }}
                                >Delete
                                    </Button>
                                : ""
                            }
                        </>
                        : null
                    }
                    <Button
                        color="primary"
                        onClick={() => { handleJoinTeam(props.team.id, props.team.name) }}
                    >Select/Join
                    </Button>

                    <Button
                        color="primary"
                        onClick={() => { handleShowTeamMembers(props.team.id, props.team.name) }}
                    >Team Members
                    </Button>
                </CardActions>

            </Card>
        </Grid>
    )
}

export default withAuthUserContext(Team);