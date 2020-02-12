import React from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router';
import CircularProgress from '@material-ui/core/CircularProgress';


import { withAuthUserContext } from "../Auth/Session/AuthUserContext";
import DepositItem from './DepositItem';
import Util from '../Util/Util';

import { withStyles } from '@material-ui/core/styles';

// export csv functionality
// eslint-disable-next-line no-unused-vars
import { CSVLink, CSVDownload } from "react-csv";


const styles = theme => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    progress: {
        margin: theme.spacing.unit * 2,
    },
});

class DepositList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loadingFlag: false,
            deposits: [
            ]
        };
    }

    getDeposits = () => {
        // Get with security
        Util.apiGet("/api/banker/allDeposits")
            .then(res => {
                let allDeposits = res.data;
                let sortedByDate = allDeposits.sort((a, b) => {
                    return (a.time < b.time) ? 1 : -1;
                });
                this.setState({ loadingFlag: false, deposits: sortedByDate });
            })
            .catch(err => {
                console.error(err);
                this.setState({ loadingFlag: false });
            });
    };

    // get all on mount
    componentDidMount() {
        this.setState({ loadingFlag: true });
        this.getDeposits();
    }

    render() {
        const { classes } = this.props;

        // Some props take time to get ready so return null when uid not avaialble
        // if (this.props.user.uid === null) {
        //     return null;
        // }

        if (this.props.user.authUser) {
            return (
                <div className="container">
                    <br></br>
                    <CSVLink
                        data={this.state.deposits}
                        filename={'teamatc-transactions.csv'}
                        className='btn blue darken-4'
                        target="_blank"
                    >EXPORT TO CSV</CSVLink>
                    <div className={classes.root}>
                        <div className="row">
                            <h5 className="col s6 m3 offset-m1">Time</h5>
                            <h5 className="col s6 m3">User</h5>
                            <h5 className="col s12 m2 offset-m3">Amount</h5>
                        </div>
                        {this.state.loadingFlag ? <div> <CircularProgress className={classes.progress} /> <p>Loading ...</p> </div> : null}
                        {this.state.deposits.map((deposit) => {
                            return (
                                <div key={deposit.id}>
                                    <DepositItem deposit={deposit}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        } else {
            return (
                <Redirect to="/dashboard" />
            );
        }
    }
}


export default withRouter(withAuthUserContext(withStyles(styles)(DepositList)));