import { NavAreaFlag } from "./NavigationManager";

export class AreaMask {
    private _flags: number;
    private _excludeflag: number;
    private _areaFlagMap: Map<string, NavAreaFlag>;

    get excludeflag(): number {
        return this._excludeflag;
    }

    get flag(): number {
        return this._flags;
    }

    set flag(value: number) {
        this._flags = value;
        this._calculFlagVale();
    }
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