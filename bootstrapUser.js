"use strict";
const inquirer = require("inquirer");
let fs = require('fs');
const {ORG, ENV} = require("./ServerEnvironment");

require("dotenv");
const path = require("path");

// Need to use firebase admin to get at firebase stuff in node
const admin = require("firebase-admin");
const storageBucket = "teamatc-challenge.appspot.com";
const databaseURL = "https://teamatc-challenge.firebaseio.com";
let dbALLRefs = {};

class Util {

    static getDBRefs (challengeId) {
        if (!challengeId) {
          challengeId = "9uxEvhpHM2cqCcn1ESZg";
        }
        const db = admin.firestore();
    
        const dbUsersRef = db.collection(ORG).doc(ENV).collection(`users`);
        const dbATCMembersRef = db.collection(ORG).doc(ENV).collection(`ATCMembers`);
    
        const dbATCChallengeMemberRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeId).collection(`atcchallengemembers`);        
        const dbActivitiesRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeId).collection(`activities`);
        const dbTeamsRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeId).collection(`teams`);
    
        return {dbUsersRef: dbUsersRef,
          dbATCMembersRef: dbATCMembersRef,
          dbATCChallengeMemberRef: dbATCChallengeMemberRef,
          dbActivitiesRef: dbActivitiesRef,
          dbTeamsRef: dbTeamsRef
        }
    }
}    

class MemberInfo {

    static getName (nickName) {
        let firstName = "";
        let lastName = "";

        if (nickName.length < 1) {
            return {firstName: "NoFirstName", lastName: "noLastName"}
        }
        
        nickName = nickName.trim().toLowerCase();
        let nameArray = nickName.split(" ");
        if (nameArray.length >= 3) {
            if (nameArray[0].trim() === "lisa" && nameArray[1].trim() === "van") {
                firstName = "Elisabeth";
                lastName = "Van casteren";
            } else if (nameArray[0].trim() === "kona") {
                firstName = "Kona lisa";
                lastName = "Mahu";
            } else if (nameArray[0].trim() === "sheelah") {
                firstName = "Sheelah";
                lastName = "Cochran";
            } else if (nameArray[0].trim() === "nicole" && nameArray[1].trim() === "chittick") {
                firstName = "Nicole";
                lastName = "Chittick";
            }
        } else if (nameArray.length === 1) {
            if (nameArray[0].trim() === "nicole") {
                firstName = "Nicole";
                lastName = "Chittick";
            } else if (nameArray[0].trim() === "sprinkles") {
                firstName = "Charlie";
                lastName = "Holder";
            } else if (nameArray[0].trim() === "kona") {
                firstName = "Kona lisa";
                lastName = "Mahu";
            } else if (nameArray[0].trim() === "harold") {
                firstName = "Harold";
                lastName = "Waldrop";
            } else if (nameArray[0].trim() === "amit") {
                firstName = "Amit";
                lastName = "Patil";
            } else if (nameArray[0].trim() === "charlean") {
                firstName = "Charlean";
                lastName = "Parks";
            } else if (nameArray[0].trim() === "charlene") {
                firstName = "Charlene";
                lastName = "Gabriel";
            } else if (nameArray[0].trim() === "carolina") {
                firstName = "Carolina";
                lastName = "Pinheiro";
            } else if (nameArray[0].trim() === "tonytoson") {
                firstName = "Tony";
                lastName = "Toson";
            }

        } else {                        // 2 - a firstName and a lastName
            firstName = nameArray[0].trim();
            lastName = nameArray[1].trim();
            if (firstName === "steph") {
                firstName = "Stephanie";
            }
            if (firstName === "jennie") {
                firstName = "Jennifer";
                lastName = "McClellan";
            }
            if (firstName === "turd") {
                firstName = "Michelle";
                lastName = "Crossman";
            }
            if (firstName === "the" && lastName === "rahul") {
                firstName = "Rahul";
                lastName = "Mahesh";
            }
            if (firstName[0] === "a" && lastName === "monroe") {
                firstName = "Andre";
                lastName = "Monroe";
            }
            if (firstName === "dani") {
                firstName = "Danielle";
            }
            if (firstName === "gene") {
                firstName = "Eugene";
            }
            if (firstName === "carolina" && lastName === "p") {
                firstName = "Carolina";
                lastName = "Pinheiro";
            }
            if (nameArray[0].trim() === "sheelah") {
                firstName = "Sheelah";
                lastName = "Cochran";
            }
        }

        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1)
    
