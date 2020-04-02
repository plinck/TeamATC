# Set Environment variables - no need - get from client
# firebase functions:config:set environment.org="ATC" environment.env="dev"

# copy prod env to ensure deplaying prod
cp ~/GitHub/firebase/TeamATC/client/.env.prod ~/GitHub/firebase/TeamATC/client/.env
cd ~/GitHub/firebase/TeamATC/client && npm run build
firebase deploy --project teamatc-challenge