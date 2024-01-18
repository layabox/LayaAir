import { Vector3 } from "../../../maths/Vector3";


export class NavigationPathData {
    _pos: Vector3;

    _flag: number;
    constructor() {
        this._flag = 0;
        this._pos = new Vector3();
    }

    public get pos(): Vector3 {
        return this._pos;
    }

    public get flag(): number {
        return this._flag;
    }
}