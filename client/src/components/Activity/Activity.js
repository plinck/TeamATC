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
        this.activityDelete(id);
    };

    // Send to edit page
    activityEdit = () => {
        this.props.history.push({
            pathname: '/activitypage',
            state: {id: this.props.activity.id }
        });
    };

    // Delete this article from MongoDB
    activityDelete = (id) => {
        ActivityDB.delete( id )
        .then(res => {
            console.log("Deleted user");
            this.props.refreshPage();
        })
        .catch(err => {
            alert(err);
            console.error(err); 
        });
    }

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
        const dateTime = moment(jsDate).format("YYYY-MM-DD");

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
        const editIsDisabled = (this.props.user && this.props.user.authUser && this.props.user.authUser.uid) ===  uid ? false : true;    

        return (
            <ExpansionPanel>
                <ExpansionPanelSummary className="row" expandIcon={< ExpandMoreIcon />}>
                    <Tooltip title={activityType}>
                        <img style={{maxHeight: '24px'}} src={activityIcon} alt={activityType} />
                    </Tooltip>
                    
                    <Typography className="col s2 m2">{`${firstName} ${lastName}/${teamName}`}</Typography>
                    <Typography className="col s2 m2">{dateTime}</Typography>
                    <Typography className="col s3 m3">{activityName ? activityName : ""}</Typography>
                    <Typography className="col s2 offset-s2 m2 offset-m2">
                        {distance.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {distanceUnits}
                        </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className="row">
                    <Typography className="col s2 offset-s4 m2 offset-m4">
                        {duration.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} hours
                    </Typography>
                    <Typography className="col s2 m2">AveS</Typography>
                    <Typography className="col s2 m2">(NP)</Typography>
                    <Typography className="col s2 m2">
                        <Tooltip title="Edit">
                        <i style={{cursor: 'pointer'}}
                            disabled={editIsDisabled}
                            className="material-icons left indigo-text text-darken-4"
                            onClick={() => this.activityEdit(id)}>edit
                        </i>
                        </Tooltip>
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
                </ExpansionPanelDetails>
            </ExpansionPanel>
        ); // return
    } // render()
} // class

export default withAuthUserContext(withRouter(Activity));