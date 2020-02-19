import React from 'react';
import { Link } from 'react-router-dom';

import './SummaryTotal.css'

const SummaryTotal =(props) => {
    if (!props.currentUserTotals) {
        return(null);
    }
    if (!props.currentTeamTotals) {
        return(null);
    }
    return (
        <div>
            <div className="row">

                {/*<-- Mine -->*/}
                <div className="col s12 m4">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title blue-text left-align">
                                <Link to="/activities">
                                   Mine
                                </Link>
                            </span>

                            {/* Begin Nbr */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Activities: "}
                                    {props.currentUserTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.currentUserTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentUserTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentUserTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            {/* End Nbr */}
                        
                            {/* Begin Distance */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Distance: "}
                                    {props.currentUserTotals.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.currentUserTotals.distanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentUserTotals.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentUserTotals.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            {/* End Distance */}
                        
                            {/* Begin Duraation */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Duration: "}
                                    {props.currentUserTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.currentUserTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentUserTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentUserTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            {/* End Distance */}
                        </div>
                    </div>
                </div>

                {/*<-- Team -->*/}
                <div className="col s12 m4">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title blue-text left-align">
                                <Link to="/activities">
                                   Team
                                </Link>
                            </span>
                        
                            {/* Begin Nbr */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Activities: "}
                                    {props.currentTeamTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.currentTeamTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentTeamTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentTeamTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            {/* End Nbr */}
                        
                            {/* Begin Distance */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Distance: "}
                                    {props.currentTeamTotals.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.currentTeamTotals.distanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentTeamTotals.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentTeamTotals.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            {/* End Distance */}
                        
                            {/* Begin Duraation */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Duration: "}
                                    {props.currentTeamTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.currentTeamTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentTeamTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentTeamTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            {/* End Distance */}
                        </div>
                    </div>
                </div>

                {/*<-- All -->*/}
                <div className="col s12 m4">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title blue-text left-align">
                                <Link to="/activities">
                                    All Activities
                                </Link>
                            </span>
                
                            {/* Begin Nbr */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Activities: "}
                                    {props.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            {/* End Nbr */}
                        
                            {/* Begin Distance */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Distance: "}
                                    {props.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.distanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            {/* End Distance */}
                        
                            {/* Begin Duraation */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Duration: "}
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            {/* End Distance */}
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    )
}

export default SummaryTotal;