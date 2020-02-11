import React from 'react';
import { Link } from 'react-router-dom';

const Modal = props => {
    return (
        <div>
            <div id="modal1" className="modal">
                <div className="modal-content">
                    <h4>Deposit Successful!</h4>
                    <h5>Amount: ${props.amount}</h5>
                </div>
                <div className="modal-footer">
                    <Link to="/dashboard" className="modal-close waves-effect waves-green btn-flat">Accept</Link>
                </div>
            </div>
        </div>
    )
}

export default Modal