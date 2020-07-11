import { Result } from "./Result";

type ResultType = {
    id: string;
    challengeUid: string;
    overallRecord: boolean;
    teamRecord: boolean;
    teamUid: string;
    teamName: string;
    userRecord: boolean;
    uid: string;
    photoUrl: string;
    displayName: string;
    rank: number;
    distanceTotal: number;
    pointsTotal: number;
    durationTotal: number;
    nbrActivities: number;
    swimDistanceTotal: number;
    swimPointsTotal: number;
    swimNbrActivities: number;
    swimDurationTotal: number;
    bikeDistanceTotal: number;
    bikePointsTotal: number;
    bikeNbrActivities: number;
    bikeDurationTotal: number;
    runDistanceTotal: number;
    runPointsTotal: number;
    runNbrActivities: number;
    runDurationTotal: number;
    otherDistanceTotal: number;
    otherPointsTotal: number;
    otherNbrActivities: number;
    otherDurationTotal: number;
    updateDateTime: Date;
}

type AllResults = {
    challengeUid: string,
    overallResults: Result,
    teamResults: Array<Result>,
    userResults: Array<Result>
};

export type {AllResults, ResultType}