import React from 'react';
import './SummaryTotal.css'

const SummaryTotal =(props) => {
    return (
        <div>
            <div className="row">
                <div className="col s12 l4">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title blue-text left-align">{props.title ? props.title : "All"}</span>
                            
                            <h3 className="displayTotal">
                                <span className="truncate"> 
                                    <div className="black-text">Activities</div>
                                    {props.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h3>
                            
                            <h3 className="displayTotal truncate">
                                <span className="truncate">
                                    <div className="black-text">Distance Total</div>
                                    {props.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h3>
                            
                            <h3 className="displayTotal truncate">
                                <span>
                                    <div className="black-text">Duration Total</div>
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SummaryTotal;