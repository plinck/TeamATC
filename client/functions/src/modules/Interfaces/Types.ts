import { Result } from "./Result";

type AllResults = {
    overallResults: Result,
    teamResults: Array<Result>,
    userResults: Array<Result>
};

export {AllResults}