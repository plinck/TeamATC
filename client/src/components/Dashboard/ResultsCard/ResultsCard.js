import React from 'react';
import { Link } from 'react-router-dom';

import './ResultsCard.css'

const SummaryTotal = (props) => {
    // wait for props
    if (!props.userResults || !props.teamResults) {
        return(null);
    }

    return (
        <div>
                {/*<-- Team Leaderboard -->*/}
                <div className="col s12 m6">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title blue-text left-align">
                                <Link to="/activities">
                                   Team Leaderboard
                                </Link>
                            </span>
                        
                            {/* Begin Nbr */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Activities: "}
                                    {props.teamResults.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.teamResults.swimNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.teamResults.bikeNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.teamResults.runNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            {/* End Nbr */}
                        
                            {/* Begin Distance */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Distance: "}
                                    {props.teamResults.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.teamResults.swimDistanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.teamResults.bikeDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.teamResults.runDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            {/* End Distance */}
                        
                            {/* Begin Duraation */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Duration: "}
                                    {props.teamResults.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.teamResults.swimDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.teamResults.bikeDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.teamResults.runDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            {/* End Distance */}
                        </div>
                    </div>
                </div>
                {/*<-- End Leaderboard -->*/}

                {/*<-- Individual Leaderboad -->*/}
                <div className="col s12 m6">
                    <div className="card">
                        <div className="card-content pCard">
                            <span className="card-title blue-text left-align">
                                <Link to="/activities">
                                    Individual Leaderboard
                                </Link>
                            </span>

                            {/* Begin Nbr */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Activities: "}
                                    {props.userResults.nbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.userResults.swimNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.userResults.bikeNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.userResults.runNbrActivities.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </span>
                            </h6>
                            {/* End Nbr */}
                        
                            {/* Begin Distance */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Distance: "}
                                    {props.userResults.distanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.userResults.swimDistanceTotal.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Yards
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.userResults.bikeDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.userResults.runDistanceTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Miles
                                </span>
                            </h6>
                            {/* End Distance */}
                        
                            {/* Begin Duraation */}
                            <h5>
                                <span className="black-text truncate"> 
                                    {"Duration: "}
                                    {props.userResults.durationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h5>
                            <h6>
                                <span className="blue-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-swimming-50.png"} alt={"Swim"} />{"Swim: "} 
                                    {props.userResults.swimDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="red-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-triathlon-50.png"} alt={"Bike"} />{"Bike: "} 
                                    {props.userResults.bikeDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            <h6>
                                <span className="green-text truncate"> 
                                    <img style={{maxHeight: '20px'}} src={"/images/icons8-running-50.png"} alt={"Run"} />{"Run: "} 
                                    {props.userResults.runDurationTotal.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Hours
                                </span>
                            </h6>
                            {/* End Distance */}
                        </div>
                    </div>
                </div>
                {/*<-- IEnd ndividual Leaderboad -->*/}
            
            
        </div>
    )
}

export default SummaryTotal;