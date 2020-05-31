import { Result } from "../interfaces/Result";

type ContextType = {
    authUser: string,
    token: string,

    uid: string,
    displayName: string,
    phoneNumber: string,
    email: string,

    firstName: string,
    lastName: string,
    teamUid: string,
    teamName: string,
    challengeUid: string,
    challengeDistance: 0,
    challengeName: string,
    stavaUserAuth : boolean,
    stravaRefreshToken : string,
    stravaAccessToken : string,
    stravaExpiresAt : Date,
    primaryRole: string,
    isAdmin: boolean,
    isTeamLead: boolean,
    isModerator: boolean,
    isUser: boolean,
    updatedResults: number,
    results: Array<Result>      // results from backend
};

export type { ContextType }
