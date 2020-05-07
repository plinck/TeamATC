cd ~/GitHub/firebase/TeamATC/client/functions
firebase functions:config:unset env
firebase functions:config:set env="$(cat ~/GitHub/firebase/TeamATC/client/functions/.env-strava-config.json)"
firebase deploy --only functions