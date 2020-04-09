gcloud config set project teamatc-challenge

# Export all
#gcloud firestore export gs://teamatc-challenge.appspot.com/backups --async
#gcloud firestore export gs://teamatc-challenge.appspot.com/backups
gcloud firestore export gs://teamatc-challenge.appspot.com/backups --collection-ids=ATCMembers

