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
            team,
            activityDateTime,
            activityType, // swim, bike, run
            distance,
            distanceUnits,
            duration,
        } = this.props.activity;
        let jsDate = new Date(activityDateTime);
        const dateTime = moment(jsDate).format("YYYY-MM-DD HH:mm:ss");

        let activityIcon = "";

        if (activityType.toLowerCase() === "swim") {
            activityIcon = "done_all";
        } else if ((activityType.toLowerCase() === "bike")) {
            activityIcon = "mail_outline";
        } else if ((activityType.toLowerCase() === "run")){
            activityIcon = "lock";
        } else {
            activityIcon = "lock";      // unknown
        }

        return (
            <ExpansionPanel>
                <ExpansionPanelSummary className="row" expandIcon={< ExpandMoreIcon />}>
                    <Tooltip title={activityType}>
                        <i className="material-icons green-text col s1 m1">{activityIcon}</i>
                    </Tooltip>
                    
                    {/*}
                    <h5 className="col s6 m3">Time</h5>
                    <h5 className="col s6 m3">User</h5>
                    <h5 className="col s6 m3 offset-m3">Team</h5>
                    <h5 className="col s6 m3">Activity</h5>
                    <h5 className="col s6 m3">Duration</h5>
                    <h5 className="col s6 m3 offset-m3">Distance</h5>
                    */}

                    <Typography className="col s5 m3">{dateTime} {team}</Typography>
                    <Typography className="col s6 m4">{`${firstName} ${lastName} (${email})`}</Typography>
                    <Typography
                        className="col s12 m2 offset-m2">
                        {distance.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {distanceUnits}
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Typography className="row grey-text">
                        {duration.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </Typography>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        ); // return
    } // render()
} // class

export default withAuthUserContext(withRouter(Activity));