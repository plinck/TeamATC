import React from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";

import Prospect from "./Prospect";
import Util from '../Util/Util';

class Prospects extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;

        this.state = {
            prospects: [
            ],
            message: ""
        };
    }

    fetchProspects = () => {
        // Get with security
        Util.apiGet("/api/prospect").then(results => {
            // console.log(`Prospects in refresh page: ${JSON.stringify(prospects, null, 2)}`);
            if (this._isMounted) {
                this.setState({ prospects: results.data });
            }
        }).catch(err => {
            console.error(err); 
        });        
    };

    // Scrape all the prospects on mount
    componentDidMount() {
        this._isMounted = true;
        this.fetchProspects();
    }
        // Cancel to avoid the react memory leak errir
    componentWillUnmountMount() {
        this._isMounted = false;
    }
    

    // Delete this prospect from MongoDB
    prospectDelete = (_id) => {
        console.error("Delete not implemented yet");
        // dont let code execute yet, so wrap in false
        Util.apiPost(`/api/prospectDelete/${_id}`)
        .then(res => {
            if (this._isMounted) {
                this.setState({message: `Deleted Prospect`});
            }
            this.fetchProspects();
        })
        .catch(err => {
            if (this._isMounted) {
                // this.setState({message: `Error Deleting Prospect: ${err}`});
            }
            console.error(err); 
        });
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
                <div>{this.state.message}</div>
                {this.state.prospects.map((prospect) => {
                    return(            
                        <div key={prospect._id} className="col s12 m6 l6">
                            <Prospect 
                            prospectDelete={this.prospectDelete}
                            prospectInfo={prospect}
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

export default withRouter(withAuthUserContext(Prospects));