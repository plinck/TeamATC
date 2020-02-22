cd client && npm run build && cd ..
gcloud config set project teamatc-challenge
gcloud app deploy --quiet
