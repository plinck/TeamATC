import React, { Component } from 'react';
import DepositDB from '../Dashboard/Deposit/DepositDB';
import M from "materialize-css/dist/js/materialize.min.js";
import Modal from './PaymentModal';
import Util from '../Util/Util';
import { withAuthUserContext } from '../Auth/Session/AuthUserContext';
import { Redirect } from 'react-router';



class Payment extends Component {
    state = {
        credit: 0,
        minimum: 25,
        other: ""
    }

    componentDidMount() {
        DepositDB.get("credit")
            .then(res => this.setState({ credit: res[0].balance }));

        let elem = document.querySelector(".modal");
        M.Modal.init(elem);
    }

    onChangeHandler = event => {
        let value = event.target.value;
        this.setState({ other: value });
        console.log(value)
    }

    onSubmitHandler = event => {
        event.preventDefault()
        let radios = document.getElementsByName('group1');
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                let amount = parseFloat(radios[i].value)
                this.setState({ payment: amount }, () => this.submitPaymentHandler());
                break;
            }
        }
    }

    submitPaymentHandler = () => {
        const db = Util.getFirestoreDB();
        db.collection('payments').add({
            amount: this.state.payment,
            time: Date.now()
        });
    }


    render() {
        if (this.props.user.authUser) {
            return (
                <div>
                    <div className="container">
                        <Modal payment={this.state.payment} />
                        <div className="row">
                            <div className="col s12">
                                <div className="card">
                                    <div className="card-content">
                                        <span className="card-title"><h4>Make a payment</h4></span>

                                        <form action="#!">
                                            <p>
                                                <label>
                                                    <input className="with-gap" name="group1" type="radio" value={this.state.credit} />
                                                    <span>Current Balance: ${this.state.credit}</span>
                                                </label>
                                            </p>
                                            <p>
                                                <label>
                                                    <input className="with-gap" name="group1" type="radio" value={this.state.minimum} />
                                                    <span>Minimum Payment: ${this.state.minimum}</span>
                                                </label>
                                            </p>
                                            <p>
                                                <label>
                                                    <input className="with-gap" name="group1" type="radio" value={this.state.other} />
                                                    <span> Other: ${this.state.other}
                                                        <span className="input-field">
                                                            <input id="otherVal" type="number" className="validate" onChange={this.onChangeHandler} value={this.state.other} />
                                                        </span>
                                                    </span>
                                                </label>
                                            </p>
                                            <br></br>
                                            <button className="btn waves-effect waves-light modal-trigger"
                                                type="submit" href="#modal1" onClick={this.onSubmitHandler} name="action">Submit
                                        </button>
                                        </form>

                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )
        } else {
            return (
                <Redirect to="/" />
            )
        }

    }
}


export default withAuthUserContext(Payment);