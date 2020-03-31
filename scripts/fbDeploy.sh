cd ~/GitHub/firebase/TeamATC/client && npm run build
# Set Environment variables
firebase functions:config:set org="ATC" env="prod"
firebase deploy --project teamatc-challenge