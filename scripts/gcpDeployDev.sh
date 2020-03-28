cp ./client/.env.development.local ./client/.env
cp .env.development.local .env
cp app-dev.yaml app.yaml

cd client && npm run build && cd ..
gcloud config set project teamatc-challenge
gcloud app deploy --quiet