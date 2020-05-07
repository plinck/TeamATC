const Util = require("./Util.js");
const SAACHALLENGE = "gjS1mgcnjGOOmbH51vuK";
let fs = require('fs');
const admin = require("./authServerCommon");

class Users {

    static updateAll () {
        let nbrUsers= 0;
        let users = [];

        return new Promise((resolve, reject) => {
            const allRefs = Util.getBaseDBRefs()
            const challengeUid = allRefs.challengeUid;

            const dbUsersRef = allRefs.dbUsersRef;
            dbUsersRef.get().then (snapshot => {
                snapshot.forEach(doc => {
                    nbrUsers += 1;
                    //console.log(doc.id, '=>', JSON.stringify(doc.data()));
                    let user = doc.data();
                    user.id = doc.id;
                    users.push(user)
                }); 
                return (users);
            }).then (users => {
                users.forEach (user => {
                    dbUsersRef.doc(user.id).set({challengeUid: challengeUid, teamUid: "", teamName: ""}, {merge: true}).then ( () => {
                        //console.log(`Updated user : ${JSON.stringify(user, null, 2)}`);
                    }).catch (err =>  {
                        console.error(`Error updating User: ${user.displayName} with error ${err}`);
                        throw Error(`Error updating User: ${user.displayName} with error ${err}`);
                    });
                })
                resolve(nbrUsers);
            }).catch (err =>  {
                console.error(`Error getting  Users: ${err}`);
                reject(`Error getting  Users: ${err}`);
            });
        }); // Promist
    }

