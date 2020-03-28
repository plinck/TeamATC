cp ./client/.env.production.local ./client/.env
cp .env.production.local .env
cp app-prod.yaml app.yaml

cd client && npm run build && cd ..
gcloud config set project teamatc-challenge
gcloud app deploy --quiet
