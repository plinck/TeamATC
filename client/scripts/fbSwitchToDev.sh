# Set Environment variables - no need - get from client
# firebase functions:config:set environment.org="ATC" environment.env="dev"

# copy prod env to ensure deplaying prod
cd ~/GitHub/firebase/TeamATC/client
cp .env-dev-project .env
cp .firebaserc-dev-project .firebaserc
cp functions/.serviceAccountKey-dev-project.json functions/.serviceAccountKey.json
#firebase login paul@msporttech.com
firebase use triclubchallengedev