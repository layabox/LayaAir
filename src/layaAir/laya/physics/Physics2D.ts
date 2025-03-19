import { EventDispatcher } from "../events/EventDispatcher"
import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { Physics2DOption } from "./Physics2DOption";
import { IPhysics2DFactory } from "./Factory/IPhysics2DFactory";
import { SingletonList } from "../utils/SingletonList";
import { RigidBody } from "./RigidBody";
import { Laya } from "../../Laya";
import { PlayerConfig } from "../../Config";

/**
 * @en 2D Physics Engine
 * @zh 2D物理引擎
 */
export class Physics2D extends EventDispatcher {

    private static _I: Physics2D;
    static Physics2D: any;

    /**
     * @en Gets the global singleton instance of the Physics2D.
     * @zh 获取全局的 Physics2D 单例。
     */
    static get I(): Physics2D {
        return Physics2D._I || (Physics2D._I = new Physics2D());
    }

    /** 是否已经激活*/
    private _enabled: boolean;

    /**
     * @internal
     * @en An empty body node for joints that do not require a node.
     * @zh 给不需要节点的关节使用的空的 body 节点。
     */
    _emptyBody: any;

    _factory: IPhysics2DFactory;

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
        //这里放到ISceneComponentManager里面init之后再去处理
        if (!this._enabled) {
            this._enabled = true;
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
        //这里考虑改成抽象工厂接口，destroyAllWorld来处理，在wasm里面实现的时候直接遍历worldList销毁全部box2DWorld
        // this._factory.destroyWorld();
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


    // 下面考虑也放到ISceneComponentManager里面去处理，在update里面设置重设根节点之后再更新这个方法
    /**
     * @en Manually triggers an update of the physics world after setting the `worldRoot`.
     * @zh 在设定 `worldRoot` 后，手动触发物理世界的更新。
     */
    // updatePhysicsByWorldRoot() {
    //     if (!!this.worldRoot) {
    //         var p: Point = this.worldRoot.localToGlobal(Point.TEMP.setTo(0, 0));
    //         this._factory.shiftOrigin(-p.x, -p.y);
    //     }
    // }
}

Laya.addInitCallback(() => Physics2D.I.enable());