import { BatchMark } from "../../core/render/BatchMark";
/**
 * @internal
 */
export class InstanceBatchManager {
    /** @internal */
    static instance = new InstanceBatchManager();
    /**@internal */
    private _instanceBatchOpaqueMarks: any[] = [];
    /**@internal [只读]*/
    updateCountMark: number = 0;
    constructor() {
    }

    /**
     * get batch index
     */
    private _getData<T>(key: boolean | number, data: any, cls?: new () => T): T {
        if (null == cls) {
            cls = Array as any;
        }
        if ("boolean" == typeof key) {
            return (data[key ? 0 : 1]) || (data[key ? 0 : 1] = new cls());
        } else {
            return data[key] || (data[key] = new cls());
        }
    }

    /**
     * get batchMark by render property
     * @param receiveShadow 
     * @param materialID 
     * @param subMeshID 
     * @param invertFace 
     * @param lightmapIndex 
     * @returns 
     */
    getInstanceBatchOpaquaMark(receiveShadow: boolean, materialID: number, subMeshID: number, invertFace: boolean, reflectionprob: number, lightmapIndex: number): BatchMark {
        var data = this._getData(receiveShadow, this._instanceBatchOpaqueMarks);
        data = this._getData(materialID, data);
        data = this._getData(subMeshID, data);
        data = this._getData(invertFace, data);
        data = this._getData(lightmapIndex, data);
        return this._getData(reflectionprob, data, BatchMark);

    }
}