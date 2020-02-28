import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Box from "@material-ui/core/Box";
import ResultsCard from "../ResultsCard/ResultsCard";

class TeamResultsModal extends React.Component {

    state = {
        open: false
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.open === true) {
            this.setState({ open: true });
        }
    }

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    leaderBoardHeaderRow = 
    <Box className="row"  fontStyle="oblique" fontWeight="fontWeightBold" border={1} margin={0}>
        <div className="col s1 m1">
        </div>
        <div className="col s3 m3 truncate">
            Name
        </div>
        <div className="black-text col m2 m2 truncate">
            Total
        </div>
        <div className="blue-text col m2 m2 truncate">
            Swim
        </div>
        <div className="red-text col m2 m2 truncate">
            Bike
        </div>
        <div className="green-text col m2 m2 truncate">
            Run
        </div>
    </Box>

    teamTotals = this.props.teamTotals;

    render() {
        return (
            <div>
                <Dialog       
                    fullWidth={"fullWidth"}
                    maxWidth={"lg"}
             
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{"Team Results"}</DialogTitle>
                        <DialogContent className="row">
                                {/* Team standings/results card */}
                                        <Box className="white" margin={2} paddingLeft={1} paddingRight={1}> 
                                            {this.leaderBoardHeaderRow}
                                            {this.teamTotals.map((teamResult, index) => {
                                                return (
                                                    <div key={index}>
                                                        <ResultsCard result={teamResult} index={index}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </Box>
                                {/* End Team standings/results card */}          
                        </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} className="waves-effect waves-light dash-btn blue darken-4 btn white-text" autoFocus>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default TeamResultsModal;
