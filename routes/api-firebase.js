const admin = require("../middleware/authServerCommon");
const requiresLogin = require('../middleware/requiresLogin.js');
const db = admin.firestore();;

let deposits = [];
let depositsArchive = [];
let cash = [];
let credit = [];

console.log("I ran");

// Get all deposits on load
db.collection("deposits").onSnapshot((querySnapshot) => {
    deposits = [];
    querySnapshot.forEach(doc => {
        let deposit = {};
        deposit = doc.data();
        deposit.id = doc.id;
        deposit.time = deposit.time.toDate();
        deposits.push(deposit);
    });
}, (err) => console.log(err));

// Get all archived deposits on load
db.collection("depositsarchive").onSnapshot((querySnapshot) => {
    depositsArchive = [];
    querySnapshot.forEach(doc => {
        let deposit = {};
        deposit = doc.data();
        deposit.id = doc.id;
        deposit.time = deposit.time.toDate();
        depositsArchive.push(deposit);
    });
}, (err) => console.log(err));

// Get balances over time
db.collection("cash").onSnapshot(querySnapshot => {
    cash = [];
    querySnapshot.forEach(doc => {
        let total = {};
        total = doc.data();
        total.id = doc.id;
        total.time ? total.time = total.time.toDate() : null;
        cash.push(total);
    });
}, (err) => console.log(err));

// Get credit over time
db.collection("credit").onSnapshot(querySnapshot => {
    credit = [];
    querySnapshot.forEach(doc => {
        let total = {};
        total = doc.data();
        total.id = doc.id;
        total.time = total.time.toDate();
        credit.push(total);
    });
}, (err) => console.log(err));


// Routes Below ------------------------------------------------------------------------------------------
module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });
    
    // Send all deposits
    app.get("/api/firestore/deposits", requiresLogin, (req, res) => {
        res.json(deposits);
    });

    // Send all archived deposits
    app.get("/api/firestore/depositsArchive", requiresLogin, (req, res) => {
        res.json(depositsArchive);
    });

    // Send all cash
    app.get("/api/firestore/cash", requiresLogin, (req, res) => {
        res.json(cash);
    });

    // Send all credit
    app.get("/api/firestore/credit", requiresLogin, (req, res) => {
        res.json(credit);
    });

    // Get deposits in safe
    app.get("/api/firestore/getSafeDeposits", requiresLogin, (req, res) => {
        let result = new Promise((resolve, reject) => {
            let total = 0;
            deposits.forEach(tran => total += tran.amount);
            resolve(total);
        });
        result.then(result => res.json(result));
    });

    // Get pending deposit total - ie not in safe, but not settled
    app.get("/api/firestore/getPendingTotal", requiresLogin, (req, res) => {
        let result = new Promise((resolve, reject) => {
            let total = 0;
            let pendingTrans = depositsArchive.filter(dep => dep.awaitingSettlement === true);
            pendingTrans.forEach(tran => total += tran.amount);
            resolve(total);
        });
        result.then(result => res.json(result));
    });

    // Get settled deposit total - transactions that have been settled 
    app.get("/api/firestore/getSettledTotal", requiresLogin, (req, res) => {
        let result = new Promise((resolve, reject) => {
            let total = 0;
            let pendingTrans = depositsArchive.filter(dep => dep.awaitingSettlement === false);
            pendingTrans.forEach(tran => total += tran.amount);
            resolve(total);
        });
        result.then(result => res.json(result));
    });

};

