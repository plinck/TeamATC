import React from 'react';
import { withRouter } from 'react-router-dom';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';

import moment from "moment";

import Tooltip from '@material-ui/core/Tooltip';

// New explansion panels
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

class Activity extends React.Component {

    render() {

        // Deconstruct Props
        const {
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
        } = this.props.activity;
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

        {/*
                                    <div className="row">
                            <p className="text-bold blue-text col s1 m1">ICON</p>
                            <p className="text-bold blue-text col s2 m2">User</p>
                            <p className="text-bold blue-text col s2 m2">Date</p>
                            <p className="text-bold blue-text col s3 m3">Name</p>
                            <p className="text-bold blue-text col s2 offset-s2 m2 offset-m2">Distance</p>
                            <p className="text-bold blue-text col s3 m2">Time</p>
                            <p className="text-bold blue-text col s2 m3 offset-m3">Ave Speed</p>
                            <p className="text-bold blue-text col s2 offset-s1 m2">Power (NP)</p>
                            <p className="text-bold blue-text col s2 offset-s2 m2">Action</p>
                        </div>

        */}
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
                    <Typography className="col s2 m2">Action</Typography>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        ); // return
    } // render()
} // class

export default withAuthUserContext(withRouter(Activity));