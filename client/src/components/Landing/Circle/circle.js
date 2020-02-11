import React from 'react';
import './circle.css';


function Circle(props) {
    return (
            <div className="circle valign-wrapper">
                <p className="center-align circle-text">{props.info}</p>
            </div>
    )
}

export default Circle;