import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { NodeFlags } from "../Const";
import { Node } from "../display/Node"
import { Pool } from "../utils/Pool"
import { Utils } from "../utils/Utils";

/**
 * @en The Component class is used to create the base class for components.
 * @zh Component 类用于创建组件的基类。
 */
export class Component {
    /**
     * @private
     * @internal
     * @en Unique identifier for the component.
     * @zh 组件的唯一标识。
     */
    _id: number;
    /**@private */
    private _hideFlags: number = 0;
    /**@private */
    private _enableState: boolean;
    /** @internal */
    _status: number = 0; //1-awaked,2-starting,3-started,4-destroyed

    /**
     * @en Gets the owner Node to which the component belongs.
     * @zh 获取组件所属的 Node 节点。
     */
    owner: Node;
    /** @internal */
    _enabled: boolean = true;

    /**
     * @internal
     * @en Whether the component is a singleton, meaning only one instance of this type of script can be added to the same node.
     * @zh 是否为单例，即同一个节点只能添加此类型的脚本一次。
     */
    _singleton: boolean;

    /**
     * @internal
     * @en Whether the script can run in the IDE environment.
     * @zh 是否可以在 IDE 环境中运行。
     */
    runInEditor: boolean;

    /**
     * @internal
     * @en The path of the script file.
     * @zh 脚本文件的路径。
     */
    scriptPath: string;

    /**
     * @en Extra data of the node.
     * @zh 组件的额外数据。IDE内部使用。
     */
    _extra: IComponentExtra;

    /**
     * @en The hide flags that determine the hiding behavior of the component.
     * @zh 确定组件隐藏行为的标志。
     */
    get hideFlags(): number {
        return this._hideFlags;
    }

    set hideFlags(value: number) {
        this._hideFlags = value;
    }

    /**
     * @en Constructor method of Component.
     * @zh 组件的构造方法
     */
    constructor() {
        this._id = Utils.getGID();
        this._singleton = Object.getPrototypeOf(this)._$singleton ?? true;

        this._initialize();
    }

    /**
     * @internal
     * @en used in IDE
     * @zh 在IDE中使用。
     * */
    _initialize(): void {
        this._extra = {};
    }

    /**
     * @en Checks if the component has a specific hide flag set.
     * @param flag The hide flag to check for.
     * @zh 检查组件是否设置了特定的隐藏标志。
     * @param flag 要检查的隐藏标志。
     */
    hasHideFlag(flag: number): boolean {
        return (this._hideFlags & flag) != 0;
    }

    /**
     * @en The unique identifier for the component.
     * @zh 组件的唯一标识。
     */
    get id(): number {
        return this._id;
    }

