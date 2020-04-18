# Set Environment variables - no need - get from client

# copy prod env to ensure deplaying prod
cd ~/GitHub/firebase/TeamATC/client
cp .env-dev-project .env
cp .firebaserc-dev-project .firebaserc
cp functions/.serviceAccountKey-dev-project.json functions/.serviceAccountKey.json
cp functions/.env-strava-config-dev-project.json functions/.env-strava-config.json
#firebase login paul@msporttech.com
firebase use triclubchallengedev