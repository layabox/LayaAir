import { BlueprintRuntime } from "../../runtime/BlueprintRuntime";
import { IRunAble } from "../../runtime/interface/IRunAble";

export interface IBluePrintSubclass {
    bp: BlueprintRuntime;
    context: IRunAble;
}