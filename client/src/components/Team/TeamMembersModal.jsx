import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TeamMember from "./TeamMember";
import TeamDB from "./TeamDB";
import { TableHead, TableRow, TableCell, Table, TableBody } from '@material-ui/core';
import { withAuthUserContext } from "../Auth/Session/AuthUserContext";

class TeamMembersModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: this.props.open,
            teamMembers: []
        };
    }

    componentDidMount() {
        if (this.props.teamUid) {
            TeamDB.getTeamUsers(this.props.teamUid).then (teamMembers => {
                this.setState({teamMembers : teamMembers});
            }).catch(err => {
                console.error(`Error getting teams teamMembers`);
            })
        }
    }

    componentDidUpdate(prevProps) {
            if (this.props.teamUid && this.props.teamUid !== prevProps.teamUid) {
                TeamDB.getTeamUsers(this.props.teamUid).then (teamMembers => {
                    this.setState({teamMembers : teamMembers});
                }).catch(err => {
                    console.error(`Error getting teams teamMembers ${err}`);
                })
            }
    }


    render() {

        let teamMemberHeaderRow =
            <TableHead>
                <TableRow>
                    <TableCell component="th" scope="row" style={{ paddingLeft: "50px" }}>
                        Name
                    </TableCell>
                    <TableCell align="right">
                        Email
                    </TableCell>
                    <TableCell align="right">
                        Logged?
                    </TableCell>
                </TableRow>
            </TableHead>

        return (
            <div>
                <Dialog
                    fullWidth={true}
                    maxWidth={"md"}

                    open={this.props.open}
                    onClose={this.props.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{"Team Members"}</DialogTitle>
                    <DialogContent>
                        <Table size="small" >
                            {teamMemberHeaderRow}
                            <TableBody>
                                {this.state.teamMembers.map((teamMember, index) => {
                                    return (
                                        <TeamMember key={index} 
                                        isThisMine={this.props.user.uid === teamMember.id ? true : false} 
                                        teamMember={teamMember}
                                        index={index} />
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.props.handleClose} autoFocus>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default withAuthUserContext(TeamMembersModal);
