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
import { PlayerConfig } from "../../Config";

/**
 * @en 2D Physics Engine
 * @zh 2D物理引擎
 */
export class Physics2D extends EventDispatcher {

    /**@internal */
    private static _I: Physics2D;

    /**
     * @en Gets the global singleton instance of the Physics2D.
     * @zh 获取全局的 Physics2D 单例。
     */
    static get I(): Physics2D {
        return Physics2D._I || (Physics2D._I = new Physics2D());
    }

    /**@internal 是否已经激活*/
    private _enabled: boolean;

    /**@internal 根容器*/
    private _worldRoot: Sprite;

    /**
     * @internal
     * @en An empty body node for joints that do not require a node.
     * @zh 给不需要节点的关节使用的空的 body 节点。
     */
    _emptyBody: any;

    /**@internal */
    _eventList: any[] = [];

    _factory: IPhysiscs2DFactory;

    /**
     * @internal
     * @en Need to synchronize and update the data list in real-time.
     * @zh 需要同步实时更新数据列表。
     */
    _rigiBodyList: SingletonList<RigidBody>;

    /**
     * @internal
     * @en List of bodies that need to synchronize physics data, which will be released in time.
     * @zh 需要同步物理数据的列表，使用后及时释放。
     */
    _updataattributeLists: SingletonList<RigidBody>;

    /**
     * @en whether to enable 2D phyiscs debug draw.
     * @zh 是否启用2D物理绘制
     */
    set enableDebugDraw(enable: boolean) {
        if (enable) {
            this._factory.createDebugDraw(this._factory.drawFlags_shapeBit);
        } else {
            this._factory.removeDebugDraw();
        }
    }

    /**
     * @en Whether to draw the shape.
     * @zh 是否绘制物理对象的形状。
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
     * @en Whether to draw the joints of physics objects.
     * @zh 是否绘制物理对象的关节。
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
     * @en Whether to draw the AABB of physics objects.
     * @zh 是否绘制物理对象的包围盒。
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
    * @en Whether to draw the collision pairs of the physics object.
    * @zh 是否绘制物理对象碰撞对。
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
     * @en Whether to draw the center of mass of physics objects.
     * @zh  是否绘制物理对象的质心。
     */
    set drawCenterOfMass(enable: boolean) {
        let flag = this._factory.drawFlags_centerOfMassBit;
        if (enable) {
            this._factory.appendFlags(flag);
        } else {
            this._factory.clearFlags(flag);
        }
    }

    /**
     * @en Whether the engine is allowed to sleep. Allowing the engine to sleep can improve stability and performance, but it usually comes at the cost of accuracy.
     * @zh 引擎是否允许休眠。允许引擎休眠可以提高稳定性和性能，但通常会牺牲准确性。
     */
    get allowSleeping(): boolean {
        return this._factory.allowSleeping;
    }

    set allowSleeping(value: boolean) {
        this._factory.allowSleeping = value;
    }

    /**
     * @en The gravity of the physics world. The default value is {x: 0, y: 9.8}.
     * Modifying the y direction to make the gravity upward can be done by setting `gravity.y` to -9.8 directly.
     * @zh 物理世界的重力环境。默认值为 {x: 0, y: 9.8}。
     * 如果要修改y方向使重力方向向上，可以直接设置 `gravity.y` 为 -9.8。
     */
    get gravity(): any {
        return this._factory.gravity;
    }

    set gravity(value: Vector2) {
        this._factory.gravity = value;
    }

