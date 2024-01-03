import { Sprite } from "../display/Sprite"
import { EventDispatcher } from "../events/EventDispatcher"
import { Point } from "../maths/Point"
import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { Physics2DOption } from "./Physics2DOption";
import { Vector2 } from "../maths/Vector2";
import { IPhysiscs2DFactory } from "./IPhysiscs2DFactory";
import { SingletonList } from "../utils/SingletonList";
import { RigidBody } from "./RigidBody";
import { Laya } from "../../Laya";

/**
 * 2D物理引擎
 */
export class Physics2D extends EventDispatcher {

    /**@private */
    private static _I: Physics2D;

    /**@private 是否已经激活*/
    private _enabled: boolean;

    /**@private 根容器*/
    private _worldRoot: Sprite;

    /**@private 空的body节点，给一些不需要节点的关节使用*/
    _emptyBody: any;
    /**@private */
    _eventList: any[] = [];

    _factory: IPhysiscs2DFactory;

    /**@private 需要同步实时跟新数据列表*/
    _rigiBodyList: SingletonList<RigidBody>;
    /**@private 需要同步物理数据的列表；使用后会及时释放*/
    _updataattributeLists: SingletonList<RigidBody>;

    /**全局物理单例*/
    static get I(): Physics2D {
        return Physics2D._I || (Physics2D._I = new Physics2D());
    }

    /**
     * 设置物理绘制
     */
    set enableDebugDraw(enable: boolean) {
        if (enable) {
            this._factory.createDebugDraw(this._factory.drawFlags_shapeBit);
        } else {
            this._factory.removeDebugDraw();
        }
    }

    /**
     * 是否绘制Shape
     */
    set drawShape(enable: boolean) {
        let flag = this._factory.drawFlags_shapeBit;
        if (enable) {
            this._factory.appendFlags(flag);
        } else {
            this._factory.clearFlags(flag);
        }
    }

    /**
     * 是否绘制Joint
     */
    set drawJoint(enable: boolean) {
        let flag = this._factory.drawFlags_jointBit;
        if (enable) {
            this._factory.appendFlags(flag);
        } else {
            this._factory.clearFlags(flag);
        }
    }

    /**
     * 是否绘制AABB
     */
    set drawAABB(enable: boolean) {
        let flag = this._factory.drawFlags_aabbBit;
        if (enable) {
            this._factory.appendFlags(flag);
        } else {
            this._factory.clearFlags(flag);
        }
    }

    /**
    * 是否绘制Pair
    */
    set drawPair(enable: boolean) {
        let flag = this._factory.drawFlags_pairBit;
        if (enable) {
            this._factory.appendFlags(flag);
        } else {
            this._factory.clearFlags(flag);
        }
    }

    /**
    * 是否绘制CenterOfMass
    */
    set drawCenterOfMass(enable: boolean) {
        let flag = this._factory.drawFlags_centerOfMassBit;
        if (enable) {
            this._factory.appendFlags(flag);
        } else {
            this._factory.clearFlags(flag);
        }
    }

    enable(): Promise<void> {
        if (this._factory) {
            return this._factory.initialize().then(() => {
                this.start();
                return Promise.resolve();
            });
        }
        else
            return Promise.resolve();
    }

    /**
    * 销毁当前物理世界
    */
    destroyWorld() {
        this._enabled = false;
        this._factory.destroyWorld();
        ILaya.physicsTimer.clear(this, this._update);
    }

    /**
     * 开启物理世界
     */
    start(): void {
        if (!this._enabled) {
            this._enabled = true;
            this._factory.start();
            this.allowSleeping = Physics2DOption.allowSleeping;
            this._emptyBody = this._factory.createBody(null);
        } else {
            ILaya.physicsTimer.clear(this, this._update);
        }

        if (Physics2DOption.debugDraw) {
            this.enableDebugDraw = true;
            this.drawShape = Physics2DOption.drawShape;
            this.drawJoint = Physics2DOption.drawJoint;
            this.drawAABB = Physics2DOption.drawAABB;
            this.drawCenterOfMass = Physics2DOption.drawCenterOfMass;
        } else {
            this.enableDebugDraw = false;
        }
        if (!this._rigiBodyList) this._rigiBodyList = new SingletonList<RigidBody>();
        else this._rigiBodyList.clear();

        if (!this._updataattributeLists) this._updataattributeLists = new SingletonList<RigidBody>();
        else this._updataattributeLists.clear();

        if (!Physics2DOption.customUpdate && LayaEnv.isPlaying)
            ILaya.physicsTimer.frameLoop(1, this, this._update);
    }

    /**@internal */
    addRigidBody(body: RigidBody) {
        this._rigiBodyList.add(body);
    }

    /**@internal */
    removeRigidBody(body: RigidBody) {
        this._rigiBodyList.remove(body);
    }

    /**@internal */
    updataRigidBodyAttribute(body: RigidBody) {
        this._updataattributeLists.add(body);
    }

    /**@internal */
    removeRigidBodyAttribute(body: RigidBody) {
        this._updataattributeLists.remove(body);
    }

    /**@private*/
    private _update(): void {
        //同步渲染世界参数到物理世界
        for (var i = 0, n = this._updataattributeLists.length; i < n; i++) {
            this._updataattributeLists.elements[i].updatePhysicsAttribute()
        }
        this._updataattributeLists.clear();
        //时间步太长，会导致错误穿透
        var delta = Math.min(ILaya.timer.delta / 1000, 0.033);
        this._factory.update(delta);
        //同步物理坐标到渲染坐标
        this._updatePhysicsTransformToRender();
        //同步事件
        var len: number = this._eventList.length;
        if (len > 0) {
            for (var i: number = 0; i < len; i += 2) {
                this._factory.sendEvent(this._eventList[i], this._eventList[i + 1]);
            }
            this._eventList.length = 0;
        }
    }

    /**@private*/
    _updatePhysicsTransformToRender() {
        for (var i = 0, n = this._rigiBodyList.length; i < n; i++) {
            this._rigiBodyList.elements[i].updatePhysicsTransformToRender()
        }
    }

    /**
     * 停止物理世界
     */
    stop(): void {
        this._rigiBodyList.clear();
        this._updataattributeLists.clear();
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

Laya.addInitCallback(() => Physics2D.I.enable());