    /**
     * @en whether the component is enabled.
     * @zh 是否启用组件。
     */
    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        if (this._enabled != value) {
            this._enabled = value;
            if (this.owner)
                this._setActive(value && this.owner.activeInHierarchy);
        }
    }

    /**
     * @en whether the component has been awakened.
     * @zh 组件是否已经被唤醒。
     */
    get awaked(): boolean {
        return this._status > 0;
    }

    /**
     * @en whether the component has been destroyed.
     * @zh 组件是否已经被销毁。
     */
    get destroyed(): boolean {
        return this._status == 4;
    }

    /**
     * @internal
     */
    _isScript(): boolean {
        return false;
    }
    /**
     * @internal
     */
    protected _resetComp(): void {
        this._enabled = true;
        this._status = 0;
        this._enableState = false;
        this.owner = null;
    }

    /**
     * @internal
     * @en Sets the owner Node of the component.
     * @param node The Node that now owns the component.
     * @zh 设置组件所属的 Node 节点。
     * @param node 现在拥有该组件的 Node。
     */
    _setOwner(node: Node) {
        if (this._status != 0) {
            throw new Error('reuse a destroyed component');
        }
        this.owner = node;

        if (this._isScript())
            node._setBit(NodeFlags.HAS_SCRIPT, true);

        this._onAdded();
        this.onAdded();
    }

    /**
     * @internal
     * 被添加到节点后调用，可根据需要重写此方法
     */
    protected _onAdded(): void {
    }

    /**
     * @internal
     * 被激活后调用，可根据需要重写此方法
     */
    protected _onAwake(): void {
    }

    /**
     * @internal
     * 被激活后调用，可根据需要重写此方法
     */
    protected _onEnable(): void {
        this.onEnable();
    }

    /**
     * @internal
     * 被禁用时调用，可根据需要重写此方法
     * 销毁组件
     */
    protected _onDisable(): void {
        this.onDisable();
    }

    /**
     * @internal
     * 被销毁时调用，可根据需要重写此方法
     */
    protected _onDestroy(): void {
    }

    /**
     * @internal
     */
    _parse(data: any, interactMap: any = null): void {
        //override it.
    }

    /**
     * @internal
     */
    _parseInteractive(data: any = null, spriteMap: any = null) {
        //override it.
    }

    /**
     * @internal
     */
    _cloneTo(dest: Component): void {
        //override it.
    }

    /**
     * @internal
     */
    _setActive(value: boolean): void {
        if (value) {
            if (this._status == 0) {
                this._status = 1;

                if (LayaEnv.isPlaying || this.runInEditor) {
                    this._onAwake();
                    this.onAwake();
                }
            }
            if (this._enabled && !this._enableState) {
                this._enableState = true;

                if (LayaEnv.isPlaying || this.runInEditor) {
                    let driver = (this.owner._is3D && this.owner._scene)?._componentDriver || ILaya.stage._componentDriver;
                    driver.add(this);

                    if (LayaEnv.isPlaying && this._isScript())
                        this.setupScript();

                    this._onEnable();
                }
            }
        } else if (this._enableState) {
            this._enableState = false;
            if (LayaEnv.isPlaying || this.runInEditor) {
                let driver = (this.owner._is3D && this.owner._scene)?._componentDriver || ILaya.stage._componentDriver;
                driver.remove(this);

                ILaya.stage.offAllCaller(this);

                this._onDisable();
            }
        }
    }

    /**
     * @internal
     */
    protected setupScript() {
    }

    /**
     * @en Destroy components
     * @zh 销毁组件
     */
    destroy(): void {
        if (this._status == 4)
            return;

        if (this.owner)
            this.owner._destroyComponent(this);
        else if (!this.destroyed)
            this._destroy(true);
    }

    /**
     * @internal
     */
    _destroy(second?: boolean): void {
        if (second) {
            if (LayaEnv.isPlaying || this.runInEditor) {
                this._onDestroy();
                this.onDestroy();

                if (this.onReset) {
                    this.onReset();
                    this._resetComp();
                    Pool.recoverByClass(this);
                }
            }
            return;
        }

        this._setActive(false);
        this._status = 4;

        if (LayaEnv.isPlaying || this.runInEditor) {
            let driver = (this.owner._is3D && this.owner._scene)?._componentDriver || ILaya.stage._componentDriver;
            driver._toDestroys.add(this);
        }
    }

    /**
     * @en Called after the component is added to a node. Unlike Awake, onAdded is called even if the node is not active.
     * @zh 组件被添加到节点后调用，与 onAwake 不同的是，即使节点未激活也会调用 onAdded。
     */
    onAdded(): void {
    }

    /**
     * @en Resets the component's parameters to their default values. If this function is implemented, the component will be reset and automatically recycled for future use.
     * If not reset, it will not be recycled for reuse.
     * @zh 将组件的参数重置为默认值。如果实现了这个函数，组件将被重置并自动回收到对象池，方便下次复用。
     * 如果没有重置，则不会进行回收复用。
     */
    onReset?(): void;

    /**
     * @en Executed after the component is activated. At this point, all nodes and components have been created. This method is executed only once.
     * @zh 组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次。
     */
    onAwake(): void {
    }

    /**
     * @en Executed after the component is enabled, such as when the node is added to the stage.
     * @zh 组件被启用后执行，比如节点被添加到舞台后。
     */
    onEnable(): void {
    }

    /**
     * @en Executed once, before the first update.
     * @zh 在第一次执行 update 之前执行，只会执行一次。
     */
    onStart?(): void;

    /**
     * @en Executed every frame during the update phase. Avoid writing complex loop logic or using the getComponent method here.
     * @zh 每帧更新时执行，在 update 阶段。尽量不要在这里写大循环逻辑或使用 getComponent 方法。
     */
    onUpdate?(): void;

    /**
     * @en Executed every frame during the late update phase, after the update phase.
     * @zh 每帧更新时执行，在 late update 阶段，update 阶段之后。
     */
    onLateUpdate?(): void;

    /**
     * @en Executed before rendering.
     * @zh 渲染之前执行。
     */
    onPreRender?(): void;

    /**
     * @en Executed after rendering.
     * @zh 渲染之后执行。
     */
    onPostRender?(): void;

    /**
     * @en Executed when the component is disabled, such as when the node is removed from the stage.
     * @zh 组件被禁用时执行，比如从节点从舞台移除后。
     */
    onDisable(): void {
    }

    /**
     * @en Executed when the node is destroyed manually.
     * @zh 手动调用节点销毁时执行。
     */
    onDestroy(): void {
    }
}

export interface IComponentExtra { }