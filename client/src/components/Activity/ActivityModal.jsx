import React from 'react';
import { Link } from 'react-router-dom';

const Modal = props => {
    return (
        <div>
            <div id="modal1" className="modal">
                <div className="modal-content">
                    <h4>Activity Update Successful!</h4>
                    <h5>distance: {props.distance}</h5>
                </div>
                <div className="modal-footer">
                    <Link to="/activities" className="modal-close waves-effect waves-green btn-flat">Accept</Link>
                </div>
            </div>
        </div>
    )
}

export default Modal