import { Sprite } from "../../../display/Sprite";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { BaseNavigationManager } from "../../common/BaseNavigationManager";
import { BaseNavAgent } from "../../common/component/BaseNavAgent";
import { Navgiation2DUtils } from "../Navgiation2DUtils";
import { Navigation2DManage } from "../Navigation2DManage";

const tempVector3 = new Vector3();

/**
 * <code>Nav2DAgent</code> 类用于创建2D导航代理。
 */
export class Nav2DAgent extends BaseNavAgent {

    /**@internal */
    private _destination: Vector2 = new Vector2();

    /**
    * @en Set the destination for the agent.
    * @param value The destination vector.
    * @zh 设置代理的目的地。
    * @param value 目的地位置向量。
    */
    set destination(value: Vector2) {
        value.cloneTo(this._destination);
        Navgiation2DUtils._vec2ToVec3(this._destination, tempVector3);
        this._setTarget(tempVector3);
    }

    get destination(): Vector2 {
        return this._destination;
    }

    constructor() {
        super();
        this._baseOffset = 0;
        this._radius = 10;
        this._speed = 100;
        this._Acceleration = 300;

    }

    onAwake(): void {
        super.onAwake();
        (<Sprite>this.owner).cacheGlobal = true;
    }

    /**@internal */
    _getcollisionQueryRange(): number {
        return this._getradius() * 12;
    }

    /**@internal */
    _getpathOptimizationRange(): number {
        return this._getradius() * 300;
    }

    /**
     * @internal 
     */
    _getradius(): number {
        let sprite = this.owner as Sprite;
        return this._radius * Math.max(sprite.globalScaleX, sprite.globalScaleY);
    }


    /**
    * @internal 
    */
    _getheight(): number {
        return 0.01;
    }

    /**
     * @internal
     * @en Get the current rendering world coordinates
     * @zh 获取当前渲染世界坐标
     */
    _getpos(pos: Vector3): void {
        Navgiation2DUtils._getSpriteGlobalPos(this.owner as Sprite, pos);
    }

    /**
     * @internal
     */
    protected _getManager(): BaseNavigationManager {
        return Navigation2DManage._getNavManager(this);
    }

    /**
     * @internal
     * 同步寻路位置和方向到渲染引擎
     */
    _updatePosition(pos: Vector3, dir: Vector3) {
        let sprite = this.owner as Sprite;
        sprite.setGlobalPos(pos.x, pos.z);
        sprite.globalRotation = Math.atan2(dir.x, dir.z) * 180 / Math.PI;
    }


}