import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Box from "@material-ui/core/Box";
import Result from "./Result";

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
        results.sort((a,b) => {
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
        
        // Combine teams
        let combinedResults = [];
        for (let i =0; i < teamTotals.length; i++) {
            combinedResults.push(teamTotals[i]);
            let userResultsForThisTeam = this.filterByTeam(userTotals, teamTotals[i].userOrTeamName);
            combinedResults = [...combinedResults, ...userResultsForThisTeam]
        }

        return (
            <div>
                <Dialog       
                    fullWidth={"fullWidth"}
                    maxWidth={"md"}
             
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{"Team Results"}</DialogTitle>
                        <DialogContent>
                            {/* Team standings/results card */}
                            <Box className="white" margin={1} paddingLeft={1} paddingRight={1}> 
                                {leaderBoardHeaderRow}
                                {combinedResults.map((combinedResult, index) => {
                                    return (
                                        <div key={index}>
                                            <Result result={combinedResult} index={index}
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
