import React from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';


import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import User from './User';
import UserAPI from "./UserAPI";

class Users extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [
            ],
            message: ""
        };
    }

    refreshPage = () => {
        // Get with security
        UserAPI.getUsers()
        .then(users => {
            for (let i in users) {
                users[i].firstName = users[i].firstName || "First";
                users[i].lastName = users[i].lastName || "Last";
                users[i].claims = users[i].claims || "user"; 
            }

            // console.log(`Users in refresh page: ${JSON.stringify(users, null, 2)}`);
            this.setState({ users: users });
        })
        .catch(err => {
            console.error(err); 
        });        
    };

    // Scrape all the users on mount
    componentDidMount() {
        this.refreshPage();
    }

    // Delete this article from MongoDB
    userDelete = (id) => {
        UserAPI.delete( id )
        .then(res => {
            console.log("Deleted user");
            this.refreshPage();
        })
        .catch(err => {
            alert(err);
            console.error(err); 
        });
    }

    // Make Admin
    userMakeAdmin = (id) => {

        console.log(`Trying to make User ${id} Admin`);

        UserAPI.makeAdmin( id )
        .then(res => {
            console.log(`Made User ${id} Admin`);
            this.setState({message: `Made User Admin`});
            this.refreshPage();
        })
        .catch(err => {
            alert(err);
            console.error(err); 
        });
    }        
    
    // Make Cashier
    userMakeCashier = (id) => {
        UserAPI.makeCashier( id )
        .then(res => {
            console.log(`Made User ${id} Cashier`);
            this.setState({message: `Made User Cashier`});
            this.refreshPage();
        })
        .catch(err => {
            alert(err);
            console.error(err); 
        });
    }   

    // Make User - essentailly dispables the user
    userMakeUser = (id) => {
        UserAPI.makeUser( id )
        .then(res => {
            console.log(`Made User ${id} User`);
            this.setState({message: `Disabled User (i.e. made them a user)`});
            this.refreshPage();
        })
        .catch(err => {
            alert(err);
            console.error(err); 
        });
    }       

    // Make Banker
    userMakeBanker = (id) => {
        UserAPI.makeBanker( id )
        .then(res => {
            console.log(`Made User ${id} Banker`);
            this.setState({message: `Made User Banker`});
            this.refreshPage();
        })
        .catch(err => {
            this.setState({message: `Error ${err}`});
            console.error(err); 
        });
    }       
    
    // go back to where you came from
    goBack = () => {
        this.props.history.goBack();
    }

    render() {
        if (this.props.user.authUser && this.props.user.isAdmin) {
            return (
                <div className="row">
                <div>{this.state.message}</div>
                {this.state.users.map((user) => {
                    return(            
                        <div key={user.id} className="col s12 m6 l6">
                            <User 
                            userDelete={this.userDelete}
                            userMakeAdmin={this.userMakeAdmin}
                            userMakeCashier={this.userMakeCashier}
                            userMakeBanker={this.userMakeBanker}
                            userMakeUser={this.userMakeUser}
                            userInfo={user}
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

export default withRouter(withAuthUserContext(Users));