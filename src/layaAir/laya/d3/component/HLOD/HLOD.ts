import { Component } from "../../../components/Component";
import { Vector3 } from "../../../maths/Vector3";
import { Camera } from "../../core/Camera";
import { Sprite3D } from "../../core/Sprite3D";
import { Scene3D } from "../../core/scene/Scene3D";
import { Bounds } from "../../math/Bounds";
import { HLODRender } from "./HLODRender";
import { HLODConfig, HLODResourceGroup } from "./HLODUtil";

const tempVec = new Vector3();

export class HLOD extends Component {
    /**@internal */
    _resourceList: HLODResourceGroup[];
    /**@internal */
    _curLODSource: HLODResourceGroup;
    /**@internal 包围盒*/
    _bounds: Bounds;
    /**@internal */
    _curRender: HLODRender[];
    /**@internal TODO*/
    //_crossRender: HLODRender[];
    /**@internal TODO*/
    //_renderMode:
    /**@internal TODO*/
    //cacheRender:HLODRender[];
    /**@internal */
    _HLODConfig: HLODConfig;
    /**@internal */
    private _lodRateArray: number[];
    /**@internal */
    private _size: number;
    constructor() {
        super();
        this._singleton = true;
    }

    /**
     * IDE
     */
    get bounds() {
        return this._bounds;
    }

    set bounds(value: Bounds) {
        this._bounds = value;
        this.recalculateBounds();
    }

    /**
     * IDE
     */
    get lodResource() {
        return this._resourceList;
    }
    set lodResource(value: HLODResourceGroup[]) {
        this._resourceList = value;
    }


    /**
     * lod裁剪过滤
     */
    set lodCullRateArray(value: number[]) {
        value.sort((a, b) => b - a);
        this._lodRateArray = value;
    }

    get lodCullRateArray() {
        return this._lodRateArray;
    }

    private _applyLODResource(resource: HLODResourceGroup) {
        this._curLODSource = resource;
        let element = resource.resources;
        for (let i = 0, n = element.length; i < n; i++) {
            let hlodRender = this.owner.addComponent(HLODRender);
            this._curRender.push(hlodRender);
            hlodRender.curHLODRS = element[n];
        }
    }

    private _releaseGroupRender() {
        this._curRender.forEach(element => {
            element.destroy();
        });
        this._curRender = [];
    }


    /**
     * @internal
     * 重新计算包围盒
     */
    recalculateBounds() {
        //如果移动了就修改Bounds
        let extend = this._bounds.getExtent();
        this._size = 2 * Math.max(extend.x, extend.y, extend.z);
    }

    /**
    * @internal
    * 渲染之前的更新
    */
    onPreRender() {
        // this.recalculateBounds();
        // //查看相机的距离
        let checkCamera = (this.owner.scene as Scene3D).cullInfoCamera as Camera;
        let maxYDistance = checkCamera.maxlocalYDistance;
        let cameraFrustum = checkCamera.boundFrustum;
        Vector3.subtract((this.owner as Sprite3D).transform.position, checkCamera.transform.position, tempVec);
        //大于farplane,或者不在视锥内.不做lod操作
        let length = tempVec.length();
        if (length > checkCamera.farPlane || cameraFrustum.containsPoint((this.owner as Sprite3D).transform.position) == 0) {
            return;
        }
        let rateYDistance = length / checkCamera.farPlane * maxYDistance;
        let rate = (this._size / rateYDistance);
        for (let i = 0; i < this._lodRateArray.length; i++) {
            if (rate < this._lodRateArray[i])
                continue;
            this.applyResource(this._resourceList[i]);
            break;
        }
    }

    onUpdate(): void {
        this._curLODSource.updateMark = Camera._updateMark;
        //GC TODO

    }

    applyResource(resource: HLODResourceGroup) {
        if (resource == this._curLODSource)
            return;
        if (resource.loaded) {
            if (this._curLODSource) {
                //Cache TODO
                //是否有Cross fade Render 
                this._releaseGroupRender();
                this._applyLODResource(resource);

            }
        } else {
            resource.load(this.applyResource, this);
        }
    }

    onEnable() {
        super.onEnable();
        //根据
    }

    onDisable() {
        super.onDisable();
    }

    onDestroy() {
        super.onDestroy();
        //TODO删除
    }

    _cloneTo(dest: HLOD) {
        //Clone to
        throw "cant clone HLOD"
    }
}