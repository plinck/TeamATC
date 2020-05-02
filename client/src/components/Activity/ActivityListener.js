// REDUX
import Util from "../Util/Util";

class ActivityListener {
    static activityListener = undefined;
    static activities = [];
    static perf = undefined;

    static createActivityListener = (challengeUid) => {
        this.perf = Util.getFirestorePerf();
        return new Promise((resolve, reject) => {

            console.log(`Created activity listener with challengeUid: ${challengeUid}`);
            ActivityListener.perf = Util.getFirestorePerf();
            
            const traceCreateListener =  this.perf.trace('traceCreateListenerFirestore');
            const traceFullRetrieval = this.perf.trace('traceFullRetrievalFirestore');
            const traceGetChanges = this.perf.trace('traceGetChanges');
            traceCreateListener.start();
            traceFullRetrieval.start();

            if (ActivityListener.activityListener) {
                ActivityListener.activityListener();
            }
        
            let allDBRefs = Util.getChallengeDependentRefs(challengeUid);
            const dbActivitiesRef = allDBRefs.dbActivitiesRef;

            let ref = dbActivitiesRef.orderBy("activityDateTime", "desc");
            ActivityListener.activityListener = ref.onSnapshot((querySnapshot) => {
                traceCreateListener.stop();

                traceGetChanges.start();
                querySnapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        let newActivity = change.doc.data();
                        newActivity.id = change.doc.id;
                        newActivity.activityDateTime = newActivity.activityDateTime.toDate();
                        ActivityListener.activities.push(newActivity);
                    }
                    if (change.type === "modified") {
                        let newActivity = change.doc.data();
                        newActivity.id = change.doc.id;
                        newActivity.activityDateTime = newActivity.activityDateTime.toDate();
                        ActivityListener.activities = ActivityListener.activities.filter(activity => {
                            if (newActivity.id === activity.id) {
                                console.log(`MODIFY_ACTIVITY name: ${newActivity.activityName}`);
                                return newActivity;
                            } else {
                                return activity;
                            }
                        });
                    }
                    if (change.type === "removed") {
                        // console.log(`Removed Activity: ${change.doc.id}`);
                        let deletedActivity = change.doc.data();
                        deletedActivity.id = change.doc.id;
                        deletedActivity.activityDateTime = deletedActivity.activityDateTime.toDate();
                        ActivityListener.activities.filter(activity => {
                            return activity.id !== deletedActivity.id;
                        });            
                    }
                });
                traceGetChanges.stop();
                traceFullRetrieval.incrementMetric('nbrActivities', ActivityListener.activities.length);
                traceFullRetrieval.stop();    
                resolve(ActivityListener.activities);
            }, (err) => {
                console.error(`Error attaching listener: ${err}`);
                reject(`Error attaching listener: ${err}`);
            }); // Create listener
        }); // Promise
    }

    static createRealtimeDBActivityListener(challengeUid) {
        this.perf = Util.getFirestorePerf();
        return new Promise((resolve, reject) => {
            const traceCreateListener =  this.perf.trace('traceCreateListenerRealtimeDB');
            const traceGetChanges = this.perf.trace('traceGetChangesRealtimeDB');
            traceCreateListener.start();
            let traceCreateListenerT1 = new Date();
    
            const realtimeDB = Util.getFirebaseRealtimeDB();
            let activityRef = realtimeDB.ref("ATC/prod/activities");

            activityRef.orderByChild('challengeUid').equalTo(challengeUid).once('value', (snapshot) => {
                traceCreateListener.stop();
                let traceCreateListenerT2 = new Date();
                let traceCreateListenerDiff = traceCreateListenerT2.getTime() - traceCreateListenerT1.getTime();
                console.log(`traceCreateListenerDiff time is milliseconds: ${traceCreateListenerDiff}`);
    
                traceGetChanges.start();
                snapshot.forEach(function(childSnapshot) {
                  let newActivity = childSnapshot.val();
                  newActivity.id = childSnapshot.key;
                  ActivityListener.activities.push(newActivity);
                });
                traceGetChanges.stop();
      
                resolve(ActivityListener.activities);
            }, (err) => {
                console.error(`Error gettng activities in listener: ${err}`);
                reject(`Error gettng activities in listener: ${err}`);
            });

            // activityRef.on('child_added', (data) => {
            //     let newActivity = data.val();
            //     newActivity.id = data.key;
            //     newActivity.activityDateTime = newActivity.activityDateTime.toDate();
            //     ActivityListener.activities.push(newActivity);
            //     resolve(ActivityListener.activities);
            // });

        }); // Promise

        // commentsRef.on('child_changed', function(data) {
        // setCommentValues(postElement, data.key, data.val().text, data.val().author);
        // });

        // commentsRef.on('child_removed', function(data) {
        // deleteComment(postElement, data.key);
        // });
    }
}

export default ActivityListener;