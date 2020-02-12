const express = require('express');
const app = express();
const path = require('path');
require("dotenv").config();
const port = process.env.PORT || 5000;

// Parse request body as JSON
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

// // Connect to the Mongo DB LOCAL
// mongoose.connect("mongodb://localhost:27017/fintechdb", {
//     useNewUrlParser: true
// });

require("./routes/api-auth-routes.js")(app);
require("./routes/api-user-routes.js")(app);
require("./routes/api-banker-routes.js")(app);
require("./routes/api-firebase.js")(app);

//app.use(express.static(path.join(__dirname, 'client', 'build')));
// //production mode - serve from build dir, else serve from public
if (process.env.NODE_ENV === 'production') {
    console.log(`prod mode ${path.join(__dirname, 'client', 'build', 'index.html')}`);
    app.use(express.static(path.join(__dirname, 'client', 'build')));
    app.get('*', function (req, res) {
        const index = path.join(__dirname, 'client', 'build', 'index.html');
        res.sendFile(index);
    });
} else {
    console.log(`dev mode ${path.join(__dirname, '/client/public/index.html')}`);
    //dev mode
    app.use(express.static(path.join(__dirname, 'client', 'public')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname + '/client/public/index.html'));
    })
}

//Start server
app.listen(port, (req, res) => {
    console.log(`server listening on port: ${port}`)
});