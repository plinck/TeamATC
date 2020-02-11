import React from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";

import DepositArchive from "./DepositArchive";

class DepositsArchive extends React.Component {
    // Scrape all the prospects on mount
    componentDidMount() {
        // Nothing for now
    }

    render() {
        // Some props take time to get ready so return null when uid not avaialble
        if (!this.props.user || !this.props.user.authUser) {
            return null;
        }
        if (this.props.user.authUser.uid === null) {
            return null;
        }
  
        if (this.props.user && this.props.user.isBanker) {
            return (
                <div className="row">
                {this.props.depositsArchive.map((deposit) => {
                    return(            
                        <div key={deposit.id} className="col s12 m6 l6">
                            <DepositArchive 
                            depositInfo={deposit}
                            />
                        </div>
                        );
                })}
                </div>
            );
        } else if (this.props.user.authUser) {                
            return (
                <Redirect to="/dashboard" />
            );  
        } else  {                
            return (
                <Redirect to="/signin" />
            );      
        }
    }
}

export default withRouter(withAuthUserContext(DepositsArchive));