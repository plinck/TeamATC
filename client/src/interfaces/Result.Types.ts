import { Result } from "./Result";

type ResultType = {
    id?: string;

    challengeUid: string;
    overallRecord: boolean;

    teamRecord: boolean;
    teamUid: string;
    teamName: string;

    userRecord: boolean;
    uid: string;
    displayName: string;

    distanceTotal: number;
    durationTotal: number;
    nbrActivities: number;
    photoUrl: string;
    pointsTotal: number;
    rank: number;
    
    bikeDistanceTotal: number;
    bikePointsTotal: number;
    bikeNbrActivities: number;
    bikeDurationTotal: number;
    otherDistanceTotal: number;
    otherDurationTotal: number;
    otherPointsTotal: number;
    otherNbrActivities: number;
    runDistanceTotal: number;
    runPointsTotal: number;
    runNbrActivities: number;
    runDurationTotal: number;
    swimDistanceTotal: number;
    swimPointsTotal: number;
    swimNbrActivities: number;
    swimDurationTotal: number;
    updateDateTime: Date;
}

type AllResults = {
    challengeUid: string,
    overallResults: Result,
    teamResults: Array<Result>,
    userResults: Array<Result>
};

export type {AllResults, ResultType}