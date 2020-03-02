const Util = require("./Util.js");

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

    static async getMembers () {
        let nbrATCMembers = 0;
        let ATCMembers = [];

        // Get the ATC Members
        try {
            let allATCMembersSnapshot = await Util.getDBRefs().dbATCMembersRef.get();
            allATCMembersSnapshot.forEach(doc => {
                nbrATCMembers += 1;
                //console.log(doc.id, '=>', JSON.stringify(doc.data()));
                let ATCMember = doc.data();
                ATCMember.id = doc.id;
                ATCMembers.push(ATCMember)
            });
            console.log(`Found: ${nbrATCMembers} Members`);
            return ATCMembers;
        }
        catch (err) {
            console.error(`Error getting ATC Users: ${err}`);
            return [];
        }
    }

    static async getTeams () {
        let nbrTeams = 0;
        let teams = [];

        // Get teams
        try {
            let allteamsSnapshot = await Util.getDBRefs().dbTeamsRef.get();
            allteamsSnapshot.forEach(doc => {
                nbrTeams += 1;
                console.log(doc.id, '=>', JSON.stringify(doc.data()));
                let team = doc.data();
                team.id = doc.id;
                teams.push(team)
            });
            console.log(`Found: ${nbrTeams} Teams`);
            return teams;
        }
        catch (err) {
            console.error(`Error getting ATC Teams: ${err}`);
            return [];
        }
    }
}    

module.exports = MemberInfo;
