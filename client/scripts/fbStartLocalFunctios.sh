cd functions
export GOOGLE_APPLICATION_CREDENTIALS=".serviceAccountKey.json"
firebase functions:config:unset env && firebase functions:config:set env="$(cat ~/GitHub/firebase/TeamATC/client/functions/.env-strava-config.json)"
firebase emulators:start --only functions