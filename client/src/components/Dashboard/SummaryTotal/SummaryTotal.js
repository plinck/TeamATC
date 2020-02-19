import React from 'react';
import { Link } from 'react-router-dom';

import './SummaryTotal.css'

const SummaryTotal = (props) => {
    // wait for props
    if (!props.currentUserTotals || !props.currentTeamTotals) {
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
                                    {props.currentUserTotals.swimNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentUserTotals.bikeNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentUserTotals.runNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
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
                                    {props.currentUserTotals.swimDistanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentUserTotals.bikeDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentUserTotals.runDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
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
                                    {props.currentUserTotals.swimDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentUserTotals.bikeDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentUserTotals.runDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
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
                                    {props.currentTeamTotals.swimNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentTeamTotals.bikeNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentTeamTotals.runNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
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
                                    {props.currentTeamTotals.swimDistanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentTeamTotals.bikeDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentTeamTotals.runDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
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
                                    {props.currentTeamTotals.swimDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentTeamTotals.bikeDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentTeamTotals.runDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
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
                                    {props.currentAllTotals.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.currentAllTotals.swimNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentAllTotals.bikeNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentAllTotals.runNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            {/* End Nbr */}
                        
                            {/* Begin Distance */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Distance: "}
                                    {props.currentAllTotals.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.currentAllTotals.swimDistanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentAllTotals.bikeDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentAllTotals.runDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            {/* End Distance */}
                        
                            {/* Begin Duraation */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Duration: "}
                                    {props.currentAllTotals.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.currentAllTotals.swimDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.currentAllTotals.bikeDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.currentAllTotals.runDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
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