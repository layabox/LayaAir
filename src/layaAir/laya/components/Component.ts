import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { NodeFlags } from "../Const";
import { Node } from "../display/Node"
import { Pool } from "../utils/Pool"
import { Utils } from "../utils/Utils";

/**
 * <code>Component</code> 类用于创建组件的基类。
 */
export class Component {
    /** @private */
    _id: number;
    /**@private */
    private _hideFlags: number = 0;
    /**@private */
    private _enableState: boolean;
    /** @internal */
    _status: number = 0; //1-awaked,2-starting,3-started,4-destroyed

    /**
     * 获取所属Node节点。
     */
    owner: Node;
    /** @internal */
    _enabled: boolean = true;
    /**
     * 是否单例，即同一个节点只能添加此类型的脚本一次
     */
    _singleton?: boolean = true;
    /**
     * 是否可以在IDE环境中运行
     */
    runInEditor: boolean;
    scriptPath: string;
    _extra: IComponentExtra;

    get hideFlags(): number {
        return this._hideFlags;
    }

    set hideFlags(value: number) {
        this._hideFlags = value;
    }

    /**
     * 创建一个新的 <code>Component</code> 实例。
     */
    constructor() {
        this._id = Utils.getGID();

        this._initialize();
    }

    //@internal
    _initialize(): void {
        this._extra = {};
    }

    hasHideFlag(flag: number): boolean {
        return (this._hideFlags & flag) != 0;
    }

    /**
     * 唯一标识ID。
     */
    get id(): number {
        return this._id;
    }

    /**
     * 是否启用组件。
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

    get awaked(): boolean {
        return this._status > 0;
    }

    /**
     * 是否已经销毁 。
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

    _setOwner(node: Node) {
        if (this._status != 0) {
            throw 'reuse a destroyed component';
        }
        this.owner = node;

        if (this._isScript())
            node._setBit(NodeFlags.HAS_SCRIPT, true);

        this._onAdded();
        this.onAdded();
    }

    /**
     * 被添加到节点后调用，可根据需要重写此方法
     * @internal
     */
    protected _onAdded(): void {
    }

    /**
   * 被激活后调用，可根据需要重写此方法
   * @internal
   */
    protected _onAwake(): void {
    }

    /**
     * 被激活后调用，可根据需要重写此方法
     * @internal
     */
    protected _onEnable(): void {
        this.onEnable();
    }

    /**
    * 被禁用时调用，可根据需要重写此方法
    * @internal
    * 销毁组件
    */
    protected _onDisable(): void {
        this.onDisable();
    }

    /**
     * 被销毁时调用，可根据需要重写此方法
     * @internal
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

    protected setupScript() {
    }

    /**
     * 销毁组件
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
     * 被添加到节点后调用，和Awake不同的是即使节点未激活onAdded也会调用。
     */
    onAdded(): void {
    }

    /**
     * 重置组件参数到默认值，如果实现了这个函数，则组件会被重置并且自动回收到对象池，方便下次复用
     * 如果没有重置，则不进行回收复用

     */
    onReset?(): void;

    /**
     * 组件被激活后执行，此时所有节点和组件均已创建完毕，次方法只执行一次
     */
    onAwake(): void {
    }

    /**
     * 组件被启用后执行，比如节点被添加到舞台后
     */
    onEnable(): void {
    }

    /**
     * 第一次执行update之前执行，只会执行一次
     */
    onStart?(): void;

    /**
     * 每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
     */
    onUpdate?(): void;

    /**
     * 每帧更新时执行，在update之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
     */
    onLateUpdate?(): void;

    /**
     * 渲染之前执行
     */
    onPreRender?(): void;

    /**
     * 渲染之后执行
     */
    onPostRender?(): void;

    /**
     * 组件被禁用时执行，比如从节点从舞台移除后
     */
    onDisable(): void {
    }

    /**
     * 手动调用节点销毁时执行
     */
    onDestroy(): void {
    }
}

export interface IComponentExtra { }