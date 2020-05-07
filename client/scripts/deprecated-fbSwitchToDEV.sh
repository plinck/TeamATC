# Set Environment variables - no need - get from client

# copy DEV env to ensure deplaying DEV
cd ~/GitHub/firebase/TeamATC/client
cp .env-DEV .env
cp .firebaserc-DEV .firebaserc
cp functions/.serviceAccountKey-DEV.json functions/.serviceAccountKey.json
cp functions/.env-strava-config-DEV.json functions/.env-strava-config.json
cp ../bulkloader/.serviceAccountKey-DEV.json ../bulkloader/.serviceAccountKey.json
cp ../bulkloader/.env-strava-config-DEV.json ../bulkloader/.env-strava-config.json
#firebase login paul@msporttech.com
firebase use triclubchallengedev