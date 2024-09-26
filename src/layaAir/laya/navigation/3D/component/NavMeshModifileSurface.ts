import { Component } from "../../../components/Component";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { TextResource } from "../../../resource/TextResource";
import { NavModifleData } from "../../common/data/NavModifleData";
import { NavigationUtils } from "../../common/NavigationUtils";
import { NavTileData, NavTileCache } from "../../common/NavTileData";
import { BaseNav3DModifle } from "./BaseNav3DModifle";

/**
 * @en NavMeshModifileSurface is a component that modifies the navigation mesh surface.
 * @zh NavMeshModifileSurface 是一个修改导航网格表面的组件。
 */
export class NavMeshModifileSurface extends BaseNav3DModifle {

    /**@internal load*/
    _oriTiles: NavTileData;

    /**@internal */
    _oriNavTileCache: NavTileCache;


    /**
     * <code>NavMeshModifileSurface<Code>
     */
    constructor() {
        super();
        this._modifierData = new NavModifleData();
    }

     /**
     * @en Sets or gets the baked navigation data.
     * @param value The TextResource containing the navigation data.
     * @returns The TextResource containing the navigation data.
     * @zh 设置或获取烘焙的导航数据。
     * @param value 包含导航数据的 TextResource。
     * @returns 包含导航数据的 TextResource。
     */
    set datas(value: TextResource) {
        if(this._oriTiles){
            this._oriTiles.destroy();
            this._oriTiles = null;
        }
        if(value != null){
            this._oriTiles = new NavTileData(value);
        }
        this._changeData();
        this._onWorldMatNeedChange();
    }

    get datas(): TextResource {
        if(this._oriTiles) return this._oriTiles._res;
        return null;
    }

    /**@internal */
    protected _onEnable(): void {
        this._changeData();
        super._onEnable();
        let min = this._modifierData._min;
        let max = this._modifierData._max;
        let surface = this._manager.getNavMeshSurfacesByBound(min,max,this._modifierData.agentType);
        (<NavModifleData>this._modifierData)._initSurface(surface);
    }


    /**
     * @internal
     */
    _refeashTranfrom(mat: Matrix4x4, min:Vector3,max:Vector3) {
        mat.cloneTo(this._modifierData._transfrom);
        let data = this._modifierData as NavModifleData;
        if(data.datas == null) return;
        let boundmin = data.datas._boundMin;
        let boundmax = data.datas._boundMax;
        NavigationUtils._transfromBoundBox(boundmin,boundmax,this._modifierData._transfrom,min,max);
        this._modifierData._refeahTransfrom();
    }

     /**@internal */
    _changeData() {
        if(!this._enabled) return;
        let modiferData = this._modifierData as NavModifleData;
        if(this._oriTiles){
            modiferData.datas = this._oriTiles.getNavData(0);
        }else{
            modiferData.datas = null;
        }
    }

    _cloneTo(dest: Component): void {
        super._cloneTo(dest);
        let destNavMeshModifileSurface = <NavMeshModifileSurface>dest;
        destNavMeshModifileSurface.datas = this.datas;
    }

}