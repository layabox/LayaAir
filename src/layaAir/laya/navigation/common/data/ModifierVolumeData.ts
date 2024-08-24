import { Vector3 } from "../../../maths/Vector3";
import { Handler } from "../../../utils/Handler";
import { BaseNavMeshSurface } from "../component/BaseNavMeshSurface";
import { CacheData } from "./CacheData";
import { BaseData } from "./BaseData";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { NavigationUtils } from "../NavigationUtils";

const tempVec3 = new Vector3();
const tempMat = new Matrix4x4();
export class ModifierVolumeData extends BaseData{
    /**@internal */
    _datas: number[] = [];
    /**@internal */
    _buffer:Float32Array;

    /**@internal 用于设置包围盒y方向偏移 */
    _yOffset:number = 0.1;

    constructor(yOff:number=0.1){
        super();
        this._yOffset = yOff;
    }

    /**
     * @internal
     * 更新buffer
     */
    private _updateBuffer(cache:CacheData,flag:number): void {
        let mesh = cache._surface._navMesh;
        
        if(cache._getCacheFlag(CacheData.TransfromFlag)||cache._getCacheFlag(CacheData.DataFlag)){
            if(mesh.is3D){
                if(this._buffer == null){
                    this._buffer = new Float32Array(22);
                }
                this._max.setValue(1,1,1);
                this._min.setValue(-1,-1,-1);
                NavigationUtils.transfromBoundBox(this._min,this._max,this._transfrom,this._min,this._max);
                this._buffer[0] = this._min.x;
                this._buffer[1] = this._min.y;
                this._buffer[2] = this._min.z;
                this._buffer[3] = this._max.x;
                this._buffer[4] = this._max.y;
                this._buffer[5] = this._max.z;
                this._transfrom.invert(tempMat);
                this._buffer.set(tempMat.elements,6);
                cache._cacheBound(this._min,this._max);
            }else{
                if(this._buffer == null || this._buffer.length != this._datas.length){
                    this._buffer = new Float32Array(this._datas.length);
                }
                let count = this._datas.length/3;
                this._max.setValue(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE);
                this._min.setValue(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE);
                for(var i=0;i<count;i++){
                    tempVec3.setValue(this._datas[i*3],this._datas[i*3+1],this._datas[i*3+2]);
                    Vector3.transformCoordinate(tempVec3,this._transfrom,tempVec3);
                    this._buffer[i*3] = tempVec3.x;
                    this._buffer[i*3+1] = tempVec3.y;
                    this._buffer[i*3+2] = tempVec3.z;
                    this._max.x = Math.max(this._max.x,tempVec3.x);
                    this._max.y = Math.max(this._max.y,tempVec3.y);
                    this._max.z = Math.max(this._max.z,tempVec3.z);
                    this._min.x = Math.min(this._min.x,tempVec3.x);
                    this._min.y = Math.min(this._min.y,tempVec3.y);
                    this._min.z = Math.min(this._min.z,tempVec3.z);
                }
                this._min.x -= this._yOffset;
                this._max.y += this._yOffset;
                cache._cacheBound(this._min,this._max);
            }
            
        }

        mesh._updateCovexVoume(cache.id,this._buffer,this._min.y,this._max.y,flag);
    }


    /**
     * @internal
     */
    _initSurface(surface:Array<BaseNavMeshSurface>): void {
        this._cacheDatas = [];
        surface.forEach(element => {
            let cache = element._addConvexVoume(this);
            cache.setUpdateDataHander(Handler.create(this,this._updateBuffer,undefined,false));
            this._cacheDatas.push(cache);
            cache._updateAreaFlag(this._areaFlags);
            cache._updateTransfrom(this._transfrom);
            cache._setCacheFlag(CacheData.DataFlag);
        });
    }

    /**
     * @internal
     */
    _destory(): void {
        this._cacheDatas.forEach(element => {
            element._surface._deleteCovexVoume(this);
        });
        this._cacheDatas = [];
    }
}