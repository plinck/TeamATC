import { Result } from "./Result";

type ResultType = {
    overalRecord: boolean;
    teamRecord: boolean;
    teamUid: string;
    teamName: string;
    userRecord: boolean;
    uid: string;
    displayName: string;
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
}

type AllResults = {
    challengeUid: string,
    overallResults: Result,
    teamResults: Array<Result>,
    userResults: Array<Result>
};

export {AllResults, ResultType}