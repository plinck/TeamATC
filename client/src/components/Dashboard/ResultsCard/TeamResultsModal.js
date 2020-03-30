import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Box from "@material-ui/core/Box";
import Result from "./Result";
import { TableHead, TableRow, TableCell, Table, TableBody } from '@material-ui/core';

class TeamResultsModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: props.open,
        };
    }
    // gthis isnt orking since when state changes to close, it overrides it with prop passed in
    // static getDerivedStateFromProps(nextProps, prevState){
    //     if(nextProps.open !==prevState.open){
    //       return { open: nextProps.open};
    //    }
    //    else return null;
    //  }

    filterByTeam(results, teamNamme) {
        let teamUserResults = results.filter((result) => {
            if (result.teamName === teamNamme) {
                return result;
            } else {
                return false;
            }
        });
        return teamUserResults;
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

        let leaderBoardHeaderRow =
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell >Total</TableCell>
                    <TableCell align="right">Swim</TableCell>
                    <TableCell align="right">Bike</TableCell>
                    <TableCell align="right">Run</TableCell>
                </TableRow>
            </TableHead>


        // Combine teams
        let combinedResults = [];
        for (let i = 0; i < teamTotals.length; i++) {
            combinedResults.push(teamTotals[i]);
            let userResultsForThisTeam = this.filterByTeam(userTotals, teamTotals[i].userOrTeamName);
            combinedResults = [...combinedResults, ...userResultsForThisTeam]
        }

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
                            {leaderBoardHeaderRow}
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

export default TeamResultsModal;
