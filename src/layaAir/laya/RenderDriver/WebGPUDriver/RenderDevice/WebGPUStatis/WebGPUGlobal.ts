import { WebGPUStatis } from "./WebGPUStatis";

export class WebGPUGlobal {
    static debug: boolean = true;
    static useBigBuffer: boolean = true;
    private static _idCounter: number = 0;
    private static _uniformInfoIdCounter: number = 0;

    static getUniformInfoId() {
        return this._uniformInfoIdCounter++;
    }

    static getId(object?: any) {
        if (this.debug && object)
            WebGPUStatis.trackObjectCreation(object.objectName || 'unknown', this._idCounter, object, 0);
        return this._idCounter++;
    }

    static releaseId(object: any) {
        if (this.debug && object)
            WebGPUStatis.trackObjectRelease(object.objectName || 'unknown', object.globalId, object, 0);
    }

    static action(object: any, action: string, memory: number = 0) {
        if (this.debug && object)
            WebGPUStatis.trackObjectAction(object.objectName || 'unknown', object.globalId, action, object, memory);
    }

    static reset() {
        this._idCounter = 0;
    }

    static get idCounter() {
        return this._idCounter;
    }
}