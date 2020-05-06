cd ~/GitHub/firebase/TeamATC/client
sudo npm run build
firebase functions:config:unset env
firebase functions:config:set env="$(cat ~/GitHub/firebase/TeamATC/client/functions/.env-strava-config.json)"
sudo firebase deploy --except functions