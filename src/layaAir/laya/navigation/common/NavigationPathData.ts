import { Vector3 } from "../../maths/Vector3";



export class NavigationPathData {
    /** @internal */
    _pos: Vector3;
    /** @internal */
    _flag: number;

    /** 
     * @en position
     * @zh 位置
     */
    public get pos(): Vector3 {
        return this._pos;
    }

    /**
     * @en flag of the position
     * @zh 位置的标记
     */
    public get flag(): number {
        return this._flag;
    }

    constructor() {
        this._flag = 0;
        this._pos = new Vector3();
    }

}