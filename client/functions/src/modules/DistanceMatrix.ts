import {Client, DistanceMatrixRequest, DistanceMatrixResponse, DistanceMatrixRow, TravelMode, LatLng} from "@googlemaps/google-maps-services-js";
import { GOOGLE_API_KEY } from "./FirebaseEnvironment";

// ===============================================================================================
// Compute Distance using google distance-matrix
// ===============================================================================================
class DistanceMatrix {
    // console.log(`In fBFupdateTeam with: req ${JSON.stringify(req)}`);
    public calcDistanceMatrix(originArray: Array<string>, destinationArray:  Array<string>, travelMode: string) {
        // need to loop through each origin and calc distance sine the limit for one call is 10, this will allow as many as needed
        return new Promise(async (resolve, reject) => {
            console.log(`runnng calcDistanceMatrix with originArray ${originArray}, destinationArray: ${destinationArray}`);
            try {
                let totalDistance = 0;
                for (let originIdx=0; originIdx < originArray.length; originIdx++) {
                    for (let destinationIdx=0; destinationIdx< destinationArray.length; destinationIdx++) {
                        if (destinationIdx === originIdx) {
                            console.log(`runnng calcDistanceMatrix for one origin ${originArray[originIdx]}, destination: ${destinationArray[destinationIdx]}`);
                            const resDistance = await this.calcDistanceForOneWaypoint([originArray[originIdx]], [destinationArray[destinationIdx]], TravelMode.driving);
                            const distance: number = resDistance as number;
                            totalDistance += distance;
                            break;
                        }
                    }
                }
                resolve(totalDistance);
            } catch (err) {
                console.error(`Error creating distance matrix: ${err}, line: 26`);
                reject(`Error creating distance matrix: ${err}, line: 26`);    
            }
        }); // Promise
    }

    private calcDistanceForOneWaypoint(origins: LatLng[], destinations: LatLng[], travelMode: TravelMode) {
        return new Promise(async (resolve, reject) => {
            // NOTE: cant do more than 10 items at a time (9 waypoints + 1 start of end)
            console.log(`Calling client.distancematrix with origins: ${origins}, destinations: ${destinations}`);
            try {
                const client = new Client({});

                const distanceMatrixRequest:DistanceMatrixRequest = {
                    params: {
                        origins : origins,
                        destinations: destinations,
                        mode: TravelMode.driving,
                        key: GOOGLE_API_KEY
                    },
                };
    
                const res:DistanceMatrixResponse = await client.distancematrix(distanceMatrixRequest);
                if (res.data && res.data.status && res.data.status === "OK") {
                    console.log(`Created google distance matrix successful`);
                    const rows:Array<DistanceMatrixRow> = res.data.rows;
                    const distanceInMiles: number = rows[0].elements[0].distance.value / 1000 / 1.60934;
                    console.log(`total leg distance from ${res.data.origin_addresses[0]} to ${res.data.destination_addresses[0]} in miles: ${distanceInMiles}, in km: ${distanceInMiles * 1.60934}`);
                    resolve(distanceInMiles);
                } else {
                    console.log(`res.data: ${res.data ? JSON.stringify(res.data) : "no res.data"}, line: 56`);
                    console.error(`Error creating distance matrix: ${res.data.error_message ? res.data.error_message : "no error_message"}, line: 56`);
                    reject(`Error creating distance matrix: ${res.data.error_message ? res.data.error_message : "no error_message"}, line: 56`);    
                }
            } catch (err) {
                console.error(`Catch Error creating distance matrix ${err}, line: 61`);
                reject(`Error creating distance matrix ${err}, line: 61`);
            }
        }); // Promise

    }
    
    // private calculateMileage(rows: Array<DistanceMatrixRow> ): number {
    //     console.log("calculateMileage");
    //     console.log(JSON.stringify(rows));
    //     let totalDistance = 0;
    //     // Yu need to take the rowNbr for origin and rowNbr for destination element to get each leg
    //     // since I pass start+waypoints as origin and waypoints+end as destination
    //     let rowNumber = 0;
    //     rows.forEach(row => {
    //         const elements: Array<DistanceMatrixRowElement> = row.elements;
    //         for (let i=0; i< elements.length; i++) {
    //             let legIdx = rowNumber;
    //             if (i === legIdx) {
    //                 const distanceInKm: number = elements[i].distance.value / 1000;
    //                 console.log(`rowNumber: ${rowNumber} leg distance in km: ${distanceInKm}`)
    //                 const distanceInMiles: number = distanceInKm / 1.60934;
    //                 console.log(`rowNumber: ${rowNumber} leg distance in miles: ${distanceInMiles}`)
    //                 totalDistance += distanceInMiles;
    //                 break;
    //             }
    //         }
    //         rowNumber++;
    //     })
    //     return totalDistance;
    // }

    // private oldCalcDistanceMatrix(originArray: Array<string>, destinationArray:  Array<string>, travelMode: string) {
    //     return new Promise( (resolve, reject) => {
    //         const client = new Client({});

    //         const origins: Array<LatLng> = [originArray.join("|")];
    //         const destinations: Array<LatLng>  = [destinationArray.join("|")];
    
    //         const distanceMatrixRequest:DistanceMatrixRequest = {
    //             params: {
    //                 origins : origins,
    //                 destinations: destinations,
    //                 mode: TravelMode.driving,
    //                 key: GOOGLE_API_KEY
    //             },
    //         };

    //         // NOTE: cant do more than 10 items at a time (9 waypoints + 1 start of end)
    //         console.log(`Calling client.distancematrix(`);
    //         client.distancematrix(distanceMatrixRequest).then((res: DistanceMatrixResponse) => {
    //             if (res.data && res.data.status && res.data.status === "OK") {
    //                 console.log(`Created google distance matrix successful`);
    //                 const rows:Array<DistanceMatrixRow> = res.data.rows;
    //                 const distance = this.calculateMileage(rows);
    //                 console.log(`total route distance: ${distance}`);
    //                 resolve(distance);
    //             } else {
    //                 console.log(`res.data: ${res.data ? JSON.stringify(res.data) : "no res.data"}, line: 31`);
    //                 console.error(`Error creating distance matrix: ${res.data.error_message ? res.data.error_message : "no error_message"}, line: 32`);
    //                 reject(`Error creating distance matrix: ${res.data.error_message ? res.data.error_message : "no error_message"}, line: 32`);    
    //             }
    //         }).catch(err => {
    //             console.error(`Catch Error creating distance matrix ${err}, line: 36`);
    //             reject(`Error creating distance matrix ${err}, line: 36`);
    //         });
    //     }); // Promise
    // }

} // Class

export { DistanceMatrix };