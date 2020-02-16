import React from 'react';
import { withRouter } from 'react-router-dom';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';

import moment from "moment";

import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


// New explansion panels
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ActivityDB from './ActivityDB';
class Activity extends React.Component {
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

    handleDelete= (id) => {
        this.setState({ openConfirmDelete: false });
        this.props.activityDelete(id)
    };

    // Send to edit page
    activityEdit = () => {
        this.props.history.push({
            pathname: '/activitypage',
            state: {id: this.props.activity.id }
        });
    };

    render() {
        // Deconstruct Props
        const {
            id,
            firstName,
            lastName,
            email,
            teamName,
            activityDateTime,
            activityName,
            activityType, // swim, bike, run
            distance,
            distanceUnits,
            duration,
            uid
        } = this.props.activity;

        // make sure you have a user before displaying
        if (id === null ) {
            return(null);
        }
    
        let jsDate = new Date(activityDateTime);
        const activityDateTimeDisplay = moment(jsDate).format("MM-DD-YY");

        let activityIcon = "";

        if (activityType.toLowerCase() === "swim") {
            activityIcon = "/images/icons8-swimming-50.png";
        } else if ((activityType.toLowerCase() === "bike")) {
            activityIcon = "/images/icons8-triathlon-50.png";
        } else if ((activityType.toLowerCase() === "run")){
            activityIcon = "/images/icons8-running-50.png";
        } else {
            activityIcon = "/images/icons8-triathlon-50.png";      // unknown
        }

        // Can only edit or delete your activities
        let editIsDisabled = (this.props.user.authUser && (this.props.user.authUser.uid ===  uid)) ? false : true; 
        let deleteIsDisabled = (this.props.user.authUser && (this.props.user.authUser.uid ===  uid)) ? false : true; 

        // Allow Admin to edit all records (later allow team moderator (cashier) to edit their own teams workouts) 
        if (this.props.user.isAdmin) {
            deleteIsDisabled = false
        }

        // Truncate Nane for easy view
        let teamNameTrim = teamName.length < 12 ? teamName : `${teamName.substring(0, 9)}...` ;
        let fullName = `${firstName} ${lastName}`;
        let fullNameTrim = fullName.length < 20 ? fullName : `${fullName.substring(0, 17)}...` ;
        let activityNameTrim = activityName ? activityName : `Unnamed ${activityType}`;
        activityNameTrim = activityNameTrim.length < 20 ? activityNameTrim : `${activityNameTrim.substring(0, 17)}...` ;
        
        return (
            <ExpansionPanel>
                <ExpansionPanelSummary className="row" expandIcon={< ExpandMoreIcon />}>
                    <Tooltip title={activityType}>
                        <img style={{maxHeight: '24px'}} src={activityIcon} alt={activityType} />
                    </Tooltip>
                    
                    <Typography className="col s1 m1">{`${teamNameTrim}`}</Typography>
                    <Typography className="col s2 m2">{`${fullNameTrim}`}</Typography>
                    <Typography className="col s1 m1">{activityDateTimeDisplay}</Typography>
                    <Typography className="col s3 m3">{activityNameTrim}</Typography>
                    <Typography className="col s1 m1">
                        {duration.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {"hrs"}
                    </Typography>
                    <Typography className="col s2 offset-s1 m2 offset-m1">
                        {distance.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {distanceUnits}
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className="row">
                    <Typography className="col s2 offset-s6 m2 offset-m6">AveS</Typography>
                    <Typography className="col s2 m2">(NP)</Typography>
                    {deleteIsDisabled ? null : 
                        <Typography className="col s2 m2">
                            {editIsDisabled ? null :
                                <Tooltip title="Edit">
                                    <i style={{cursor: 'pointer'}}
                                        disabled={editIsDisabled}
                                        className="material-icons left indigo-text text-darken-4"
                                        onClick={() => this.activityEdit(id)}>edit
                                    </i>
                                </Tooltip>
                            }
                            <Tooltip title="Delete">
                                <i style={{cursor: 'pointer'}}
                                    disabled={editIsDisabled}
                                    className="material-icons left indigo-text text-darken-4"
                                    onClick={this.handleClickOpen}>delete
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
                        </Typography>
                    }
                </ExpansionPanelDetails>
            </ExpansionPanel>
        ); // return
    } // render()
} // class

export default withAuthUserContext(withRouter(Activity));