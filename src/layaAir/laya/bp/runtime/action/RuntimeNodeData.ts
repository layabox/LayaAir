import { IOutParm } from "../../core/interface/IOutParm";

export class RuntimeNodeData {
    map: Map<number, any[]>;

    callFunMap: Map<number, Function>;
    //parmsArray: any[];

    eventName: string;

    constructor() {
        this.map = new Map();
        this.callFunMap = new Map();
    }

    getCallFun(runId:number):Function{
        return this.callFunMap.get(runId);
    }

    setCallFun(runId:number,fun:Function){
        this.callFunMap.set(runId,fun);
    }

    getParamsArray(runId: number): any[] {
        let result = this.map.get(runId);
        if (!result) {
            result = [];
            this.map.set(runId, result);
        }
        return result;
    }
}

export class RuntimePinData implements IOutParm {
    name: string;
    private value: any;
    private valueMap: Map<number, any>;
    constructor() {
        this.valueMap = new Map();
    }

    copyValue(runId: number, toRunId: number) {
        let value = this.valueMap.get(runId);
        if (value) {
            this.valueMap.set(toRunId, value);
        }
    }
    initValue(value: any) {
        this.value = value;
        this.getValue = this.getValueOnly;
    }

    setValue(runId: number, value: any) {
        this.valueMap.set(runId, value);
    }

    private getValueOnly(runId: number): any {
        return this.value;
    }

    getValue(runId: number): any {
        return this.valueMap.get(runId);
    }

}