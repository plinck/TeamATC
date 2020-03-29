import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/functions';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBmeZVx6YKWwqMP8FvsEyoG0eIxcinHYc4",
    authDomain: "teamatc-challenge.firebaseapp.com",
    databaseURL: "https://teamatc-challenge.firebaseio.com",
    projectId: "teamatc-challenge",
    storageBucket: "teamatc-challenge.appspot.com",
    messagingSenderId: "961307717305",
    appId: "1:961307717305:web:faa30c4e8b56dc5c097568",
    measurementId: "G-FXGMVHS2ZX"
  };
  
firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({ timestampsInSnapshots: true });

export default firebase 