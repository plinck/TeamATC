# Set Environment variables - no need - get from client

# copy prod env to ensure deplaying prod
cd ~/GitHub/firebase/TeamATC/client
cp .env-SAA .env
cp .firebaserc-SAA .firebaserc
cp functions/.serviceAccountKey-SAA.json functions/.serviceAccountKey.json
cp functions/.env-strava-config-SAA.json functions/.env-strava-config.json
cp ../bulkloader/.serviceAccountKey-SAA.json ../bulkloader/.serviceAccountKey.json
cp ../bulkloader/.env-strava-config-SAA.json ../bulkloader/.env-strava-config.json

firebase use saaclubchallenge