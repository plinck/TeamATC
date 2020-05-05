import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Result from "./Result.jsx";
import { TableHead, TableRow, TableCell, Table, TableBody } from '@material-ui/core';

class UserResultsModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: props.open,
        };
    }

    render() {
        let userTotals = this.props.userTotals;

        let leaderBoardHeaderRow =
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell >Total</TableCell>
                    <TableCell align="right">Swim</TableCell>
                    <TableCell align="right">Bike</TableCell>
                    <TableCell align="right">Run</TableCell>
                    <TableCell align="right">Other</TableCell>
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
                    <DialogTitle id="alert-dialog-title">{"Individual Results"}</DialogTitle>
                    <DialogContent>
                        {/* User standings/results card */}
                        <Table size="small" >
                            {leaderBoardHeaderRow}
                            <TableBody>
                                {userTotals.map((userResult, index) => {
                                    return (
                                        <Result key={index} result={userResult} index={index} />
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {/* End User standings/results card */}
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

export default UserResultsModal;
