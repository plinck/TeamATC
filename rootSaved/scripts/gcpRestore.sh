gcloud config set project teamatc-challenge

# Import
#gcloud firestore import gs://teamatc-challenge.appspot.com/backup --collection-ids=users,activities,teams
gcloud firestore import gs://teamatc-challenge.appspot.com/backup --collection-ids=teams
