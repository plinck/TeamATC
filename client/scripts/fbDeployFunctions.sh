cd ~/GitHub/firebase/TeamATC/client/functions
firebase functions:config:set environment.org="ATC" environment.env="prod"
firebase deploy --only functions --project teamatc-challenge