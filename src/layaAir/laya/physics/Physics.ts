import { Sprite } from "../display/Sprite"
import { EventDispatcher } from "../events/EventDispatcher"
import { Point } from "../maths/Point"
import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { Physics2DOption } from "./Physics2DOption";
import { Vector2 } from "../maths/Vector2";
import { IPhysiscs2DFactory } from "./IPhysiscs2DFactory";

/**
 * 2D物理引擎
 */
export class Physics extends EventDispatcher {


    /**@private */
    private static _I: Physics;

    // /**旋转迭代次数，增大数字会提高精度，但是会降低性能*/
    // velocityIterations: number = 8;

    // /**位置迭代次数，增大数字会提高精度，但是会降低性能*/
    // positionIterations: number = 3;

    /**@private 是否已经激活*/
    private _enabled: boolean;

    /**@private 根容器*/
    private _worldRoot: Sprite;

    /**@private 空的body节点，给一些不需要节点的关节使用*/
    _emptyBody: any;
    /**@private */
    _eventList: any[] = [];

    _factory: IPhysiscs2DFactory;

    /**全局物理单例*/
    static get I(): Physics {
        return Physics._I || (Physics._I = new Physics());
    }

    constructor() {
        super();
    }

    /**
     * 开启物理世界
     * options值参考如下：
       allowSleeping:true,
       gravity:10,
       customUpdate:false 自己控制物理更新时机，自己调用Physics.update
     */
    static enable(options: Physics2DOption = null) {
        Physics.I.start(options)
    }

    /**
     * 开启物理世界
     * options值参考如下：
       allowSleeping:true,
       gravity:10,
       customUpdate:false 自己控制物理更新时机，自己调用Physics.update
     */
    start(options: Physics2DOption = null): void {
        if (!this._enabled) {
            this._enabled = true;
            if (options == null) {
                options = new Physics2DOption();
            }

            //start 2d world
            this._factory.start(options);
            this.allowSleeping = options.allowSleeping;
            if (options.debugDraw) {
                this._factory.createDebugDraw(99);
            }
            this._emptyBody || (this._emptyBody = this._createBody(null));

            if (!options.customUpdate && LayaEnv.isPlaying)
                ILaya.physicsTimer.frameLoop(1, this, this._update);
        }
    }

    private _update(): void {
        var delta = ILaya.timer.delta / 1000;
        if (delta > .033) { // 时间步太长，会导致错误穿透
            delta = .033;
        }
        this._factory.update(delta);
        var len: number = this._eventList.length;
        if (len > 0) {
            for (var i: number = 0; i < len; i += 2) {
                this._factory.sendEvent(this._eventList[i], this._eventList[i + 1]);
            }
            this._eventList.length = 0;
        }
    }

    /**@private */
    _createBody(def: any): any {
        return this._factory.createBody(def);
    }

    /**@private */
    _removeBody(body: any): void {
        this._factory.removeBody(body);
    }

    /**@private */
    _createJoint(def: any): any {
        this._factory.createJoint(def);
    }

    /**@private */
    _removeJoint(joint: any): void {
        this._factory.removeJoint(joint);
    }

    /**
     * @private
     * 显示物理绘制
     */
    showDebugDraw(flags?: number):void{
        this._factory.createDebugDraw(flags);
    }

    /**
     * @private
     * 隐藏物理绘制
     */
    removeDebugDraw():void{
        this._factory.removeDebugDraw();
    }



    /**
     * 停止物理世界
     */
    stop(): void {
        ILaya.physicsTimer.clear(this, this._update);
    }

    /**
     * 设置是否允许休眠，休眠可以提高稳定性和性能，但通常会牺牲准确性
     */
    get allowSleeping(): boolean {
        return this._factory.allowSleeping;
    }

    set allowSleeping(value: boolean) {
        this._factory.allowSleeping = value;
    }

    /**
     * 物理世界重力环境，默认值为{x:0,y:1}
     * 如果修改y方向重力方向向上，可以直接设置gravity.y=-1;
     */
    get gravity(): any {
        return this._factory.gravity;
    }

    set gravity(value: Vector2) {
        this._factory.gravity = value;
    }

    /**获得刚体总数量*/
    getBodyCount(): number {
        return this._factory.bodyCount;
    }

    /**获得碰撞总数量*/
    getContactCount(): number {
        return this._factory.contactCount;
    }

    /**获得关节总数量*/
    getJointCount(): number {
        return this._factory.jointCount;
    }

    /**物理世界根容器，将根据此容器作为物理世界坐标世界，进行坐标变换，默认值为stage
     * 设置特定容器后，就可整体位移物理对象，保持物理世界不变。
     * 注意，仅会在 set worldRoot 时平移一次，其他情况请配合 updatePhysicsByWorldRoot 函数使用*/
    get worldRoot(): Sprite {
        return this._worldRoot || ILaya.stage;
    }

    set worldRoot(value: Sprite) {
        this._worldRoot = value;
        if (value) {
            //TODO：
            var p: Point = value.localToGlobal(Point.TEMP.setTo(0, 0));
            this._factory.shiftOrigin(-p.x, -p.y);
        }
    }

    /**
     * 设定 worldRoot 后，手动触发物理世界更新
     */
    updatePhysicsByWorldRoot() {
        if (!!this.worldRoot) {
            var p: Point = this.worldRoot.localToGlobal(Point.TEMP.setTo(0, 0));
            this._factory.shiftOrigin(-p.x, -p.y);
        }
    }
}

