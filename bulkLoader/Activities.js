const MemberInfo = require("./MemberInfo.js");

class Activities {

    static getChallengeActivities (lines, ATCMembers, teams) {

        let logged = 0;
        let ChallengeActivities = [];
        let totalBadAtivities = 0;
        let totalActivities = 0;    
    
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
        console.log(`Found: ${totalActivities} valid activities, ${totalBadAtivities} Bad Activities`);
        return ChallengeActivities;
    }
}    

module.exports = Activities;
