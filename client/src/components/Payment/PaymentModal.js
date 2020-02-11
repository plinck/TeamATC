import React from 'react';
import { Link } from 'react-router-dom';

const Modal = props => {
    return (
        <div>
            <div id="modal1" className="modal">
                <div className="modal-content">
                    <h4>Payment Successful!</h4>
                    <p>Payment Amount: ${props.payment}</p>
                </div>
                <div className="modal-footer">
                    <Link to="/dashboard" className="modal-close waves-effect waves-green btn-flat">OK</Link>
                </div>
            </div>
        </div>
    )
}

export default Modal