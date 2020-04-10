# Set Environment variables - no need - get from client
# firebase functions:config:set environment.org="ATC" environment.env="dev"

# copy prod env to ensure deplaying prod
cd ~/GitHub/firebase/TeamATC/client
cp .env-prod .env
cp .firebaserc-prod .firebaserc
cp functions/.serviceAccountKey-prod.json functions/.serviceAccountKey.json

firebase use teamatc-challenge