        return {
            firstName: firstName,
            lastName: lastName
        }
    }

    static getTeamName (brokenTeamName) {
        let teamName = brokenTeamName.trim();
        let teamNameArray = teamName.split(" ");
        teamName = teamNameArray[0].trim();
        // Fix people using plural of scottie
        if (teamName[teamName.length-1] === "s") {
            teamName = teamName.substring(0, teamName.length - 1);
        }
        if (teamName.length < 2 ) {
            teamName = "Scottie";           // Assume scottie if no name since susan miller forgot the namne abd she is on scottie
        } else {
            teamName = teamName.charAt(0).toUpperCase() + teamName.slice(1)
        }

        return teamName;
    }
}    

function exitProgram() {
    console.log("BYE!");
}

    // Add a single activity based on id
async function createActivity (activity) {
    const dbActivitiesRef = dbALLRefs.dbActivitiesRef;

    return new Promise((resolve, reject) => {
        dbActivitiesRef
            .add({
                activityDateTime: activity.activityDateTime,
                activityName: activity.activityName,
                activityType: activity.activityType,
                displayName: activity.displayName,
                distance: activity.distance,
                distanceUnits: activity.distanceUnits,
                duration: activity.duration ? activity.duration : 0,
                email: activity.email,
                teamName: activity.teamName,
                teamUid: activity.teamUid
                    ? activity.teamUid
                    : null,
                uid: activity.uid
            })
            .then((res) => {
                console.log("Firestore activity successfully added");
                return resolve(res);
            })
            .catch((error) => {
                console.error("Firestore activity add failed");
                return reject(error);
            });
    });
}


