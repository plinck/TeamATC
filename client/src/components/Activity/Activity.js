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

import Box from '@material-ui/core/Box';

// New explansion panels
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
            displayName,
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
        const activityDateTimeDisplay = moment(jsDate).format("MM-DD-YYYY");

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

        // Allow Admin to edit all records (later allow team moderator (teamLead) to edit their own teams workouts) 
        if (this.props.user.isAdmin) {
            deleteIsDisabled = false
        }

        // Truncate Nane for easy view
        let fullName = `${displayName}`;
        let activityNameAndType = activityName ? activityName : `Unnamed ${activityType}`;

        let distanceDecimalPlaces = 1;
        if (activityType === "Swim") {
            distanceDecimalPlaces = 0;
        }

        let isThisMine = uid === this.props.user.uid ? true : false
        // Band odd rows for clarity
        let rowBg = "";
        let rowFg = ""
        if (this.props.index % 2 !== 0) {
            rowBg = "info.main";
            rowFg = "white";
        }

        return (
            <ExpansionPanel>
                <Box color={rowFg} className="row" bgcolor={rowBg} m={0}>
                <ExpansionPanelSummary expandIcon={< ExpandMoreIcon />}>
                    <div className="col s1 m1 left-align">
                        { isThisMine ?
                            <Tooltip title={"Is This Mine?"}>
                                <img style={{maxHeight: '16px'}} src={"/images/me.png"} alt={"me"} />
                            </Tooltip>
                            :  ""
                        }
                        <Tooltip title={activityType}>
                            <img style={{maxHeight: '16px'}} src={activityIcon} alt={activityType} />
                        </Tooltip>
                    </div>

                    <Typography className="col s4 m2 truncate">{`${teamName}`}</Typography>
                    <Typography className="col s4 m2 truncate">{`${fullName}`}</Typography>
                    <Typography className="col s3 m2 truncate">{activityDateTimeDisplay}</Typography>
                    <Typography className="col s4 m2 truncate">{activityNameAndType}</Typography>
                    <Typography className="col s4 m1 truncate">
                        {duration.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {"H"}
                    </Typography>
                    <Typography className="col s4 m1 offset-m1 truncate">
                        {distance.toFixed(distanceDecimalPlaces).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {distanceUnits[0]}
                    </Typography>
                    </ExpansionPanelSummary>
                </Box>
                <Box color={rowFg} className="row" bgcolor={rowBg} m={0}>
                <ExpansionPanelDetails style={{margin: '0', padding: "0"}}>
                    <Typography className="col s2 offset-s6 m2 offset-m6 truncate">AveS</Typography>
                    <Typography className="col s2 m2 truncate">(NP)</Typography>
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
                </Box>
            </ExpansionPanel>
        ); // return
    } // render()
} // class

export default withAuthUserContext(withRouter(Activity));