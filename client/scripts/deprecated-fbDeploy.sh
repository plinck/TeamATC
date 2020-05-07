# Set Environment variables - no need - get from client

# copy prod env to ensure deplaying prod
cd ~/GitHub/firebase/TeamATC/client
sudo npm run build
firebase functions:config:unset env
firebase functions:config:set env="$(cat ~/GitHub/firebase/TeamATC/client/functions/.env-strava-config.json)"
#sudo is needed if permissions / ownership ins messed up in repo =- use chown to fix
#sudo firebase deploy
firebase deploy