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

const SimpleExpansionPanel = (props) => {
    // decontruct props
    const {
        amount,
        ones,
        fives,
        tens,
        twenties,
        fifties,
        hundreds,
        time,
        email,
        firstName,
        lastName,
        awaitingSettlement,
        settled
    } = props.deposit;
    let jsDate = new Date(time);
    const dateTime = moment(jsDate).format("YYYY-MM-DD HH:mm:ss");

    let depositState = "";
    let depositIcon = "";
    if (!!settled) {
        depositState = "Settled";
        depositIcon = "done_all";
    } else if (awaitingSettlement) {
        depositState = "Awaiting Settledment";
        depositIcon = "mail_outline";
    } else {
        depositState = "In Safe";
        depositIcon = "lock";
    }

    return (
        <ExpansionPanel>
            <ExpansionPanelSummary className="row" expandIcon={< ExpandMoreIcon />}>
                <Tooltip title={depositState}>
                    <i className="material-icons green-text col s1 m1">{depositIcon}</i>
                </Tooltip>

                <Typography className="col s5 m3">{dateTime}</Typography>
                <Typography className="col s6 m4">{`${firstName} ${lastName} (${email})`}</Typography>
                <Typography
                    className="col s12 m2 offset-m2">
                    ${amount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <Typography className="row grey-text">
                    Ones: ${ones * 1}, Fives: ${fives * 5}, Tens: ${tens * 10}, Twentys: ${twenties * 20}, Fifties: ${fifties * 50}, Hundreds: ${hundreds * 100}
                </Typography>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
};

const materialCollection = (props) => {
    // decontruct props
    let {
        amount,
        ones,
        fives,
        tens,
        twenties,
        fifties,
        hundreds,
        time,
        email
    } = props.deposit;
    let jsDate = new Date(time);
    const dateTime = moment(jsDate).format("YYYY-MM-DD HH:mm:ss");

    return (
        <li className="collection-item avatar z-depth-2">
            <i className="material-icons circle green">attach_money</i>
            <h5 className="title row">
                <div className="col s6 m3">{dateTime}</div>
                <div className="col s6 m3">{email}</div>
                <div className="col s12 m3 offset-m3">${amount
                    .toFixed(2)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
            </h5>
            <div className="row grey-text">
                <blockquote>Ones: ${ones * 1}, Fives: ${fives * 5}, Tens: ${tens * 10}, Twentys: ${twenties * 20}, Fifties: ${fifties * 50}, Hundreds: ${hundreds * 100}
                </blockquote>
            </div>
            <a href="#!" className="secondary-content">
                <i className="material-icons">grade</i>
            </a>
        </li>
    );
};

const DepositItem = (props) => {
    if (false) {
        return (
            materialCollection(props)
        );
    }

    return (
        SimpleExpansionPanel(props)
    );
};

export default withAuthUserContext(withRouter(DepositItem));