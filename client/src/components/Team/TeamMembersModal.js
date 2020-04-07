import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Result from "./Result";
import { TableHead, TableRow, TableCell, Table, TableBody } from '@material-ui/core';

class TeamMembersModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: props.open,
            users: []
        };
    }

    componentDidMount() {
        TeamDB.getTeamUsers(props.teamId).then (users => {
            this.setState({users : users});
        }).catch(err => {
            console.error(`Error getting teams users`);
        })
    }

    sortByTeam(results) {
        results.sort((a, b) => {
            const teamA = a.teamName;
            const teamB = b.teamName;

            let comparison = 0;
            if (teamA > teamB) {
                comparison = 1;
            } else if (teamA < teamB) {
                comparison = -1;
            }
            return comparison;  // comparison * -1 ==> Invert so it will sort in descending order
        });
        return results;
    }

    render() {
        // switch to component will receive props
        // if (!this.props.teamTotals || this.props.userTotals) {
        //     return null;
        // }
        let teamTotals = this.props.teamTotals;
        let userTotals = this.props.userTotals;

        let teamMemberHeaderRow =
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell >Email</TableCell>
                    <TableCell align="right">Logged?</TableCell>
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
                    <DialogTitle id="alert-dialog-title">{"Team Results"}</DialogTitle>
                    <DialogContent>
                        {/* Team standings/results card */}
                        <Table size="small" >
                            {teamMemberHeaderRow}
                            <TableBody>
                                {combinedResults.map((combinedResult, index) => {
                                    return (
                                        <Result key={index} result={combinedResult} index={index} />
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {/* End Team standings/results card */}
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

export default TeamMembersModal;
