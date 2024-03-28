import { RuntimeNodeData, RuntimePinData } from "../../runtime/action/RuntimeNodeData";
import { BlueprintPinRuntime } from "../../runtime/BlueprintPinRuntime";

export interface IRuntimeDataManger {    
    getDataById(nid: number): RuntimeNodeData;

    setPinData(pin: BlueprintPinRuntime, value: any, runId: number): void;

    getPinData(pin: BlueprintPinRuntime, runId: number): any;

    getRuntimePinById(id: string): RuntimePinData;

    getVar(name: string,runId: number): any;

    setVar(name: string, value: any,runId: number): void;

    clearVar(runId: number): void;

    saveContextData(from: number, to: number): void;
}