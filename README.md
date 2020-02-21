# Team ATC Challenge

## Overview

### The Problem

### The Existing Process

### Our Solution

### Deployment

This is deployed to **Google Cloud Platform**.  GCP provides several huge advantages especially as it relates to security and hiding keys and credentials.  When app is running in test mode, sensitive data is stored in hidden files on developers local machine. When depoloyed to google cloud platform, the services keys, credentials etc are automatically protected and accessed inside the google cloud platform App engine.

NOTE: We also deployed to Herkou since GCP was charging fees given the services we are using.

## Links

* [Live Google Cloud Platform Site](https://teamatc-challenge.appspot.com)
* [Live HEROKU Link](https://teamatc-challenge.herokuapp.com)
* [GitHub for this](https://github.com/plinck/TeamATC/)

## Technologies Used

* [x] HTML/CSS/Javascript
* [x] REACT, REACT Context
* [x] Node.js, Express
* [x] Firebase Auth with Custom Claims
* [x] Firebase Firestore for all secure data
* [x] MongoDB and Mongose (for Schemas, and non-secure data)
* [x] MongoDB Atlas Clusters
* [x] Axios (in node server and REACT components)
* [x] Materialize, MaterialUI
* [x] Google Cloud Platform
* [x] Plotly (for Graphing)

## Screenshots

## Architecture

### Security

Using firebase auth and google admin auth services for authentication and aiuthorization including custom user roles using firebase custom claims.  Custom claims can only be updated on the server side inside an authorized context of the app to keep this process secure - goodle does not allow these to be set in the client since it is not secure.  The app uses these custom claimns for role base security at 4 primary levels.  Currently we have 4 roles with different authorization with the app - admin, moderator, teamLead and user.

1. User can only see links and other UI objects that they are allowed to see for their role

2. REACT componments are wrapped in higher order components with authentication/aithorization context (using REACT context) and checked to ensure even if someone used inspector to go around the role based UI, it will preveent them from loading that compoent unless authorized.

3. All secure server transaction require auth context using secure token and are also checked based on auth role to prevent access to any server side services that are not allowed.

4. Firestore data is completely locked down using the auth customClaims so even if a hacker was sneaky enough to bypass all the client side security, they would be unable to update the data in any way.

### Model View Controller (with lightweight controller routing to business and data logic)

* Views / `/client` - `/public` (dev) and `/build` (productoion) HTML/CSS/JS using REACT
  * Materialize JS and CSS
  * REACT Components

* Controllers - `/server.js` , `/routes` - REACT Static Routes and `/api` routes for Mongo and Fiebase Auth and Firebase Firestore

* Security - `/middleware`

* Model (Data) - `/model`
  * Uses Firebase Firestore for all secure data and transactions
  * Uses Mongo and Mongoose for Data Layer for insecure data like getting prospects from landing page
