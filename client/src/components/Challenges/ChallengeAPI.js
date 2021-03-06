import Util from "../Util/Util";

class ChallengesAPI {

    static calcDistanceMatrix(origins, destinations) {
        return new Promise((resolve, reject) => {
            const firebase = Util.getFirebaseAuth();
            const calcDistanceMatrix = firebase.functions.httpsCallable('calcDistanceMatrix');
            const req = {origins : origins, destinations : destinations, travelMode: "DRIVING"};
            
            calcDistanceMatrix(req).then( (res) => {
                // Read result of the Cloud Function.
                console.log(`Success calcDistanceMatrix`);
                console.log(JSON.stringify(res));
                resolve(res);
            }).catch(err => {
                console.error(`${err}`);
                reject(err);
            });
        });
    }
}

export default ChallengesAPI;