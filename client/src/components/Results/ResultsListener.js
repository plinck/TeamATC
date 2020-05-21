// REDUX
import Util from "../Util/Util";

class ResultsListener {
    static resultslistener = undefined;
    static results = [];
    static perf = undefined;

    static createResultsListener = (challengeUid) => {
        this.perf = Util.getFirestorePerf();
        return new Promise((resolve, reject) => {

            console.log(`Created result listener with challengeUid: ${challengeUid}`);
            ResultsListener.perf = Util.getFirestorePerf();
            
            const traceFullResultsFirestore = this.perf.trace('traceFullResultsFirestore');;
            const traceGetResultsChanges = this.perf.trace('traceGetResultsChanges');

            if (ResultsListener.resultslistener) {
                ResultsListener.resultslistener();
            }
        
            let allDBRefs = Util.getChallengeDependentRefs(challengeUid);
            const dbResultsRef = allDBRefs.dbResultsRef;

            let ref = dbResultsRef.orderBy("resultDateTime", "desc");
            try {
                traceFullResultsFirestore.start();
            } catch {
                console.error("traceFullResultsFirestore not started ...")
            }

            ResultsListener.results = [];
            ResultsListener.resultslistener = ref.onSnapshot((querySnapshot) => {
                try {
                    traceGetResultsChanges.start();
                } catch {
                    console.error("traceGetResultsChanges not started ...")
                }
    
                querySnapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        let newResult = change.doc.data();
                        newResult.id = change.doc.id;
                        newResult.resultDateTime = newResult.resultDateTime.toDate();
                        ResultsListener.results.push(newResult);
                    }
                    if (change.type === "modified") {
                        let newResult = change.doc.data();
                        newResult.id = change.doc.id;
                        newResult.resultDateTime = newResult.resultDateTime.toDate();
                        ResultsListener.results = ResultsListener.results.filter(result => {
                            if (newResult.id === result.id) {
                                return newResult;
                            } else {
                                return result;
                            }
                        });
                    }
                    if (change.type === "removed") {
                        // console.log(`Removed Result: ${change.doc.id}`);
                        let deletedResult = change.doc.data();
                        deletedResult.id = change.doc.id;
                        deletedResult.resultDateTime = deletedResult.resultDateTime.toDate();
                        ResultsListener.results.filter(result => {
                            return result.id !== deletedResult.id;
                        });            
                    }
                });
                try {
                    traceGetResultsChanges.stop();
                } catch {
                    //
                }

                try {
                    traceFullResultsFirestore.incrementMetric('nbrResults', ResultsListener.results.length);
                    traceFullResultsFirestore.stop();    
                } catch {
                    //
                }

                resolve(ResultsListener.results);
            }, (err) => {
                console.error(`Error attaching listener: ${err}`);
                reject(`Error attaching listener: ${err}`);
            }); // Create listener
        }); // Promise
    }
}

export default ResultsListener;