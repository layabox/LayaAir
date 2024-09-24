import { NavAreaFlag } from "./NavigationConfig";

/**
 * @en Indicate the navigation area types that the agent can pass through.
 * @zh 表示代理可以通过的导航区域类型。
 */
export class AreaMask {
    /**@internal */
    private _flags: number;
    /**@internal */
    private _excludeflag: number;
    /**@internal */
    private _areaFlagMap: Map<string, NavAreaFlag>;

    /**
     * @en The exclude flag.
     * @zh 排除标志。
     */
    get excludeflag(): number {
        return this._excludeflag;
    }

    /**
     * @en The current flag.
     * @zh 获取当前标志。
     */
    get flag(): number {
        return this._flags;
    }

    set flag(value: number) {
        this._flags = value;
        this._calculFlagVale();
    }
    /**
     * @en Creates a new instance of AreaMask.
     * @zh 创建 AreaMask 的新实例。
     */
    constructor() {
        this._flags = 7;
    }

    /**
     * @internal
     */
    _setAreaMap(areaFlagMap: Map<string, NavAreaFlag>) {
        this._areaFlagMap = areaFlagMap;
        this._calculFlagVale();
    }

    /**
     * @internal
     */
    _calculFlagVale() {
        if (!this._areaFlagMap) return;
        let flag = 0;
        let excludeflag = 0;
        this._areaFlagMap.forEach((value, key) => {
            if (this._flags & value.flag) {
                flag = flag | value.flag;
            } else {
                excludeflag = excludeflag | value.flag;
            }
        })
        this._flags = flag;
        this._excludeflag = excludeflag;
    }
}