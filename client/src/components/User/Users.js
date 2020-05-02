import React from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';


import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import User from './User';
import UserDB from "./UserDB";
import { Grid } from '@material-ui/core';

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
        UserDB.getUsers().then(users => {
                for (let i in users) {
                    users[i].firstName = users[i].firstName || "First";
                    users[i].lastName = users[i].lastName || "Last";
                    users[i].primaryRole = users[i].primaryRole || "user";
                    users[i].stravaUserAuth = users[i].stravaUserAuth || false;
                    users[i].stravaAthleteId = users[i].stravaAthleteId || 0;
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

    componentDidUpdate(prevProps) {
        if (this.props.user && this.props.user.challengeUid && this.props.user.challengeUid !== prevProps.user.challengeUid) {
            // Do Work
        }
    }

    // Delete this article from MongoDB
    userDelete = (id) => {
        UserDB.delete(id).then(res => {
            console.log("Deleted user");
            this.refreshPage();
        }).catch(err => {
            this.setState({ message: `Error deleting user: ${err}` });
            console.error(`Error deleting user: ${err}`);
        });
    }

    // Make Admin
    userMakeAdmin = (id) => {

        console.log(`Trying to make User ${id} Admin`);

        UserDB.makeAdmin(id)
            .then(res => {
                console.log(`Made User ${id} Admin`);
                this.setState({ message: `Made User Admin` });
                this.refreshPage();
            })
            .catch(err => {
                alert(err);
                console.error(err);
            });
    }

    // Make TeamLead
    userMakeTeamLead = (id) => {
        UserDB.makeTeamLead(id)
            .then(res => {
                console.log(`Made User ${id} TeamLead`);
                this.setState({ message: `Made User TeamLead` });
                this.refreshPage();
            })
            .catch(err => {
                alert(err);
                console.error(err);
            });
    }

    // Make User - essentailly dispables the user
    userMakeUser = (id) => {
        UserDB.makeUser(id)
            .then(res => {
                console.log(`Made User ${id} User`);
                this.setState({ message: `Disabled User (i.e. made them a user)` });
                this.refreshPage();
            })
            .catch(err => {
                alert(err);
                console.error(err);
            });
    }

    // Make Moderator
    userMakeModerator = (id) => {
        UserDB.makeModerator(id)
            .then(res => {
                console.log(`Made User ${id} Moderator`);
                this.setState({ message: `Made User Moderator` });
                this.refreshPage();
            })
            .catch(err => {
                this.setState({ message: `Error ${err}` });
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
                <Grid style={{ paddingTop: "10px" }} container spacing={2} alignItems="stretch">
                    <div>{this.state.message}</div>
                    {this.state.users.map((user) => {
                        return (
                            <Grid item xs={12} md={4} lg={3} key={user.id}>
                                <User
                                    userDelete={this.userDelete}
                                    userMakeAdmin={this.userMakeAdmin}
                                    userMakeTeamLead={this.userMakeTeamLead}
                                    userMakeModerator={this.userMakeModerator}
                                    userMakeUser={this.userMakeUser}
                                    userInfo={user}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            );
        } else if (this.props.user.authUser) {
            return (
                <Redirect to="/activities" />
            );
        } else {
            return (
                <Redirect to="/signin" />
            );
        }
    }
}

export default withRouter(withAuthUserContext(Users));