
import { Browser } from "../../utils/Browser";
import { EBTNodeResult } from "../core/EBTNodeResult";
import { BTTaskBluePrintBase } from "../tasks/BTTaskBluePrintBase";

export class TestBPTask extends BTTaskBluePrintBase {
    onReciecve() {
        console.log("hahaha");
        Browser.window["KK"] = (b: boolean) => {
            this.finishWithResult(b ? EBTNodeResult.Succeeded : EBTNodeResult.Failed);
        }
    }
}