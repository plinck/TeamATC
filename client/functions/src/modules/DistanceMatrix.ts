import {Client, DistanceMatrixRequest, DistanceMatrixResponse, DistanceMatrixRow, DistanceMatrixRowElement, TravelMode, LatLng} from "@googlemaps/google-maps-services-js";
import { GOOGLE_API_KEY } from "./FirebaseEnvironment";

// ===============================================================================================
// Compute Distance using google distance-matrix
// ===============================================================================================
class DistanceMatrix {
    // console.log(`In fBFupdateTeam with: req ${JSON.stringify(req)}`);
    public calcDistanceMatrix(origins: LatLng[], destinations: LatLng[], travelMode: string) {
        return new Promise((resolve, reject) => {
            const client = new Client({});

            const distanceMatrixRequest:DistanceMatrixRequest = {
                params: {
                    origins : origins,
                    destinations: destinations,
                    mode: TravelMode.driving,
                    key: GOOGLE_API_KEY
                },
            };

            client.distancematrix(distanceMatrixRequest).then((res: DistanceMatrixResponse) => {
                if (res.data && res.data.status && res.data.status === "OK") {
                    console.log(`Created google distance matrix successful`);
                    const rows:Array<DistanceMatrixRow> = res.data.rows;
                    const elements: Array<DistanceMatrixRowElement> = res.data.rows && res.data.rows.length > 0 ? res.data.rows[0].elements : [];
                    console.log(rows);
                    console.log(elements);
                    resolve(res.data);
                } else {
                    console.error(`Error creating distance matrix: ${res.data.error_message}`);
                    reject(`Error creating distance matrix: ${res.data.error_message}`);    
                }
            }).catch(err => {
                console.error(`Error creating distance matrix ${err}`);
                reject(`Error creating distance matrix ${err}`);
            });
        }); // Promise
    }
} // Class

export { DistanceMatrix };