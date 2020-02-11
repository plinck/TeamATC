import React from 'react';


const GraphCard = (props) => {
    return (
        <div>
            <div className="col s12 m6">
                <div className="card">
                    <div className="card-content pCard">
                        <span className="card-title">{props.title ? props.title : 'Card Title'}</span>
                        <h1 className="">Graph will go here</h1>
                    </div>
                    <div className="card-action pCard">
                        <div className="center-align">
                            <a href="#!" className="waves-effect waves-light dash-btn blue darken-4 btn">More Details</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GraphCard;