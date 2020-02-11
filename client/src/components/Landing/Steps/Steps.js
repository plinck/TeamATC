import React from 'react';
import './Steps.css'

function Steps(props) {
    return (
        <div className="col s12 m4">
            <h1 className="stepNum">{props.num}</h1>
            <p className="stepName">{props.step}</p>
        </div>
    )
};

export default Steps;