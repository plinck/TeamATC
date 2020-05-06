import Result from "./Interfaces/Result";
import Challenge from "./Interfaces/Challenge";

class Leaderboard {
    static isRunning: boolean = false;
    static overallResults: Result = new Result();
    static teamResults: Array<Result> = [];
    static userResults: Array<Result> = [];
    static challenge:Challenge = new Challenge("5XuThS03PcQQ1IasPQif");

    results: Result = new Result();
}

export { Leaderboard }