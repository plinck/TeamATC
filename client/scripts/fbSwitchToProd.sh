# Set Environment variables - no need - get from client

# copy prod env to ensure deplaying prod
cd ~/GitHub/firebase/TeamATC/client
cp .env-prod .env
cp .firebaserc-prod .firebaserc
cp functions/.serviceAccountKey-prod.json functions/.serviceAccountKey.json
cp functions/.env-strava-config-prod.json functions/.env-strava-config.json

firebase use teamatc-challenge