# Set Environment variables - no need - get from client

# copy ATC env to ensure deploying ATC
cd ~/GitHub/firebase/TeamATC/client
cp .env-ATC .env
cp .firebaserc-ATC .firebaserc
cp functions/.serviceAccountKey-ATC.json functions/.serviceAccountKey.json
cp functions/.env-strava-config-ATC.json functions/.env-strava-config.json
cp ../bulkloader/.serviceAccountKey-ATC.json ../bulkloader/.serviceAccountKey.json
cp ../bulkloader/.env-strava-config-ATC.json ../bulkloader/.env-strava-config.json

firebase use teamatc-challenge