// Assume users create and up
async function createActivitiesFromGoogleDoc(fileToUpload) {
    const dbUsersRef = dbALLRefs.dbUsersRef;
    const dbTeamsRef = dbALLRefs.dbTeamsRef
    const dbATCMembersRef = dbALLRefs.dbATCMembersRef

    let ATCMembers = [];
    let nbrATCMembers = 0;
    let teams = [];
    let nbrTeams = 0;
    let totalBadAtivities = 0;


    if (!fileToUpload) {
        fileToUpload = "ATCActivities.csv";
    }
    console.log(`Uploading Activities from ${fileToUpload}`);
    let ChallengeActivities = [];
    
    // Get the ATC Members
    try {
        let allATCMembersSnapshot = await dbATCMembersRef.get();
        allATCMembersSnapshot.forEach(doc => {
            nbrATCMembers += 1;
            //console.log(doc.id, '=>', JSON.stringify(doc.data()));
            let ATCMember = doc.data();
            ATCMember.id = doc.id;
            ATCMembers.push(ATCMember)
        });
        console.log(`Found: ${nbrATCMembers} Members`);
    }
    catch (err) {
        console.error(`Error getting ATC Users: ${err}`);
        return
    }

    // Get teams
    try {
        let allteamsSnapshot = await dbTeamsRef.get();
        allteamsSnapshot.forEach(doc => {
            nbrTeams += 1;
            console.log(doc.id, '=>', JSON.stringify(doc.data()));
            let team = doc.data();
            team.id = doc.id;
            teams.push(team)
        });
        //console.log(`Found: ${nbrTeams} Teams`);
    }
    catch (err) {
        console.error(`Error getting ATC Users: ${err}`);
        return
    }
    
    // read  the file and parse
    if (fileToUpload) {
        fs.readFile(fileToUpload, 'utf8', (err, data) => {
                //
                if (err) throw err;
                console.log(`OK reading file`);

                let totalActivities = 0;
 
                //remove the quotes
                let fixedData = data.replace(/["]*/g, "");
                //console.log(`read ${fixedData} from file: ${fileToUpload}`);
                let lines = fixedData.split('\n');
                console.log(`read ${lines.length} lines of data from file: ${fileToUpload} line[0].length: ${lines[0].length}`);

                let logged = 0;
                ChallengeActivities = lines.map((line) => {
                    let activityFieldsArray = line.split(',');

                    let uselessDate = activityFieldsArray[0].trim();

                    let dateString = activityFieldsArray[2].trim();
                    let activityDateTime = new Date(dateString);
                    let displayName = activityFieldsArray[1].trim();
                    let displayNameArray = displayName.split(" ");
                    let firstName = displayNameArray[0];
                    let lastName = displayNameArray.length > 0 ? displayNameArray[1] : "X";
                    if (logged < 10) {
                        // console.log(`lastName: ${lastName}`);
                    }

                    let activityType = activityFieldsArray[3].trim();
                    let distance = Number(activityFieldsArray[4]);
                    let teamName = activityFieldsArray[5].trim();
                    let teamNameArray = teamName.split(" ");
                    teamName = teamNameArray[0].trim();
                    // Fix people using plural of scottie
                    if (teamName[teamName.length-1] === "s") {
                        teamName = teamName.substring(0, teamName.length - 1);
                    }

                    lastName = lastName && lastName.length >= 1 ? lastName.trim().toLowerCase() : " ";
                    firstName = firstName.trim().toLowerCase();

                    lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1)
                    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
                    activityType = activityType.charAt(0).toUpperCase() + activityType.slice(1)
                    teamName = teamName.charAt(0).toUpperCase() + teamName.slice(1)
                    let distanceUnits = activityType === "Swim" ? "Yards" : "Miles"

                    // See if valid ATCUser
                    let _foundMember = ATCMembers.find(member => {
                        if (member.firstName === firstName && member.lastName === lastName) {
                            return true
                        } else {
                            return false;
                        }
                    });
                    if (!_foundMember) {
                        //console.log(`Error in activity for member: ${firstName} ${lastName}, no valid ATC Member found in record: ${line}`);
                        totalBadAtivities += 1;
                        return false;
                    }
                    if (logged < 10) {
                        // console.log(`Found member : ${JSON.stringify(_foundMember)}`);
                    }
                    
                    let _foundTeam = teams.find(team => {
                        if ( team.name && team.name === teamName ) {
                            return true
                        } else {
                            return false;
                        }
                    });
                    if (!_foundTeam) {
                        totalBadAtivities += 1;
                        //console.log(`Error in activity for member: ${displayName} on Team: ${teamName} , no valid ATC Team with that name found`)
                        return false;
                    }
                    if (logged < 10) {
                        //console.log(`Found team : ${JSON.stringify(_foundTeam)}`);
                    }

                    let activityPosted = {
                        activityDateTime: activityDateTime,
                        activityType: activityType,
                        displayName: displayName,
                        distance: distance,
                        distanceUnits: distanceUnits,
                        firstName: firstName,
                        lastName: lastName,

                        email: _foundMember.email,

                        teamUid: _foundTeam.id,
                        teamName: _foundTeam.name,
                    }
                    if (logged < 10) {
                        // console.log(`Line: ${line}, activity: ${activityFieldsArray}`);
                        //console.log(`Activity Posted: ${JSON.stringify(activityPosted)}`);
                        logged += 1;
                    }

                    totalActivities += 1;
    
                    return (activityPosted);
                });

                // filter out bad records
                ChallengeActivities = ChallengeActivities.filter( activity => {
                    if (activity) {
                        return activity;
                    }
                });

                console.log(`Found: ${totalActivities} valid activities, ${totalBadAtivities}`)

                // Now, I need to create the activities
                for (let i = 0; i < ChallengeActivities.length; i++) {
                    if (true) {
                        let activity = ChallengeActivities[i];
                        // no name in google doc so make up one
                        activity.activityName = activity.activityType;
                        let foundUser = false;
                        let user = {};
                        // need to get uid from user based on email
                        let docRef = dbUsersRef.where("email", "==", activity.email.toLowerCase()).limit(1);
                        docRef.get().then((querySnapshot) => {
                            querySnapshot.forEach(doc => {
                                foundUser = true;
                                user = doc.data();
                                user.id = doc.id;
                            });
            
                            if (foundUser) {
                                console.log(`User with email: ${user.email} found!, displayName: ${user.displayName}`);
                                activity.uid = user.id;
                                createActivity(activity).then(res => {
                                    // worked
                                        console.log(`Created Activity in createActivitiesFromGoogleDoc: ${res}`);
                                     }).catch(err => {
                                        console.error(`Error Creating Activity in createActivitiesFromGoogleDoc: ${activity}`);
                                    });                  
        
                            } else {
                                user.err = `User with email: ${activity.email} not found in firestore`;
                                console.log(user.err);
                            }
                        }).catch(err => {
                            console.error(`Error getting user ${err.message}`);
                        });
                    }
                }
            }); //fs.read
    }
}
// Copy Users from current location to DEV
async function createUsersFromGoogleActivities(fileToUpload) {
    const dbTeamsRef = dbALLRefs.dbTeamsRef
    const dbATCMembersRef = dbALLRefs.dbATCMembersRef
    
    // First Read and Parse All from ATC CSV file to grab participating users
    if (!fileToUpload) {
        fileToUpload = "ATCActivities.csv";
    }
    console.log(`Matching Challenge Users to Members and then users from ${fileToUpload}`);

    let ATCMembers = [];
    let nbrATCMembers = 0;
    let teams = [];
    let nbrTeams = 0;
    let totalBadAtivities = 0;

    // Get the ATC Members
    try {
        let allATCMembersSnapshot = await dbATCMembersRef.get();
        allATCMembersSnapshot.forEach(doc => {
            nbrATCMembers += 1;
            //console.log(doc.id, '=>', JSON.stringify(doc.data()));
            let ATCMember = doc.data();
            ATCMember.id = doc.id;
            ATCMembers.push(ATCMember)
        });
        console.log(`Found: ${nbrATCMembers} Members`);
    }
    catch (err) {
        console.error(`Error getting ATC Users: ${err}`);
        return
    }

    // Get teams
    try {
        let allteamsSnapshot = await dbTeamsRef.get();
        allteamsSnapshot.forEach(doc => {
            nbrTeams += 1;
            console.log(doc.id, '=>', JSON.stringify(doc.data()));
            let team = doc.data();
            team.id = doc.id;
            teams.push(team)
        });
        console.log(`Found: ${nbrTeams} Teams`);
    }
    catch (err) {
        console.error(`Error getting ATC Users: ${err}`);
        return
    }

    let ChallengeMembersAlreadyExists = [];
    let ChallengeMembers = [];
    let ChallengeActivities = [];
        
    // read  the file and parse
    if (fileToUpload) {
        fs.readFile(fileToUpload, 'utf8', (err, data) => {
                //
                if (err) throw err;
                console.log(`OK reading file`);

                let totalActivities = 0;
                let totalMembers = 0;
 
                //remove the quotes
                let fixedData = data.replace(/["]*/g, "");
                //console.log(`read ${fixedData} from file: ${fileToUpload}`);
                let lines = fixedData.split('\n');
                console.log(`read ${lines.length} lines of data from file: ${fileToUpload} line[0].length: ${lines[0].length}`);
                // 1/15/2020 10:00:53,Laurie Nicholson,1/15/2020,Run,3.4,Rahuligan,Miles (Bike and Run)

                let logged = 0;
                ChallengeActivities = lines.map((line) => {
                    let activityFieldsArray = line.split(',');

                    let uselessDate = activityFieldsArray[0].trim();

                    let dateString = activityFieldsArray[2].trim();
                    let activityDateTime = new Date(dateString);

                    // Fix the name to get proper firstname lastname to match ATC Database
                    let fullName = MemberInfo.getName(activityFieldsArray[1]);
                    let firstName = fullName.firstName;
                    let lastName = fullName.lastName;
                    let displayName = `${firstName} ${lastName}`
                
                    // Fix the team name to get match to Database
                    let teamName = MemberInfo.getTeamName(activityFieldsArray[5]);
                    
                    let activityType = activityFieldsArray[3].trim();
                    let distance = Number(activityFieldsArray[4]);
                    
                    activityType = activityType.charAt(0).toUpperCase() + activityType.slice(1)
                    let distanceUnits = activityType === "Swim" ? "Yards" : "Miles"

                    // See if valid ATCUser
                    let _foundMember = ATCMembers.find(member => {
                        if (member.firstName.toLowerCase() === firstName.toLowerCase() && member.lastName.toLowerCase() === lastName.toLowerCase()) {
                            return true
                        } else {
                            return false;
                        }
                    });
                    if (!_foundMember) {
                        console.log(`Error in activity for member: ${firstName} ${lastName}, no valid ATC Member found in record: ${line}`);
                        totalBadAtivities += 1;
                        return false;
                    }
                    
                    let _foundTeam = teams.find(team => {
                        if ( team.name.toLowerCase() && team.name.toLowerCase() === teamName.toLowerCase() ) {
                            return true
                        } else {
                            return false;
                        }
                    });
                    if (!_foundTeam) {
                        totalBadAtivities += 1;
                        console.log(`Error in activity for member: ${displayName} on Team: ${teamName} , no valid ATC Team with that name found`)
                        return false;
                    }

                    let activityPosted = {
                        activityDateTime: activityDateTime,
                        activityType: activityType,
                        displayName: displayName,
                        distance: distance,
                        distanceUnits: distanceUnits,
                        firstName: firstName,
                        lastName: lastName,

                        email: _foundMember.email,

                        teamUid: _foundTeam.id,
                        teamName: _foundTeam.name,
                    }
                    if (logged < 10) {
                        // console.log(`Line: ${line}, activity: ${activityFieldsArray}`);
                        //console.log(`Activity Posted: ${JSON.stringify(activityPosted)}`);
                        logged += 1;
                    }

                    totalActivities += 1;
    
                    return (activityPosted);
                });

                // filter out bad records
                ChallengeActivities = ChallengeActivities.filter( activity => {
                    if (activity) {
                        return activity;
                    }
                });

                for (let i = 0; i < ChallengeActivities.length; i++) {
                    if (!ChallengeActivities[i]) {
                        console.log(`Bad activity at index: ${i}`);
                        continue;
                    }
                    if (ChallengeMembersAlreadyExists[ChallengeActivities[i].displayName]) {
                        continue;
                    } else {
                        
                        ChallengeMembersAlreadyExists[ChallengeActivities[i].displayName] = true;
                        let member = {
                            displayName: ChallengeActivities[i].displayName,
                            distanceUnits: ChallengeActivities[i].distanceUnits,
                            firstName: ChallengeActivities[i].firstName,
                            lastName: ChallengeActivities[i].lastName,

                            email:ChallengeActivities[i].email,
                            phoneNumber: "",
                            photoURL: "",
                            teamUid: ChallengeActivities[i].teamUid,
                            teamName: ChallengeActivities[i].teamName,
                        }

                        ChallengeMembers.push(member);
                        totalMembers += 1;

                        //console.log(`Unique Member: ${JSON.stringify(member)}`);
                    }
                }
                console.log(`Found: ${totalActivities} valid activities, ${totalBadAtivities}, Challenge Members: ${totalMembers}`)

                // Now, I need to creeate the users and then add the acivities
                for (let i = 0; i < ChallengeMembers.length; i++) {
                    if (true) {
                            let user = ChallengeMembers[i];
                            let authUser = {};
                            user.password = undefined;
                            admin.auth().getUserByEmail(user.email).then((authUser) => {
                                // User found.
                                // console.log(`Found authUser: ${JSON.stringify(authUser, null, 4)}`);
                                user.uid = authUser.uid;
                                createFirestoreUserBootstrap(user).then (newUser => {
                                    // console.log(`Creating User in createFirestoreUserBootstrap: ${user}, newUser: ${newUser}`);
                                }).catch(err => {
                                    console.error(`Error Creating User in createFirestoreUserBootstrap: ${user}`);
                                });  

                            }).catch(function(error) {
                                //console.log("Error fetching auth user data:", error);
                                createAuthUserBootstrap(user).then(authUser => {
                                    //console.log(`Created authUser: ${JSON.stringify(authUser, null, 4)}`);
                                    user.uid = authUser.uid;
                                    createFirestoreUserBootstrap(user).then (newUser => {
                                        // Now update claims for a user - I dont think I acutaull need to do this
                                        // setAuthClaimsAsUser(authUser.uid, newClaims).then ( () => {
                                        //     // claims successful
                                        //     console.log(`Successfully Creating User in setAuthClaimsAsUser: ${user}`);
                                        // }).catch(err => {
                                        //     console.error(`Error Creating User in setAuthClaimsAsUser: ${user}`);
                                        // });                
                                    }).catch(err => {
                                        console.error(`Error Creating User in createFirestoreUserBootstrap: ${user}`);
                                    });  
                                });                                 
                            }).catch(err => {
                                if (err.code == "auth/email-already-exists") {
                                    // its OK if already exists sine I just created it
                                    console.error(`Auth User already exists ${err}`);                                    
                                } else {
                                    console.error(`Error Creating User in createAuthUserBootstrap: ${err}`);
                                }
                            });
                    }
                }
            }); //fs.read
    }
}


// Copy Users from current location to DEV
async function copyUsersToDev() {
    const dbUsersRef = dbALLRefs.dbUsersRef;
    const dbTeamsRef = dbALLRefs.dbTeamsRef
    const dbATCMembersRef = dbALLRefs.dbATCMembersRef
    const dbActivitiesRef = dbALLRefs.dbActivitiesRef
    const dbATCChallengeMemberRef = dbALLRefs.dbATCChallengeMemberRef

    console.log(`Copying users from ${dbCollSource} to ${dbCollDest}`);
    return new Promise(async (resolve, reject) => {

        return new Promise((resolve, reject) => {
            dbUsersRef
                .get()
                .then(querySnapshot => {
                    let users = [];
                    querySnapshot.forEach(doc => {
                        let user = {};
                        user = doc.data();
                        user.id = doc.id;
                        users.push(user);

                        // Now create the user with same ID
                        console.log(`User retrieved, user=${JSON.stringify(user)}`);
                        dbUsersRef
                            .doc(user.id)
                            .set(user)
                            .then(user => {
                                //console.log(`Updated user ${JSON.stringify(user)}`);
                                resolve(user);
                            })
                            .catch(err => {
                                console.error(`error updating user: ${err}`);
                                reject(err);
                            });
                    });
                });
            return resolve();
        }).catch(err => {
            reject(err);
        });
    });
}

async function deleteATCMembers() {
    const dbUsersRef = dbALLRefs.dbUsersRef;
    const dbTeamsRef = dbALLRefs.dbTeamsRef
    const dbATCMembersRef = dbALLRefs.dbATCMembersRef
    const dbActivitiesRef = dbALLRefs.dbActivitiesRef
    const dbATCChallengeMemberRef = dbALLRefs.dbATCChallengeMemberRef

    dbATCMembersRef.listDocuments().then(val => {
        val.map((val) => {
            val.delete()
        })
    })

}

// Copy Users from current location to DEV
async function uploadATCMembers(fileToUpload) {
    const dbUsersRef = dbALLRefs.dbUsersRef;
    const dbTeamsRef = dbALLRefs.dbTeamsRef
    const dbATCMembersRef = dbALLRefs.dbATCMembersRef
    const dbActivitiesRef = dbALLRefs.dbActivitiesRef
    const dbATCChallengeMemberRef = dbALLRefs.dbATCChallengeMemberRef

    if (!fileToUpload) {
        fileToUpload = "ATCMembers.csv";
    }
    console.log(`Uploading ATC users from ${fileToUpload}`);

    // read  the file and parse
    let ATCMembers = [];

    if (fileToUpload) {
        fs.readFile(fileToUpload, 'utf8', (err, data) => {
            if (err) throw err;
            console.log(`OK reading file`);

            //remove the quotes
            let fixedData = data.replace(/["]*/g, "");
            let lines = fixedData.split('\n');

            ATCMembers = lines.map((line) => {
                let memberArray = line.split(',');
                let lastName = memberArray[0].trim().toLowerCase();
                let firstName = memberArray[1].trim().toLowerCase();
                let email = memberArray[2].trim();

                lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1)
                firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

                let member = {
                    lastName: lastName,
                    firstName: firstName,
                    email: email
                };
                //console.log(`Member: ${JSON.stringify(member)}`); 
                return (member);
            });

            let _ = ATCMembers.map((member) => {
                console.log(`Trying to update ${JSON.stringify(member)}`);

                // use email address as key to overwrite duplicates
                dbATCMembersRef
                    .doc(member.email)
                    .set(member)
                    .then(memberId => {
                        console.log(
                            `Updated member ${JSON.stringify(member)} with id: ${memberId}`
                        );
                    })
                    .catch(err => {
                        console.error(`error updating user: ${err}`);
                    });
            });
        }); // MAP
    }
}


// update claims from auth into FB
function updateClaimsInFirestore(uid, claims, authClaims) {
    const dbUsersRef = dbALLRefs.dbUsersRef;
    const dbTeamsRef = dbALLRefs.dbTeamsRef
    const dbATCMembersRef = dbALLRefs.dbATCMembersRef
    const dbActivitiesRef = dbALLRefs.dbActivitiesRef
    const dbATCChallengeMemberRef = dbALLRefs.dbATCChallengeMemberRef

    return new Promise(async (resolve, reject) => {

        // Init claims for primary since you can be multiple
        let updateFields = {
            claims: claims
        };

        // Only *set* claims passed
        if (authClaims && authClaims.admin != null)
            updateFields.isAdmin = authClaims.admin;
        if (authClaims && authClaims.teamLead != null)
            updateFields.isTeamLead = authClaims.teamLead;
        if (authClaims && authClaims.moderator != null)
            updateFields.isModerator = authClaims.moderator;
        if (authClaims && authClaims.user != null)
            updateFields.isUser = authClaims.user;

        // update claims
        dbUsersRef
            .doc(uid)
            .set(updateFields, {
                merge: true
            })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error(`Error updating claims ${err}`);
                reject(err);
            });
    });
}

// Set csutom claim without overrding other claim
function setAuthClaims(uid, customClaims) {
    return new Promise(async (resolve, reject) => {
        // The name is the *primary* role as someone can be admin and moderator for example
        if (customClaims.admin) {
            customClaims.name = "admin";
        } else if (customClaims.teamLead) {
            customClaims.name = "teamLead";
        } else if (customClaims.moderator) {
            customClaims.name = "moderator";
        } else if (customClaims.user) {
            customClaims.name = "user";
        } else {
            v.name = "noclaims";
        }

        admin
            .auth()
            .setCustomUserClaims(uid, customClaims)
            .then(() => {
                resolve(customClaims);
            })
            .catch(err => {
                console.error("Error updating claims in AuthUserAPI", err);
                resolve(customClaims);
            });
    }); // promise
}

async function setAuthAndFBClaims(uid) {
    return new Promise(async (resolve, reject) => {
        // Now, set custom claims
        setAuthClaims(uid, {
                admin: true,
                teamLead: true,
                moderator: true,
                user: true
            })
            .then(async newClaims => {
                await updateClaimsInFirestore(uid, newClaims.name, newClaims);
                resolve();
            })
            .catch(err => {
                // catch all error
                console.error(
                    `Error caught in route app.post("/api/auth/setTeamLead..." ${err}`
                );
                reject(err);
            });
    });
}
async function setAuthClaimsAsUser(uid) {
    return new Promise(async (resolve, reject) => {
        // Now, set custom claims
        setAuthClaims(uid, {
                admin: false,
                teamLead: false,
                moderator: false,
                user: true
            })
            .then(async newClaims => {
                await updateClaimsInFirestore(uid, newClaims.name, newClaims);
                resolve();
            })
            .catch(err => {
                // catch all error
                console.error(
                    `Error caught in route app.post("/api/auth/setTeamLead..." ${err}`
                );
                reject(err);
            });
    });
}

async function createFirestoreUserBootstrap(user) {
    const dbUsersRef = dbALLRefs.dbUsersRef;
    const dbTeamsRef = dbALLRefs.dbTeamsRef
    const dbATCMembersRef = dbALLRefs.dbATCMembersRef
    const dbActivitiesRef = dbALLRefs.dbActivitiesRef
    const dbATCChallengeMemberRef = dbALLRefs.dbATCChallengeMemberRef

    //console.log(`trying to update user in fb: ${user}`);
    return new Promise(async (resolve, reject) => {
        // update
        // console.log("User updated, user=", user);
        dbUsersRef.doc(user.uid)
            .set({
                firstName: user.firstName,
                lastName: user.lastName,
                displayName: `${user.firstName} ${user.lastName}`,
                phoneNumber: user.phoneNumber,
                email: user.email,
                photoURL: user.photoURL ? user.photoURL : "",
                teamUid: user.teamUid ? user.teamUid : "",
                teamName: user.teamName ? user.teamName : ""
            }, {
                merge: true
            })
            .then(user => {
                //console.log(`Updated user to: ${JSON.stringify(user)}`);
                resolve(user);
            })
            .catch(err => {
                console.error(`error updating user: ${err}`);
                reject(err);
            });
    });
}

// Route for Creating a new user with email and password
function createAuthUserBootstrap(user) {
    // console.log(`trying to createAuthUserBootstrap: ${JSON.stringify(user, null, 2)}`);
    // Generate random password if no password exists (meaning its created by someone else)
    if (!user.password || user.password === null || user.password === "") {
        let randomPassword = Math.random().toString(36).slice(-8);
        user.password = randomPassword;
    }
    
    return new Promise(async (resolve, reject) => {
        // Create auth user
        admin.auth().createUser({
                email: user.email,
                emailVerified: true,
                password: user.password,
                displayName: `${user.firstName} ${user.lastName}`,
                disabled: false
            }).then(authUser => {
                // console.log("Successfully added auth user");
                resolve(authUser);
            }).catch(err => {
                console.error("Error creating auth user:", err);
                reject(err);
            });
    });
}

async function showUsers() {
    console.log(`user: ${JSON.stringify(user, null, 4)}`);
}

async function seedDatabase() {
    let user = {
        uid: null,
        email: "paull@linck.net",
        password: "123456",
        firstName: "Paul",
        lastName: "LinckNET",
        phoneNumber: "404-687-1115",
        photoURL: "",
        disabled: false
    };

    const question = [{
            name: "email",
            message: "\nEmail Address?",
            validate: value => value !== ""
        },
        {
            name: "password",
            message: "Pssword?",
            validate: value => value !== "" && value.length >= 6
        },
        {
            name: "firstName",
            message: "\nFirst Name?",
            validate: value => value !== ""
        },
        {
            name: "lastName",
            message: "Last Name?",
            validate: value => value !== ""
        }
    ];

    let answer = await inquirer.prompt(question);

    user.email = answer.email;
    user.password = answer.password;
    user.firstName = answer.firstName;
    user.lastName = answer.lastName;

    console.log(`user: ${JSON.stringify(user, null, 4)}`);

    let authUser = await createAuthUserBootstrap(user);
    //console.log(`Created authUser: ${JSON.stringify(authUser, null, 4)}`);

    user.uid = authUser.uid;
    let newUser = await createFirestoreUserBootstrap(user);

    await setAuthAndFBClaims(authUser.uid, user);

    exitProgram();
    return;
}

// Main menu
function mainMenu() {
    const menuItems = {
        seed: seedDatabase,
        deleteATCMembers: deleteATCMembers,
        uploadATCMembers: uploadATCMembers,
        createUsersFromGoogleActivities: createUsersFromGoogleActivities,
        createActivitiesFromGoogleDoc: createActivitiesFromGoogleDoc,
        copyUsersToDev: copyUsersToDev,
        QUIT: exitProgram
    };

    const question = {
        type: "list",
        name: "mainMenu",
        message: "\n\nWhat view do you want?",
        choices: Object.keys(menuItems)
    };

    inquirer.prompt(question).then(answer => {
        menuItems[answer.mainMenu]();
    });
}

// START
const serviceAccount = require(path.join(
    __dirname,
    "./.serviceAccountKeyBootstrap.json"
));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL,
    storageBucket: storageBucket
});
dbALLRefs = Util.getDBRefs();

mainMenu();