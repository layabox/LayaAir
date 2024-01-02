export class RuntimeNodeData {
    parmsArray: any[];

    pinsValue: Map<number, RuntimePinData>
    constructor() {
        this.pinsValue = new Map();
        this.parmsArray=[];
    }
}

export class RuntimePinData {
    value: any;
    setValue(value:any){
        this.value=value;
    }

    getValue():any{
        return this.value;
    }

}