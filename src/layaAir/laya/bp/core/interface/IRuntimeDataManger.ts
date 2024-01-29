import { RuntimeNodeData, RuntimePinData } from "../../runtime/action/RuntimeNodeData";
import { BlueprintPinRuntime } from "../../runtime/BlueprintPinRuntime";

export interface IRuntimeDataManger {
    debuggerPause?: boolean;
    
    getDataById(nid: number): RuntimeNodeData;

    setPinData(pin: BlueprintPinRuntime, value: any, runId: number): void;

    getPinData(pin: BlueprintPinRuntime, runId: number): any;

    getRuntimePinById(id: string): RuntimePinData;
}