import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { withRouter } from 'react-router-dom';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import Util from "../Util/Util";

class Prospect extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
    }

    // State used for Dialog box to confirm delete
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
        let { _id, firstName, lastName, company, revenue, locations, email,  cash, phone} =  this.props.prospectInfo;
        //let {  } =  this.props;

        if (_id === null ) {
            return(null);
        }
        
        // Send to edit page
        const prospectEdit = () => {
            console.error("Edit not implemented yet");
            // this.props.history.push({
            //     pathname: '/userpage',
            //     state: {_id: this.props.userInfo._id }
            // });
        };
        
        return ( 
            <div className="card horizontal">
                <div className="card-stacked">
                    <div className="card-content">
                        <span className="card-title">{firstName} {lastName}</span>
                        <p>{email}</p>
                        <p>{company}</p>
                        <p>Phone: {phone.length > 9 ? phone.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, '$1-$2-$3') : phone}</p>
                        <p>Revenue: ${Util.formatMoney(revenue, 0)}</p>
                        <p>Locations: {locations}</p>
                        <p>Cash: {cash}%</p>
                    </div>
                    <div className="card-action">
                        <div className="left-align">
                            <div>
                                <Tooltip title="Edit">
                                    <i style={{cursor: 'pointer'}}
                                        className="material-icons left indigo-text text-darken-4"
                                        onClick={() => prospectEdit(_id)}>edit
                                    </i>
                                </Tooltip>

                                <Tooltip title="Delete">
                                    <i style={{cursor: 'pointer'}}
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
                                    <Button onClick={() => this.handleDelete(_id)} variant="contained" color="primary" autoFocus>
                                        Yes
                                    </Button>
                                    </DialogActions>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ); // return
    } // render
}

export default withAuthUserContext(withRouter(Prospect));