import React from 'react';
import './SummaryTotal.css'

const SummaryTotal =(props) => {
    return (
        <div>
            <div className="row">

                {/*<-- Mine -->*/}
                <div className="col s12 m4">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title blue-text left-align">Mine</span>
                        
                            {/* Begin Nbr */}
                            <h6>
                                <span className="black-text truncate"> 
                                    {"Activities: "}
                                    {props.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h7>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h7>
                            <h7>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h7>
                            <h7>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h7>
                            {/* End Nbr */}
                        
                            {/* Begin Distance */}
                            <h6>
                                <span className="black-text truncate"> 
                                    {"Distance: "}
                                    {props.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            <h7>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.distanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                                </span>
                            </h7>
                            <h7>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h7>
                            <h7>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h7>
                            {/* End Distance */}
                        
                            {/* Begin Duraation */}
                            <h6>
                                <span className="black-text truncate"> 
                                    {"Duration: "}
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h7>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h7>
                            <h7>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h7>
                            <h7>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h7>
                            {/* End Distance */}
                        </div>
                    </div>
                </div>

                {/* Team */}
                <div className="col s12 m4">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title blue-text left-align">Team</span>
                            <h6>
                                <span className="black-text truncate"> 
                                    {"Duration Total: "}
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>

                            <h7>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.durationTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                                </span>
                            </h7>
                            <h7>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h7>
                            <h7>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h7>
                        </div>
                    </div>
                </div>

                {/*<-- All -->*/}
                <div className="col s12 m4">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title blue-text left-align">All</span>
                            
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
                {/* End All Card */}
                
            </div>
        </div>
    )
}

export default SummaryTotal;