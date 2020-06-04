import { Result } from "../interfaces/Result";
import { Team } from "../interfaces/Team";
import { UserChallenge, User } from "../interfaces/User";

type ContextType = {
    authUser: string,
    token: string,

    user: User,

    uid: string,
    challenges: Array<UserChallenge>,
    displayName: string,
    email: string,
    firstName: string,
    isAdmin: boolean,
    isTeamLead: boolean,
    isModerator: boolean,
    isUser: boolean,
    lastName: string,
    phoneNumber: string,
    primaryRole: string,
    teamUid: string,
    teamName: string,

    challengeUid: string,
    challengeDistance: number,
    challengeName: string,
    stavaUserAuth : boolean,
    stravaRefreshToken : string,
    stravaAccessToken : string,
    stravaExpiresAt : Date,
    updatedTeams: number,
    teams: Array<Team>,

    updatedResults: number,
    results: Array<Result>      // results from backend
};

export type { ContextType }
