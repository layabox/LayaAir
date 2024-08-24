import { Vector3 } from "../maths/Vector3";



/**
 * @en Represents a navigation path data point.
 * @zh 表示导航路径数据点。
 */
export class NavigationPathData {
    /** @internal */
    _pos: Vector3;
    /** @internal */
    _flag: number;

    /**
     * @en The position of the path data point.
     * @zh 路径数据点的位置。
     */
    public get pos(): Vector3 {
        return this._pos;
    }

    /**
     * @en Get the flag of the path data point.
     * @zh 获取路径数据点的标记。
     */
    public get flag(): number {
        return this._flag;
    }

    /**
     * @ignore
     * @en Creates a new instance of NavigationPathData.
     * @zh 创建 NavigationPathData 的新实例。
     */
    constructor() {
        this._flag = 0;
        this._pos = new Vector3();
    }

}