    static uploadSAAMembers(fileToUpload) {
        const allRefs = Util.getBaseDBRefs()
        const dbATCMembersRef = allRefs.dbATCMembersRef
    
        if (!fileToUpload) {
            fileToUpload = "SAAUsers.csv";
        }
        console.log(`Uploading users from ${fileToUpload}`);
    
        // read  the file and parse
        let SAAMembers = [];
    
        if (fileToUpload) {
            fs.readFile(fileToUpload, 'utf8', (err, data) => {
                if (err) throw err;
                console.log(`OK reading file`);
    
                //remove the quotes
                let fixedData = data.replace(/["]*/g, "");
                let lines = fixedData.split('\n');
    
                SAAMembers = lines.map((line) => {
                    let memberArray = line.split(',');
                    let firstName = memberArray[0].trim().toLowerCase();
                    let lastName = memberArray[1].trim().toLowerCase();
                    let email = memberArray[2].trim().toLowerCase();
                    let password = memberArray.length > 3 ? memberArray[3].trim() : "";
                    let teamName = memberArray.length > 4 ? memberArray[4].trim() : "";

                    lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1)
                    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
    
                    let member = {
                        lastName: lastName,
                        firstName: firstName,
                        email: email,
                        password: password,
                        teamName: teamName
                    };
                    //console.log(`Member: ${JSON.stringify(member)}`); 
                    return (member);
                });
    
                let _ = SAAMembers.map((member) => {
                    // console.log(`Trying to update ${JSON.stringify(member)}`);
                    let newMember = member;
                    try {
                        delete newMember.password;
                        delete newMember.teamName;
                    } catch (err) {
                        // do nothing
                    }
    
                    // use email address as key to overwrite duplicates
                    dbATCMembersRef
                        .doc(newMember.email)
                        .set(newMember)
                        .then(memberId => {
                            //console.log(`Updated member ${JSON.stringify(member)} with id: ${memberId}`);
                        })
                        .catch(err => {
                            console.error(`error updating user: ${err}`);
                        });
                });
            }); // MAP
        }
    }

    static getTeams = () => {
        return new Promise((resolve, reject) => {
            const allDBRefs = Util.getDynamicChallengeDBRefs ("SAA", "prod", SAACHALLENGE);
            const dbTeamsRef = allDBRefs.dbTeamsRef;

            dbTeamsRef.orderBy("name").get().then((querySnapshot) => {
                let teams = [];
                querySnapshot.forEach(doc => {
                    let team = {};
                    team = doc.data();
                    team.id = doc.id;

                    teams.push(team);
                });
                // console.log(users);
                resolve(teams);
            }).catch(err => {
                reject(err);
            });    
        });
    }

    static authCreateUser = (user) => {                 
        // Generate random password if no password exists (meaning its created by someone else)
        if (!user.password || user.password === null || user.password === "") {
            let randomPassword = Math.random().toString(36).slice(-8);
            user.password = randomPassword;
        }
        // First, see if user already exists in auth
        // MUST return promise
        return new Promise((resolve, reject) => {
            admin.auth().getUserByEmail(user.email).then((user) => {
                // See the UserRecord reference doc for the contents of userRecord.
                let authUser = {};
                authUser = user;
                //console.log(`Successfully fetched user data: ${JSON.stringify(authUser)}`);
                resolve(authUser);
            }).catch((err) => {
                //console.log(`User does not yet exist in auth... creating ${err}`);
                // Create user
                admin.auth().createUser({
                    email: user.email,
                    emailVerified: false,
                    password: user.password,
                    displayName: `${user.firstName} ${user.lastName}`,
                    disabled: false
                }).then((authUser) => {
                    //console.log(`Successfully added auth user: ${JSON.stringify(authUser)}`);
                    resolve(authUser);
                }).catch((err) => {
                    //throw Error(`Error creating auth user in authCreateUser error: ${err}`);
                    console.error(`Error creating auth user in authCreateUser error: ${err}`);
                    reject(`Error creating auth user in authCreateUser error: ${err}`);
                });
            });  // get
        }); // promise
    } // function

    static async createSAAUsers(fileToUpload) {
        const allRefs = Util.getBaseDBRefs()
        const dbUsersRef = allRefs.dbUsersRef;

        // get Teams first
        let teams = null;
        let teamLookup = {};
        teams = await Users.getTeams();
        teams.forEach(team => {
            teamLookup[team.name] = team.id;
        });

        if (!fileToUpload) {
            fileToUpload = "SAAUsers.csv";
        }
        console.log(`Uploading users from ${fileToUpload}`);
    
        // read  the file and parse
        let SAAUsers = [];
    
        if (fileToUpload) {
            fs.readFile(fileToUpload, 'utf8', (err, data) => {
                if (err) throw err;
                console.log(`OK reading file`);
    
                //remove the quotes
                let fixedData = data.replace(/["]*/g, "");
                let lines = fixedData.split('\n');
    
                SAAUsers = lines.map((line) => {
                    let userArray = line.split(',');
                    let firstName = userArray[0].trim().toLowerCase();
                    let lastName = userArray[1].trim().toLowerCase();
                    let email = userArray[2].trim().toLowerCase();
                    let password = userArray.length > 3 ? userArray[3].trim() : "";
                    let teamName = userArray.length > 4 ? userArray[4].trim() : "";

                    lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1)
                    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
    
                    let teamUid = teamLookup[teamName] ?  teamLookup[teamName] : "";

                    let user = {
                        challengeUid: SAACHALLENGE,
                        displayName: `${firstName} ${lastName}`,
                        email: email,
                        firstName: firstName,
                        isUser: true,
                        lastName: lastName,
                        primaryRole : "User",
                        teamName: teamName,
                        teamUid: teamUid,

                        password: password,
                    };
                    //console.log(`user: ${JSON.stringify(user)}`); 
                    return (user);
                });
    
                let _ = SAAUsers.map( async (user) => {
                    // first, create the authUser if it does not yet exist
                    let authUser = await Users.authCreateUser(user);
                    console.log(`Addding user: ${authUser.uid}, ${user.firstName}, ${user.lastName}`);

                    let newUser = user;
                    try {
                        delete newUser.password;
                    } catch (err) {

                    }

                    dbUsersRef.doc(authUser.uid).set(newUser).then(userInfo => {
                        //console.log(`Updated user ${JSON.stringify(user)} with id: ${userId}`);
                    }).catch(err => {
                        console.error(`error updating user: ${err}`);
                    });
                });
            }); // MAP
        }
    }

}    

module.exports = Users;
