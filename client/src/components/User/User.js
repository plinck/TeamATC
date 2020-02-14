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

      handleDelete= (id) => {
        this.setState({ openConfirmDelete: false });
        this.props.userDelete(id);
      };
    
    // decontruct props
    render() {
        let { id, uid, firstName, lastName, phoneNumber, email, photoURL, claims } =  this.props.userInfo;
        let { userMakeAdmin, userMakeCashier, userMakeUser, userMakeBanker } =  this.props;
    
        if (!photoURL) {
            photoURL = "./images/noUserImage150x150.png";
        }     

        if (id === null ) {
            return(null);
        }
        
        // Send to edit page
        const userEdit = () => {
            this.props.history.push({
                pathname: '/userpage',
                state: {id: this.props.userInfo.id }
            });
        };

        // dont let you delete yourself
        const editIsDisabled = (this.props.user && this.props.user.authUser && this.props.user.authUser.uid) ===  uid ? true: false;
        
        return ( 
            <div className="card horizontal">
                <div className="card-image">
                    <img style={{maxHeight: '120px'}} src={photoURL} alt={firstName} />
                </div>
                <div className="card-stacked">
                    <div className="card-content">
                        <span className="card-title">{firstName} {lastName}</span>
                        <p>{email}</p>
                        <p>{phoneNumber.length > 9 ? phoneNumber.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, '$1-$2-$3') : phoneNumber}</p>
                        <p>Primary Role: {claims}</p>
                    </div>
                    <div className="card-action">
                        <div className="left-align">
                            {editIsDisabled ? <p><i>Current User - Cant Edit</i></p> : null}
                            {editIsDisabled ? null : 
                            <div>
                                <Tooltip title="Edit">
                                    <i style={{cursor: 'pointer'}}
                                        disabled={editIsDisabled}
                                        className="userEdit material-icons left indigo-text text-darken-4"
                                        onClick={() => userEdit(id)}>edit
                                    </i>
                                </Tooltip>

                                <Tooltip title="Delete">
                                    <i style={{cursor: 'pointer'}}
                                        disabled={editIsDisabled}
                                        className="material-icons left indigo-text text-darken-4"
                                        onClick={this.handleClickOpen}>delete
                                    </i>
                                </Tooltip>

                                <Tooltip title="Make Cashier">
                                    <i style={{cursor: 'pointer'}}
                                        disabled={editIsDisabled}
                                        className="material-icons left indigo-text text-darken-4"
                                        onClick={() => userMakeCashier(id)}>account_balance
                                    </i>
                                </Tooltip>

                                <Tooltip title="Make Admin">
                                    <i style={{cursor: 'pointer'}}
                                        disabled={editIsDisabled}
                                        className="material-icons left indigo-text text-darken-4"
                                        onClick={() => userMakeAdmin(id)}>supervisor_account
                                    </i>
                                </Tooltip>

                                <Tooltip title="Make Banker">
                                    <i style={{cursor: 'pointer'}}
                                        disabled={editIsDisabled}
                                        className="material-icons left indigo-text text-darken-4"
                                        onClick={() => userMakeBanker(id)}>next_week
                                    </i>
                                </Tooltip>

                                <Tooltip title="Disable (i.e. make user)">
                                    <i style={{cursor: 'pointer'}}
                                        disabled={editIsDisabled}
                                        className="material-icons left indigo-text text-darken-4"
                                        onClick={() => userMakeUser(id)}>lock
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
                        </div>
                    </div>
                </div>
            </div>
        ); // return
    } // render()
}

export default withAuthUserContext(withRouter(User));