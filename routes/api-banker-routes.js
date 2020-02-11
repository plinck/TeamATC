const admin = require("../middleware/authServerCommon");
const requiresLogin = require('../middleware/requiresLogin.js');
const db = admin.firestore();;

// Static *class* variables
let _depositsInSafe = [];
let _cashInSafe = 0;
let _depositsAwaitingSettlement = [];
let _awaitingSettlement = 0;
let _depositsSettled = [];
let _settled = 0;

// Get all archived deposits anytime it changes attach user
db.collection("deposits").onSnapshot((querySnapshot) => {
    let cashInSafe = 0;
    depositsInSafe = [];
    const userQueries = [];
    querySnapshot.forEach(doc => {
        let deposit = doc.data();
        cashInSafe += deposit.amount;
        deposit.id = doc.id;
        deposit.time = deposit.time.toDate();
        // get the user ndoc.data().uid;
        const userRef = db.collection("users").doc(deposit.uid);
        const userQuery = userRef.get()
        .then ( user => {
            if (user.exists) {
                deposit.firstName = user.data().firstName;
                deposit.lastName = user.data().lastName;
                deposit.email = user.data().email;
            }
        })
        .catch(err => console.error(`Error userQuery: ${err}`))
        .finally(() => {
            depositsInSafe.push(deposit);
        });
        userQueries.push(userQuery);
    });
    Promise.all(userQueries).then(() => {
        _depositsInSafe = depositsInSafe;
        _cashInSafe = cashInSafe;
    });

}, (err) => console.error(err));

// Get all archived deposits anytime it changes attach user
db.collection("depositsarchive").onSnapshot((querySnapshot) => {
    let awaitingSettlement = 0;
    let settled = 0;
    depositsAwaitingSettlement = [];
    depositsSettled = [];
    const userQueries = [];
    querySnapshot.forEach(doc => {
        let deposit = doc.data();
        deposit.id = doc.id;
        deposit.time = deposit.time.toDate();
        ("settledDateTime" in deposit) ? deposit.settledDateTime = deposit.settledDateTime.toDate() : console.log("false");
        // get the user ndoc.data().uid;
        const userRef = db.collection("users").doc(deposit.uid);
        const userQuery = userRef.get()
        .then ( user => {
            if (user.exists) {
                deposit.firstName = user.data().firstName;
                deposit.lastName = user.data().lastName;
                deposit.email = user.data().email;
            }
        })
        .catch(err => console.error(`Error userQuery: ${err}`))
        .finally(() => {
            if (deposit.awaitingSettlement === true) {
                awaitingSettlement += deposit.amount;
                depositsAwaitingSettlement.push(deposit);
            }
            if (deposit.settled === true) {
                settled += deposit.amount;
                depositsSettled.push(deposit);
            }
        });
        userQueries.push(userQuery);
    });
    Promise.all(userQueries).then(() => {
        _depositsAwaitingSettlement = depositsAwaitingSettlement;
        _depositsSettled = depositsSettled;
        _awaitingSettlement = awaitingSettlement;
        _settled = settled;
    });

}, (err) => console.error(err));


// Routes Below ------------------------------------------------------------------------------------------
module.exports = function (app) {

    // Authorization Express Error Handler If nt authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });

    // Send all deposits in Safe and in archive
    app.get("/api/banker/allDeposits", requiresLogin, (req, res) => {
        let allDeposits = _depositsInSafe.concat(_depositsAwaitingSettlement);
        allDeposits = allDeposits.concat(_depositsSettled);

        res.json(allDeposits);
    });     
    
    // Send all deposits in Safe
    app.get("/api/banker/depositsInSafe", requiresLogin, (req, res) => {
        res.json(_depositsInSafe);
    });

    // Send all depositsAwaitingSettlement
    app.get("/api/banker/depositsAwaitingSettlement", requiresLogin, (req, res) => {
        res.json(_depositsAwaitingSettlement);
    });

    // Send all depositsSettled
    app.get("/api/banker/depositsSettled", requiresLogin, (req, res) => {
        res.json(_depositsSettled);
    });

    // Get total of deposits in safe
    app.get("/api/banker/cashInSafe", requiresLogin, (req, res) => {
        res.json(_cashInSafe);
    });

    // Get total of deposits in safe
    app.get("/api/banker/awaitingSettlement", requiresLogin, (req, res) => {
        res.json(_awaitingSettlement);
    });

    // Get total of deposits in safe
    app.get("/api/banker/settled", requiresLogin, (req, res) => {
        res.json(_settled);
    });

};

