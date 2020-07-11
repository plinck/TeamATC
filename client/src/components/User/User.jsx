import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { withRouter } from 'react-router-dom';
import { withContext } from '../Auth/Session/Context';
import { Card, Grid, CardMedia, Typography, CardActions, CardContent } from '@material-ui/core';

class User extends React.Component {
    // State used for Dialog box to confirm delete
    state = {
        openConfirmDelete: false,
    };

    handleClickOpen = () => {
        this.setState({ openConfirmDelete: true });
    };

    handleClose = () => {
        this.setState({ openConfirmDelete: false });
    };

    handleDelete = (id) => {
        this.setState({ openConfirmDelete: false });
        this.props.userDelete(id);
    };

    // decontruct props
    render() {
        let { id, uid, firstName, lastName, phoneNumber, photoObj, email, primaryRole, stravaUserAuth, stravaAthleteId} = this.props.userInfo;
        let { userMakeAdmin, userMakeTeamLead, userMakeUser, userMakeModerator } = this.props;

        let photoObjUrl = "./images/noUserImage150x150.png";
        let photoObjFileName = "";

        if (photoObj && photoObj.url && photoObj.url !== "") {
            photoObjUrl = photoObj.url;
            photoObjFileName = photoObj.fileName;
        }

        if (id === null) {
            return (null);
        }

        // Send to edit page
        const userEdit = () => {
            this.props.history.push({
                pathname: '/userpage',
                state: { id: this.props.userInfo.id }
            });
        };

        // dont let you delete yourself
        const editIsDisabled = (this.props.context && this.props.context.authUser && this.props.context.authUser.uid) === uid ? true : false;

        return (
            <Card>
                <CardMedia
                    style={{ height: '150px' }}
                    image={ photoObjUrl }
                    title={ photoObjFileName }
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">{firstName} {lastName}</Typography>
                    <Typography variant="body2" color="textSecondary" component="p">{email}</Typography>
                    <Typography variant="body2" color="textSecondary" component="p">{phoneNumber.length > 9 ? phoneNumber.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, '$1-$2-$3') : phoneNumber}</Typography>
                    <Typography variant="body2" color="textSecondary" component="p">Primary Role: {primaryRole}</Typography>
                    <br />
                    <hr />
                    {stravaUserAuth ? 
                        <Typography variant="subtitle2">
                            <Grid item xs={12}>
                                Strava authorized - Strava Id:{stravaAthleteId}
                            </Grid>
                        </Typography>
                        : 
                        <Typography variant="subtitle2">
                            <Grid item xs={12} fontWeight="fontWeightLight" color="warning.main" fontStyle="oblique">
                                Strava Not Authorized
                            </Grid>
                        </Typography>
                    }

                </CardContent>
                <CardActions>

                    {editIsDisabled ? <p style={{ margin: "3px" }}><i>Current User - Cant Edit</i></p> : null}
                    {editIsDisabled ? null :
                        <div>
                            <Tooltip title="Edit">
                                <i style={{ cursor: 'pointer' }}
                                    disabled={editIsDisabled}
                                    className="userEdit material-icons left indigo-text text-darken-4"
                                    onClick={() => userEdit(id)}>edit
                                    </i>
                            </Tooltip>

                            <Tooltip title="Delete">
                                <i style={{ cursor: 'pointer' }}
                                    disabled={editIsDisabled}
                                    className="material-icons left indigo-text text-darken-4"
                                    onClick={this.handleClickOpen}>delete
                                    </i>
                            </Tooltip>

                            <Tooltip title="Make TeamLead">
                                <i style={{ cursor: 'pointer' }}
                                    disabled={editIsDisabled}
                                    className="material-icons left indigo-text text-darken-4"
                                    onClick={() => userMakeTeamLead(id)}>card_membership
                                    </i>
                            </Tooltip>

                            <Tooltip title="Make Admin">
                                <i style={{ cursor: 'pointer' }}
                                    disabled={editIsDisabled}
                                    className="material-icons left indigo-text text-darken-4"
                                    onClick={() => userMakeAdmin(id)}>supervisor_account
                                    </i>
                            </Tooltip>

                            <Tooltip title="Make Moderator">
                                <i style={{ cursor: 'pointer' }}
                                    disabled={editIsDisabled}
                                    className="material-icons left indigo-text text-darken-4"
                                    onClick={() => userMakeModerator(id)}>gavel
                                    </i>
                            </Tooltip>

                            <Tooltip title="Athlete Only">
                                <i style={{ cursor: 'pointer' }}
                                    disabled={editIsDisabled}
                                    className="material-icons left indigo-text text-darken-4"
                                    onClick={() => userMakeUser(id)}>motorcycle
                                    </i>
                            </Tooltip>

                            <Dialog
                                open={this.state.openConfirmDelete}
                                onClose={this.handleClose}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description">
                                <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-description">
                                        Are you sure you want to delete?
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={this.handleClose} variant="contained" color="primary">
                                        Cancel
                                    </Button>
                                    <Button onClick={() => this.handleDelete(id)} variant="contained" color="primary" autoFocus>
                                        Yes
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                    } {/* edit is disabled check */}
                </CardActions>
            </Card>
        ); // return
    } // render()
}

export default withContext(withRouter(User));