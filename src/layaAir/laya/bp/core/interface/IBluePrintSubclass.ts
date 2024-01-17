import { BlueprintFactory } from "../../runtime/BlueprintFactory";
import { BlueprintRuntime } from "../../runtime/BlueprintRuntime";
import { IRunAble } from "../../runtime/interface/IRunAble";

export interface IBluePrintSubclass {
    [BlueprintFactory.bpSymbol]: BlueprintRuntime;
    [BlueprintFactory.contextSymbol]: IRunAble;
    [key: string]: any;
}