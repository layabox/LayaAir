import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { CacheData } from "./CacheData";
import { NavigationConfig } from "../NavigationConfig";

/**@internal */
export class BaseData {
    /**@internal */
    _transfrom: Matrix4x4 = new Matrix4x4();
    /**@internal */
    _min: Vector3 = new Vector3();
    /**@internal */
    _max: Vector3 = new Vector3();
    /**@internal */
    _agentType: string = NavigationConfig.defaltAgentName;
    /**@internal */
    _areaFlags: string = NavigationConfig.defaltUnWalk;

    /**@internal */
    _cacheDatas: Array<CacheData> = [];

    /**
    * agentType
    */
    set agentType(value: string) {
        this._agentType = value;
    }

    get agentType() {
        return this._agentType;
    }

    /**
     * area 类型
     */
    set areaFlag(value: string) {
        this._areaFlags = value;
        this._cacheDatas.forEach(element => {
            element._updateAreaFlag(value);
        });
    }

    get areaFlag() {
        return this._areaFlags;
    }


    /**
     * @internal
     * 刷新数据
     */
    _refeashData(): void {
        this._cacheDatas.forEach(element => {
            element._setCacheFlag(CacheData.DataFlag);
        });
    }

    /**
     * @internal
     * 刷新transfrom
     */
    _refeahTransfrom(): void {
        this._cacheDatas.forEach(element => {
            element._updateTransfrom(this._transfrom);
        });
    }

    /**
     * @internal
     * 刷新transfrom
     */
    _refeahBound(): void {
        this._cacheDatas.forEach(element => {
            element._cacheBound(this._min, this._max);
        });
    }
}