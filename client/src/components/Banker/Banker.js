import React from 'react';
import { Redirect } from 'react-router';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";

import DepositsArchive from "./DepositsArchive";
import SafeDeposits from "./SafeDeposits/SafeDeposits";
import AwaitingSettlement from "./AwaitingSettlement/AwaitingSettlement";
import SettledDeposits from "./SettledDeposits/SettledDeposits";

import Util from '../Util/Util';
import DepositsArchiveDB from "./DepositsArchiveDB";

class Banker extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;

        this.state = {
            showDeposits: false,
            depositsArchive: [],
            balanceInSafe: 0,
            balanceAwaitingSettlement: 0,
            balanceSettledDeposits: 0,
            message: ""
            };
    }

    // take money out of the safe and onto truck or walk to bank
    sendDepositsToBank = () => {
        // take money out of safe
        DepositsArchiveDB.sendDepositsToBank().then(res => {
            this.refreshTotals();
        }).catch(err => {
            console.error(`sendDepositsToBank Error: ${err}`);
        });
    }

    // settle deposits transported to bank - i.e. put in customers
    // account and clear all balanaces awaiting settlement
    settleDeposits = () => {
        DepositsArchiveDB.settleDeposits(this.props.user).then(settledAmount => {
            this.refreshTotals();
        }).catch(err => {
            console.error(`settleDeposits Error: ${err}`);
        });
    }

    // used for testing to undo and start over
    reverseSafeDeposits = () => {
        DepositsArchiveDB.reverseAwaitingSettlement().then(res => {
            this.refreshTotals();
        }).catch(err => {
            console.error(`sendDepositsToBank Error: ${err}`);
        });
    }

    // generate depoists for testing
    generateDepositTestData = () => {
        DepositsArchiveDB.generateDepositsTestData().then(res => {
            this.refreshTotals();
        }).catch(err => {
            console.error(`generateDepositTestData Error: ${err}`);
        });
    }

    // Repair database in testing
    fixDepositTable = () => {
        DepositsArchiveDB.fixDepositTable().then(res => {
            alert(res);
        }).catch(err => {
            console.error(`fixDepositTable Error: ${err}`);
        });
    }

    getInSafeDeposits = () => {
        DepositsArchiveDB.getInSafeDeposits().then(depositsArray => {
            if (this._isMounted) {
                this.setState({
                    showDeposits: true,
                    depositsArchive: [...depositsArray]
                });    
            }
        }).catch(err => {
            console.error(`Error getting deposits ${err}`);
            if (this._isMounted) {
                // this.setState({
                //     message: `Error getting deposits ${err}`
                // });
            }
        });
    }

    getInSafeTotal = () => {
        Util.apiGet("/api/banker/cashInSafe").then(res => {
            let total = res.data;
            if (this._isMounted) {
                this.setState({
                    balanceInSafe: total,
                }); 
            }   
        }).catch(err => {
            console.error(`Error getInSafeTotal ${err}`);
        });
    }
  
    getAwaitingSettlement = () => {
        DepositsArchiveDB.getAwaitingSettlementWithUser().then(depositsArray => {
            if (this._isMounted) {
                this.setState({
                    showDeposits: true,
                    depositsArchive: [...depositsArray]
                });    
            }
        }).catch(err => {
            console.error(`Error getting deposits ${err}`);
            if (this._isMounted) {
                // this.setState({
                //     message: `Error getting deposits ${err}`
                // });
            }
        });
    }

    getAwaitingTotal = () => {
        Util.apiGet("/api/banker/awaitingSettlement").then(res => {
            let total = res.data;
            if (this._isMounted) {
                this.setState({
                    balanceAwaitingSettlement: total,
                }); 
            }   
        }).catch(err => {
            console.error(`Error getAwaitingTotal ${err}`);
        });
    }

    getSettledDeposits = () => {
        DepositsArchiveDB.getSettledDeposits().then(depositsArray => {
            if (this._isMounted) {
                this.setState({
                    showDeposits: true,
                    depositsArchive: [...depositsArray]
                }); 
            }   
        }).catch(err => {
            console.error(`Error getting deposits ${err}`);
            if (this._isMounted) {
                // this.setState({
                //     message: `Error getting deposits ${err}`
                // });
            }
        });
    }

    getSettledTotal = () => {
        Util.apiGet("/api/banker/settled").then(res => {
            let total = res.data;
            if (this._isMounted) {
                this.setState({
                    balanceSettledDeposits: total,
                }); 
            }   
        }).catch(err => {
            console.error(`Error getSettledTotal ${err}`);
        });
    }
  
    // refresh when totals change
    refreshTotals() {
        this.getInSafeTotal();
        this.getAwaitingTotal();
        this.getSettledTotal();
    }

    // test method to get all deposits with their user name (first and last)
    getWithUser = () => {
        DepositsArchiveDB.getWithUser().then(deposits => {
            if (this._isMounted) {
                this.setState({
                    showDeposits: true,
                    depositsArchive: [...deposits]
                });  
            } 
        }).catch(err => {
            console.error(`Error getting deposits ${err}`);
            if (this._isMounted) {
                // this.setState({
                //     message: `Error getting deposits ${err}`
                // });
            }
        });
    }
  
    // Get totals
    componentDidMount() {
        this._isMounted = true;

        this.refreshTotals();
    }

    // Cancel to avoid the react memory leak errir
    componentWillUnmountMount() {
        this._isMounted = false;
    }

    render() {
        if (this.props.user && this.props.user.isBanker) {
            return ( 
                <div className="container">
                    {this.state.message ? <div className="row">{this.state.messae}</div>: null}
                    <div className="row">
                        <SafeDeposits disabled={this.props.user.isBanker ? false : true}
                            balance={this.state.balanceInSafe}
                            sendDepositsToBank={this.sendDepositsToBank}
                            getInSafeDeposits={this.getInSafeDeposits}
                            reverseSafeDeposits={this.reverseSafeDeposits}
                            generateDepositTestData={this.generateDepositTestData}
                         />
                        <AwaitingSettlement disabled={this.props.user.isBanker ? false : true}
                            balance={this.state.balanceAwaitingSettlement}
                            settleDeposits={this.settleDeposits}
                            getAwaitingSettlement={this.getAwaitingSettlement}
                         />
                        <SettledDeposits disabled={this.props.user.isBanker ? false : true}
                            balance={this.state.balanceSettledDeposits}
                            getSettledDeposits={this.getSettledDeposits}
                         />
                    </div>

                    <div className="row center-align">
                        {/*
                            <br />
                        <button className="btn center-align blue darken-4" onClick={this.fixDepositTable}>Fix Deposits Table</button>{" "}
                        */}
                        <br />
                        {/*}
                        <button className="btn center-align blue darken-4" onClick={this.getWithUser}>Get With User</button>{" "}
                        */}
                    </div>
                    {this.state.showDeposits ? <h5 className="center-align">Deposits</h5> : null}
                    {this.state.showDeposits ? <DepositsArchive depositsArchive={this.state.depositsArchive}/> : null}
                </div>
            );
        } 
        else if (this.props.user.authUser) {                
            return (
                <Redirect to="/dashboard" />
            );  
        } 
        else  {                
            return (
                <Redirect to="/signin" />
            );      
        }
    }
}

export default withAuthUserContext(Banker);