    /**
     * @en The root container of the physics world. It serves as the coordinate system for the physics world and is used for coordinate transformations. The default value is the stage.
     * Setting a specific container allows for the collective movement of physical objects while keeping the physics world unchanged.
     * Note that translation will only occur once when setting `worldRoot`. For other situations, use it in conjunction with the `updatePhysicsByWorldRoot` function.
     * @zh 物理世界的根容器，它作为物理世界的坐标系，用于坐标变换，默认值是舞台（stage）。
     * 设置特定的容器后，可以整体移动物理对象，同时保持物理世界的坐标不变。
     * 注意，只有在设置 `worldRoot` 时才会平移一次，在其他情况下，请配合使用 `updatePhysicsByWorldRoot` 函数。
     */
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
     * @en The total number of rigid bodies.
     * @zh 刚体的总数量。
     */
    get bodyCount(): number {
        return this._factory.bodyCount;
    }

    /**
     * @en The total number of contacts.
     * @zh 碰撞的总数量。
     */
    get contactCount(): number {
        return this._factory.contactCount;
    }

    /**
     * @en The total number of joints.
     * @zh 关节的总数量。
     */
    get jointCount(): number {
        return this._factory.jointCount;
    }

    /**@internal */
    _addRigidBody(body: RigidBody) {
        this._rigiBodyList.add(body);
    }

    /**@internal */
    _removeRigidBody(body: RigidBody) {
        this._rigiBodyList.remove(body);
    }

    /**@internal */
    _updataRigidBodyAttribute(body: RigidBody) {
        this._updataattributeLists.add(body);
    }

    /**@internal */
    _removeRigidBodyAttribute(body: RigidBody) {
        this._updataattributeLists.remove(body);
    }

    /**@internal*/
    private _update(): void {
        //同步渲染世界参数到物理世界
        for (var i = 0, n = this._updataattributeLists.length; i < n; i++) {
            this._updataattributeLists.elements[i]._updatePhysicsAttribute()
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

    /**@internal */
    _updatePhysicsTransformToRender() {
        for (var i = 0, n = this._rigiBodyList.length; i < n; i++) {
            this._rigiBodyList.elements[i]._updatePhysicsTransformToRender()
        }
    }

    /**
     * @en Enables the physics world. This method initializes the physics engine and starts the simulation.
     * @zh 开启物理世界。此方法初始化物理引擎并启动模拟。
     */
    enable(): Promise<void> {
        if (this._factory) {
            if (PlayerConfig.physics2D != null)
                Object.assign(Physics2DOption, PlayerConfig.physics2D);

            return this._factory.initialize().then(() => {
                this.start();
                return Promise.resolve();
            });
        }
        else
            return Promise.resolve();
    }

    /**
     * @en Starts the physics world. This method is called after the physics engine is initialized.
     * @zh 开启物理世界。此方法在物理引擎初始化后被调用。
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

    /**
     * @en Destroys the current physics world.
     * @zh 销毁当前物理世界。
     */
    destroyWorld() {
        this._enabled = false;
        this._factory.destroyWorld();
        ILaya.physicsTimer.clear(this, this._update);
    }

    /**
     * @en Stops the physics world.
     * @zh 停止物理世界。
     */
    stop(): void {
        this._rigiBodyList.clear();
        this._updataattributeLists.clear();
        ILaya.physicsTimer.clear(this, this._update);
    }


    /**
     * @deprecated
     * 获得刚体总数量
     * use bodyCount instead
     */
    getBodyCount(): number {
        return this._factory.bodyCount;
    }

    /**
     * @deprecated 
     * 获得碰撞总数量
     * use contactCount instead
     */
    getContactCount(): number {
        return this._factory.contactCount;
    }

    /**
     *  @deprecated 
     *  获得关节总数量
     *  use jointCount instead
     */
    getJointCount(): number {
        return this._factory.jointCount;
    }

    /**
     * @en Manually triggers an update of the physics world after setting the `worldRoot`.
     * @zh 在设定 `worldRoot` 后，手动触发物理世界的更新。
     */
    updatePhysicsByWorldRoot() {
        if (!!this.worldRoot) {
            var p: Point = this.worldRoot.localToGlobal(Point.TEMP.setTo(0, 0));
            this._factory.shiftOrigin(-p.x, -p.y);
        }
    }
}

Laya.addInitCallback(() => Physics2D.I.enable());