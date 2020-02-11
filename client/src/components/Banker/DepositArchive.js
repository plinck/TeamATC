import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';

import { withRouter } from 'react-router-dom';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import Util from "../Util/Util";

class DepositArchive extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
    }

    state = {
        openConfirmDelete: false,
    };
    
    handleClickOpen = () => {
        if (this._isMounted) {
            this.setState({ openConfirmDelete: true });
        }
    };

    handleClose = () => {
        if (this._isMounted) {
            this.setState({ openConfirmDelete: false });
        }
    };

    handleDelete= (_id) => {
        this.props.prospectDelete(_id);
        if (this._isMounted) {
            this.setState({ openConfirmDelete: false });
        }
    };

    componentDidMount() {
        this._isMounted = true;
    }
        // Cancel to avoid the react memory leak errir
    componentWillUnmountMount() {
        this._isMounted = false;
    }
    
    render() {
        // decontruct props
        let { id, amount, time, email, awaitingSettlement, settled, firstName, lastName} =  this.props.depositInfo;
        //let {  } =  this.props;

        if (id === null ) {
            return(null);
        }

        let depositState = "";
        let depositIcon = "";
        if (!!settled) {
            depositState = "Settled";
            depositIcon = "done_all";
        } else if (awaitingSettlement) {
            depositState = "Awaiting Settlement";
            depositIcon = "mail_outline";
        } else {
            depositState = "In Safe";
            depositIcon = "lock";
        }    
                
        return ( 
            <div className="card horizontal">
                <div className="card-stacked">
                    <div className="card-content">
                        <span className="card-title">
                            <Tooltip title={depositState}>
                                <i className="material-icons green-text col s1 m1">{depositIcon}</i>
                            </Tooltip>
                            Deposit: ${Util.formatMoney(amount, 0)}
                        </span>
                        <p>{time.toString()}</p>
                        {firstName ? <p>{firstName} {lastName ? lastName : null}</p> : null}
                        <p>{email}</p>
                        <p>{depositState}</p>
                    </div>
                    <div className="card-action">
                        <div className="left-align">
                            <div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ); // return
    } // render
}

export default withAuthUserContext(withRouter(DepositArchive));