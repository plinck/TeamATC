// REDUX
import Util from "../Util/Util";

class ActivityListener {
    static activityListener = undefined;
    static activities = [];
    static perf = undefined;

    static createActivityListener = (challengeUid) => {
        return new Promise((resolve, reject) => {

            console.log(`Created activity listener with challengeUid: ${challengeUid}`);
            ActivityListener.perf = Util.getFirestorePerf();
            
            const traceCreateListener =  this.perf.trace('traceCreateListener');
            const traceFullRetrieval = this.perf.trace('traceFullRetrieval');
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
}

export default ActivityListener;