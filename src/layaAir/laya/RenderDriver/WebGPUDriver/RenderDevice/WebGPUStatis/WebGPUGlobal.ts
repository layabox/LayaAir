import { WebGPUStatis } from "./WebGPUStatis";

export class WebGPUGlobal {
    static debug: boolean = true;
    private static _idCounter: number = 0;

    static getId(object?: any) {
        if (this.debug && object)
            WebGPUStatis.trackObjectCreation(object.name ? object.name : 'unknown', this._idCounter, object, 0);
        return this._idCounter++;
    }

    static releaseId(object: any) {
        if (this.debug && object)
            WebGPUStatis.trackObjectRelease(object.name ? object.name : 'unknown', object._id, object, 0);
    }

    static reset() {
        this._idCounter = 0;
    }

    static get idCounter() {
        return this._idCounter;
    }
}