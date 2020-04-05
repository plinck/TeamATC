import Firebase from "../Auth/Firebase/Firebase.js";
import Session from "../Util/Session.js";

// ================================================================================================
// CLOUD STORAGE CALLS
// ================================================================================================
// upload file to firebase cloud storage
class Photo {

    static uploadPhoto(file, uploadTag) {
        // Create Promise for async call
        return new Promise((resolve, reject) => {
            const uid = Session.user.id;
            const fb = new Firebase();

            let folderRef = fb.storage.ref(`/ATC/${uid}/${uploadTag}`);
            // Create a unique file name
            const fileName = (+new Date()) + "-" + file.name;
            let photoObj = {};
            photoObj.fileName = fileName;

            const metadata = {
                contentType: file.type
            };
            // Create a reference to file
            var photoRef = folderRef.child(fileName);
            const task = photoRef.put(file, metadata);

            task.then(snapshot => {
                // console.log(`${snapshot}`);
                console.log("Uploaded a blob or file!");
                snapshot.ref.getDownloadURL().then(url => {
                    photoObj.url = url;
                    // MUST Save full object path in filename so we can find it for deletion
                    // aka this is the google cloud object name not really the "file" name
                    photoObj.fileName = snapshot.metadata.fullPath;
                    console.log(photoObj);
                    return resolve(photoObj);
                });
            }).catch(err => {
                return reject(err);
            });
        });
    }

    static deletePhoto(fileName) {
        // Create Promise for async call
        return new Promise((resolve, reject) => {
            const fb = new Firebase();
            // Create a storage reference from our storage service

            if (!fileName || fileName === "") {
                resolve();
            }

            let folderRef = fb.storage.ref(fileName);
            // Delete the file
            folderRef.delete().then(() => {
                resolve();
            }).catch( err => {
                resolve();
            });
  
        }); //PROMISE
    }
}

export default Photo;