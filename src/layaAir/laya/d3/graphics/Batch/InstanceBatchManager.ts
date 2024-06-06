import { BatchMark } from "../../core/render/BatchMark";
import { RenderElement } from "../../core/render/RenderElement";
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

    // /**
    //  * get batchMark by render property
    //  * @param receiveShadow 
    //  * @param materialID 
    //  * @param subMeshID 
    //  * @param invertFace 
    //  * @param lightmapIndex 
    //  * @returns 
    //  */
    // getInstanceBatchOpaquaMark(receiveShadow: boolean, materialID: number, subMeshID: number, invertFace: boolean, reflectionprob: number, lightmapIndex: number): BatchMark {
    //     var data = this._getData(receiveShadow, this._instanceBatchOpaqueMarks);
    //     data = this._getData(materialID, data);
    //     data = this._getData(subMeshID, data);
    //     data = this._getData(invertFace, data);
    //     data = this._getData(lightmapIndex, data);
    //     return this._getData(reflectionprob, data, BatchMark);
    // }

    getInstanceBatchOpaquaMark(element: RenderElement): BatchMark {
        //transID
        let invertFrontFace = element._transform && element._transform._isFrontFaceInvert ? 1 : 0;
        let receiveShadow = element._baseRender._receiveShadow ? 1 : 0;
        let matID_geometry = (element._material._id << 17) + (element._geometry._id << 2) | (invertFrontFace << 1) | (receiveShadow);
        //gi id
        let reflectid = (element._baseRender._probReflection ? element._baseRender._probReflection._reflectionProbeID : -1) + 1;
        let lightmapid = (element._baseRender.lightmapIndex) + 1;
        let lightprobid = (element._baseRender._lightProb ? element._baseRender._lightProb._volumetricProbeID : -1) + 1;
        let giID = (reflectid << 10) | (lightmapid << 20) | lightprobid;
        //get Mark
        var data = this._getData(matID_geometry, this._instanceBatchOpaqueMarks);
        return this._getData(giID, data, BatchMark);



    }
}