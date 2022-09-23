import { NodeFlags } from "../Const"
import { Component } from "../components/Component"
import { Event } from "../events/Event"
import { EventDispatcher } from "../events/EventDispatcher"
import { Pool } from "../utils/Pool"
import { Stat } from "../utils/Stat"
import { Timer } from "../utils/Timer"
import { ILaya } from "../../ILaya";
import { ComponentDriver } from "../components/ComponentDriver";

const ARRAY_EMPTY: any[] = [];

/**
 * 添加到父对象后调度。
 * @eventType Event.ADDED
 */
/*[Event(name = "added", type = "laya.events.Event")]*/
/**
 * 被父对象移除后调度。
 * @eventType Event.REMOVED
 */
/*[Event(name = "removed", type = "laya.events.Event")]*/
/**
 * 加入节点树时调度。
 * @eventType Event.DISPLAY
 */
/*[Event(name = "display", type = "laya.events.Event")]*/
/**
 * 从节点树移除时调度。
 * @eventType Event.UNDISPLAY
 */
/*[Event(name = "undisplay", type = "laya.events.Event")]*/

/**
 *  <code>Node</code> 类是可放在显示列表中的所有对象的基类。该显示列表管理 Laya 运行时中显示的所有对象。使用 Node 类排列显示列表中的显示对象。Node 对象可以有子显示对象。
 */
export class Node extends EventDispatcher {
    /**@private */
    private _bits: number = 0;
    /**@private */
    private _hideFlags: number = 0;

    /**@internal 子对象集合，请不要直接修改此对象。*/
    _children: Node[] = ARRAY_EMPTY;
    /**@internal 仅仅用来处理输入事件的,并不是真正意义上的子对象 */
    _extUIChild: Node[] = ARRAY_EMPTY;
    /**@internal 父节点对象*/
    _parent: Node = null;
    /**@internal */
    _destroyed: boolean = false;
    /**@internal */
    _conchData: any;
    /**@internal */
    _componentDriver?: ComponentDriver;
    /**@internal */
    _is3D?: boolean;
    _url?: string;
    _extra?: INodeExtra;

    /**节点名称。*/
    name: string = "";

    /**
     * 如果节点从资源中创建，这里记录是他的url
     */
    get url(): string {
        return this._url;
    }

    /**
     * 设置资源的URL
     */
    set url(path: string) {
        this._url = path;
    }

    get hideFlags(): number {
        return this._hideFlags;
    }

    set hideFlags(value: number) {
        this._hideFlags = value;
    }

    /** 是否3D节点，即Scene3D和Sprite3D及其衍生类 */
    get is3D(): boolean {
        return this._is3D;
    }

    /** 是否已经销毁。对象销毁后不能再使用。*/
    get destroyed(): boolean {
        return this._destroyed;
    }

    constructor() {
        super();

        this._initialize();
    }

    //@internal
    _initialize(): void {
        this._extra = {};
    }

    /**@internal */
    _setBit(type: number, value: boolean): void {
        if (type === NodeFlags.DISPLAY) {
            var preValue: boolean = this._getBit(type);
            if (preValue != value) this._updateDisplayedInstage();
        }
        if (value) this._bits |= type;
        else this._bits &= ~type;
    }

    /**@internal */
    _getBit(type: number): boolean {
        return (this._bits & type) != 0;
    }

    /**@internal */
    _setUpNoticeChain(): void {
        if (this._getBit(NodeFlags.DISPLAY)) this._setBitUp(NodeFlags.DISPLAY);
    }

    /**@internal */
    _setBitUp(type: number): void {
        var ele: Node = this;
        ele._setBit(type, true);
        ele = ele._parent;
        while (ele) {
            if (ele._getBit(type)) return;
            ele._setBit(type, true);
            ele = ele._parent;
        }
    }

    protected onStartListeningToType(type: string) {
        if (type === Event.DISPLAY || type === Event.UNDISPLAY) {
            if (!this._getBit(NodeFlags.DISPLAY)) this._setBitUp(NodeFlags.DISPLAY);
        }
    }

    hasHideFlag(flag: number): boolean {
        return (this._hideFlags & flag) != 0;
    }

    /**
     * <p>销毁此对象。destroy对象默认会把自己从父节点移除，并且清理自身引用关系，等待js自动垃圾回收机制回收。destroy后不能再使用。</p>
     * <p>destroy时会移除自身的事情监听，自身的timer监听，移除子对象及从父节点移除自己。</p>
     * @param destroyChild	（可选）是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
     */
    destroy(destroyChild: boolean = true): void {
        this._destroyed = true;
        this.destroyAllComponent();
        this._parent && this._parent.removeChild(this);

        //销毁子节点
        if (this._children) {
            if (destroyChild) this.destroyChildren();
            else this.removeChildren();
        }
        this.onDestroy();

        this._children = null;

        //移除所有事件监听
        this.offAll();
    }

    /**
     * 销毁时执行
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onDestroy(): void {
        //trace("onDestroy node", this.name);
    }

    /**
     * 销毁所有子对象，不销毁自己本身。
     */
    destroyChildren(): void {
        //销毁子节点
        if (this._children) {
            //为了保持销毁顺序，所以需要正序销毁
            for (let i = 0, n = this._children.length; i < n; i++) {
                this._children[0] && this._children[0].destroy(true);
            }
        }
    }


    /**
     * 添加子节点。
     * @param	node 节点对象
     * @return	返回添加的节点
     */
    addChild<T extends Node>(node: T): T {
        if (!node || this._destroyed || node as any === this) return node;
        if ((<any>node)._zOrder) this._setBit(NodeFlags.HAS_ZORDER, true);
        if (node._parent === this) {
            var index: number = this.getChildIndex(node);
            if (index !== this._children.length - 1) {
                this._children.splice(index, 1);
                this._children.push(node);
                this._childChanged();
            }
        } else {
            node._parent && node._parent.removeChild(node);
            this._children === ARRAY_EMPTY && (this._children = []);
            this._children.push(node);
            node._setParent(this);
        }

        return node;
    }

    addInputChild(node: Node): Node {
        if (this._extUIChild == ARRAY_EMPTY) {
            this._extUIChild = [node];
        } else {
            if (this._extUIChild.indexOf(node) >= 0) {
                return null;
            }
            this._extUIChild.push(node);
        }
        return null;
    }

    removeInputChild(node: Node): void {
        var idx: number = this._extUIChild.indexOf(node);
        if (idx >= 0) {
            this._extUIChild.splice(idx, 1);
        }
    }

    /**
     * 批量增加子节点
     * @param	...args 无数子节点。
     */
    addChildren(...args: any[]): void {
        var i: number = 0, n: number = args.length;
        while (i < n) {
            this.addChild(args[i++]);
        }
    }

    /**
     * 添加子节点到指定的索引位置。
     * @param	node 节点对象。
     * @param	index 索引位置。
     * @return	返回添加的节点。
     */
    addChildAt(node: Node, index: number): Node {
        if (!node || this._destroyed || node === this) return node;
        if ((<any>node)._zOrder) this._setBit(NodeFlags.HAS_ZORDER, true);
        if (index >= 0 && index <= this._children.length) {
            if (node._parent === this) {
                var oldIndex: number = this.getChildIndex(node);
                this._children.splice(oldIndex, 1);
                this._children.splice(index, 0, node);
                this._childChanged();
            } else {
                node._parent && node._parent.removeChild(node);
                this._children === ARRAY_EMPTY && (this._children = []);
                this._children.splice(index, 0, node);
                node._setParent(this);
            }
            return node;
        } else {
            throw new Error("appendChildAt:The index is out of bounds");
        }
    }

    /**
     * 根据子节点对象，获取子节点的索引位置。
     * @param	node 子节点。
     * @return	子节点所在的索引位置。
     */
    getChildIndex(node: Node): number {
        return this._children.indexOf(node);
    }

    /**
     * 根据子节点的名字，获取子节点对象。
     * @param	name 子节点的名字。
     * @return	节点对象。
     */
    getChildByName(name: string): Node {
        var nodes: any[] = this._children;
        if (nodes) {
            for (var i: number = 0, n: number = nodes.length; i < n; i++) {
                var node: Node = nodes[i];
                if (!node) continue;
                if (node.name === name) return node;
            }
        }
        return null;
    }

    /**
     * 根据子节点的索引位置，获取子节点对象。
     * @param	index 索引位置
     * @return	子节点
     */
    getChildAt(index: number): Node {
        return this._children[index] || null;
    }

    /**
     * 设置子节点的索引位置。
     * @param	node 子节点。
     * @param	index 新的索引。
     * @return	返回子节点本身。
     */
    setChildIndex(node: Node, index: number): Node {
        var childs: any[] = this._children;
        if (index < 0 || index >= childs.length) {
            throw new Error("setChildIndex:The index is out of bounds.");
        }

        var oldIndex: number = this.getChildIndex(node);
        if (oldIndex < 0) throw new Error("setChildIndex:node is must child of this object.");
        childs.splice(oldIndex, 1);
        childs.splice(index, 0, node);
        this._childChanged();
        return node;
    }

    /**
     * 子节点发生改变。
     * @private
     * @param	child 子节点。
     */
    protected _childChanged(child: Node = null): void {

    }

    /**
     * 删除子节点。
     * @param	node 子节点
     * @return	被删除的节点
     */
    removeChild(node: Node): Node {
        if (!this._children) return node;
        var index: number = this._children.indexOf(node);
        return this.removeChildAt(index);
    }

    /**
     * 从父容器删除自己，如已经被删除不会抛出异常。
     * @return 当前节点（ Node ）对象。
     */
    removeSelf(): Node {
        this._parent && this._parent.removeChild(this);
        return this;
    }

    /**
     * 根据子节点名字删除对应的子节点对象，如果找不到不会抛出异常。
     * @param	name 对象名字。
     * @return 查找到的节点（ Node ）对象。
     */
    removeChildByName(name: string): Node {
        var node: Node = this.getChildByName(name);
        node && this.removeChild(node);
        return node;
    }

    /**
     * 根据子节点索引位置，删除对应的子节点对象。
     * @param	index 节点索引位置。
     * @return	被删除的节点。
     */
    removeChildAt(index: number): Node {
        var node: Node = this.getChildAt(index);
        if (node) {
            this._children.splice(index, 1);
            node._setParent(null);
        }
        return node;
    }

    /**
     * 删除指定索引区间的所有子对象。
     * @param	beginIndex 开始索引。
     * @param	endIndex 结束索引。
     * @return 当前节点对象。
     */
    removeChildren(beginIndex: number = 0, endIndex: number = 0x7fffffff): Node {
        if (this._children && this._children.length > 0) {
            var childs: any[] = this._children;
            if (beginIndex === 0 && endIndex >= childs.length - 1) {
                var arr: any[] = childs;
                this._children = ARRAY_EMPTY;
            } else {
                arr = childs.splice(beginIndex, endIndex - beginIndex + 1);
            }
            for (var i: number = 0, n: number = arr.length; i < n; i++) {
                arr[i]._setParent(null);
            }
        }
        return this;
    }

    /**
     * 替换子节点。
     * 将传入的新节点对象替换到已有子节点索引位置处。
     * @param	newNode 新节点。
     * @param	oldNode 老节点。
     * @return	返回新节点。
     */
    replaceChild(newNode: Node, oldNode: Node): Node {
        var index: number = this._children.indexOf(oldNode);
        if (index > -1) {
            this._children.splice(index, 1, newNode);
            oldNode._setParent(null);
            newNode._setParent(this);
            return newNode;
        }
        return null;
    }

    /**
     * 子对象数量。
     */
    get numChildren(): number {
        return this._children.length;
    }

    /**父节点。*/
    get parent(): Node {
        return this._parent;
    }

    /**检查本节点是否是某个节点的上层节点
     * @param node
     * @return
     */
    isAncestorOf(node: Node): boolean {
        let p = node.parent;
        while (p) {
            if (p == this)
                return true;

            p = p.parent;
        }
        return false;
    };

    /**@private */
    protected _setParent(value: Node): void {
        if (this._parent !== value) {
            if (value) {
                this._parent = value;
                //如果父对象可见，则设置子对象可见
                this._onAdded();
                this.event(Event.ADDED);
                if (this._getBit(NodeFlags.DISPLAY)) {
                    this._setUpNoticeChain();
                    value.displayedInStage && this._displayChild(this, true);
                }
                value._childChanged(this);
            } else {
                //设置子对象不可见
                this._onRemoved();
                this.event(Event.REMOVED);
                let p = this._parent;
                if (this._getBit(NodeFlags.DISPLAY)) this._displayChild(this, false);
                this._parent = value;
                p._childChanged(this);
            }
        }
    }

    /**表示是否在显示列表中显示。*/
    get displayedInStage(): boolean {
        if (this._getBit(NodeFlags.DISPLAY)) return this._getBit(NodeFlags.DISPLAYED_INSTAGE);
        this._setBitUp(NodeFlags.DISPLAY);
        return this._getBit(NodeFlags.DISPLAYED_INSTAGE);
    }

    /**@private */
    private _updateDisplayedInstage(): void {
        var ele: Node;
        ele = this;
        var stage: Node = ILaya.stage;
        var displayedInStage: boolean = false;
        while (ele) {
            if (ele._getBit(NodeFlags.DISPLAY)) {
                displayedInStage = ele._getBit(NodeFlags.DISPLAYED_INSTAGE);
                break;
            }
            if (ele === stage || ele._getBit(NodeFlags.DISPLAYED_INSTAGE)) {
                displayedInStage = true;
                break;
            }
            ele = ele._parent;
        }
        this._setBit(NodeFlags.DISPLAYED_INSTAGE, displayedInStage);
    }

    /**@internal */
    _setDisplay(value: boolean): void {
        if (this._getBit(NodeFlags.DISPLAYED_INSTAGE) !== value) {
            this._setBit(NodeFlags.DISPLAYED_INSTAGE, value);
            if (value) this.event(Event.DISPLAY);
            else this.event(Event.UNDISPLAY);
        }
    }

    /**
     * 设置指定节点对象是否可见(是否在渲染列表中)。
     * @private
     * @param	node 节点。
     * @param	display 是否可见。
     */
    private _displayChild(node: Node, display: boolean): void {
        var childs: any[] = node._children;
        if (childs) {
            for (var i: number = 0, n: number = childs.length; i < n; i++) {
                var child: Node = childs[i];
                if (!child) continue;
                if (!child._getBit(NodeFlags.DISPLAY)) continue;
                if (child._children.length > 0) {
                    this._displayChild(child, display);
                } else {
                    child._setDisplay(display);
                }
            }
        }
        node._setDisplay(display);
    }

    /**
     * 当前容器是否包含指定的 <code>Node</code> 节点对象 。
     * @param	node  指定的 <code>Node</code> 节点对象 。
     * @return	一个布尔值表示是否包含指定的 <code>Node</code> 节点对象 。
     */
    contains(node: Node): boolean {
        if (node === this) return true;
        while (node) {
            if (node._parent === this) return true;
            node = node._parent;
        }
        return false;
    }

    /**
     * 定时重复执行某函数。功能同Laya.timer.timerLoop()。
     * @param	delay		间隔时间(单位毫秒)。
     * @param	caller		执行域(this)。
     * @param	method		结束时的回调方法。
     * @param	args		（可选）回调参数。
     * @param	coverBefore	（可选）是否覆盖之前的延迟执行，默认为true。
     * @param	jumpFrame 时钟是否跳帧。基于时间的循环回调，单位时间间隔内，如能执行多次回调，出于性能考虑，引擎默认只执行一次，设置jumpFrame=true后，则回调会连续执行多次
     */
    timerLoop(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true, jumpFrame: boolean = false): void {
        this.timer.loop(delay, caller, method, args, coverBefore, jumpFrame);
    }

    /**
     * 定时执行某函数一次。功能同Laya.timer.timerOnce()。
     * @param	delay		延迟时间(单位毫秒)。
     * @param	caller		执行域(this)。
     * @param	method		结束时的回调方法。
     * @param	args		（可选）回调参数。
     * @param	coverBefore	（可选）是否覆盖之前的延迟执行，默认为true。
     */
    timerOnce(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this.timer._create(false, false, delay, caller, method, args, coverBefore);
    }

    /**
     * 定时重复执行某函数(基于帧率)。功能同Laya.timer.frameLoop()。
     * @param	delay		间隔几帧(单位为帧)。
     * @param	caller		执行域(this)。
     * @param	method		结束时的回调方法。
     * @param	args		（可选）回调参数。
     * @param	coverBefore	（可选）是否覆盖之前的延迟执行，默认为true。
     */
    frameLoop(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this.timer._create(true, true, delay, caller, method, args, coverBefore);
    }

    /**
     * 定时执行一次某函数(基于帧率)。功能同Laya.timer.frameOnce()。
     * @param	delay		延迟几帧(单位为帧)。
     * @param	caller		执行域(this)
     * @param	method		结束时的回调方法
     * @param	args		（可选）回调参数
     * @param	coverBefore	（可选）是否覆盖之前的延迟执行，默认为true
     */
    frameOnce(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this.timer._create(true, false, delay, caller, method, args, coverBefore);
    }

    /**
     * 清理定时器。功能同Laya.timer.clearTimer()。
     * @param	caller 执行域(this)。
     * @param	method 结束时的回调方法。
     */
    clearTimer(caller: any, method: Function): void {
        this.timer.clear(caller, method);
    }

    /**
     * <p>延迟运行指定的函数。</p>
     * <p>在控件被显示在屏幕之前调用，一般用于延迟计算数据。</p>
     * @param method 要执行的函数的名称。例如，functionName。
     * @param args 传递给 <code>method</code> 函数的可选参数列表。
     *
     * @see #runCallLater()
     */
    callLater(method: Function, args: any[] = null): void {
        this.timer.callLater(this, method, args);
    }

    /**
     * <p>如果有需要延迟调用的函数（通过 <code>callLater</code> 函数设置），则立即执行延迟调用函数。</p>
     * @param method 要执行的函数名称。例如，functionName。
     * @see #callLater()
     */
    runCallLater(method: Function): void {
        this.timer.runCallLater(this, method);
    }

    //============================组件化支持==============================
    /** @private */
    protected _components: Component[];
    /**@private */
    private _activeChangeScripts: Component[];


    _scene: Node;

    /**
     * 获得所属场景。
     * @return	场景。
     */
    get scene(): any {
        return this._scene;
    }

    /**
     * 获取自身是否激活。
     *   @return	自身是否激活。
     */
    get active(): boolean {
        return !this._getBit(NodeFlags.NOT_READY) && !this._getBit(NodeFlags.NOT_ACTIVE);
    }

    /**
     * 设置是否激活。
     * @param	value 是否激活。
     */
    set active(value: boolean) {
        value = !!value;
        if (!this._getBit(NodeFlags.NOT_ACTIVE) !== value) {
            if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
                if (value)
                    throw "Node: can't set the main inActive node active in hierarchy,if the operate is in main inActive node or it's children script's onDisable Event.";
                else
                    throw "Node: can't set the main active node inActive in hierarchy,if the operate is in main active node or it's children script's onEnable Event.";
            } else {
                this._setBit(NodeFlags.NOT_ACTIVE, !value);
                if (this._parent) {
                    if (this._parent.activeInHierarchy) {
                        if (value) this._processActive();
                        else this._processInActive();
                    }
                }

            }
        }

    }

    /**
     * 获取在场景中是否激活。
     *   @return	在场景中是否激活。
     */
    get activeInHierarchy(): boolean {
        return this._getBit(NodeFlags.ACTIVE_INHIERARCHY);
    }

    /**
     * @private
     */
    protected _onActive(): void {
        Stat.spriteCount++;
    }

    /**
     * @private
     */
    protected _onInActive(): void {
        Stat.spriteCount--;
    }

    /**
     * @private
     */
    protected _onActiveInScene(): void {
        //override it.
    }

    /**
     * @private
     */
    protected _onInActiveInScene(): void {
        //override it.
    }

    /**
    * 组件被激活后执行，此时所有节点和组件均已创建完毕，次方法只执行一次
    * 此方法为虚方法，使用时重写覆盖即可
    */
    onAwake(): void {
        //this.name  && trace("onAwake node ", this.name);
    }

    /**
     * 组件被启用后执行，比如节点被添加到舞台后
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onEnable(): void {
        //this.name  && trace("onEnable node ", this.name);
    }

    /**
     * 组件被禁用时执行，比如从节点从舞台移除后
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onDisable(): void {
        //trace("onDisable node", this.name);
    }

    /**
     * @internal
     */
    _parse(data: any, spriteMap: any): void {
        //override it.
    }

    /**
     * @internal
     */
    _setBelongScene(scene: Node): void {
        if (!this._scene || this.scene != scene) {
            this._scene = scene;
            this._onActiveInScene();
            for (var i: number = 0, n: number = this._children.length; i < n; i++)
                this._children[i]._setBelongScene(scene);
        }
    }

    /**
     * @internal
     */
    _setUnBelongScene(): void {
        if (this._scene !== this) {//移除节点本身是scene不继续派发
            this._onInActiveInScene();
            this._scene = null;
            for (var i: number = 0, n: number = this._children.length; i < n; i++)
                this._children[i]._setUnBelongScene();
        }
    }

    /**
     * @internal
     */
    _processActive(): void {
        (this._activeChangeScripts) || (this._activeChangeScripts = []);
        this._activeHierarchy(this._activeChangeScripts);//处理属性,保证属性的正确性和即时性
        this._activeScripts();//延时处理组件
    }

    /**
     * @internal
     */
    _activeHierarchy(activeChangeScripts: any[]): void {
        this._setBit(NodeFlags.ACTIVE_INHIERARCHY, true);
        if (this._components) {
            for (let i = 0, n = this._components.length; i < n; i++) {
                let comp = this._components[i];
                if (comp._isScript())
                    (comp._enabled) && (activeChangeScripts.push(comp));
                else
                    comp._setActive(true);
            }
        }

        this._onActive();
        for (let i = 0, n = this._children.length; i < n; i++) {
            let child = this._children[i];
            (!child._getBit(NodeFlags.NOT_ACTIVE) && !child._getBit(NodeFlags.NOT_READY)) && (child._activeHierarchy(activeChangeScripts));
        }
        if (!this._getBit(NodeFlags.AWAKED)) {
            this._setBit(NodeFlags.AWAKED, true);
            this.onAwake();
        }
        this.onEnable();
    }

    /**
     * @private
     */
    private _activeScripts(): void {
        let arr = this._activeChangeScripts;
        for (let i = 0, n = arr.length; i < n; i++) {
            let comp = arr[i];
            comp.owner && comp._setActive(true);
        }
        arr.length = 0;
    }

    /**
     * @private
     */
    private _processInActive(): void {
        (this._activeChangeScripts) || (this._activeChangeScripts = []);
        this._inActiveHierarchy(this._activeChangeScripts);//处理属性,保证属性的正确性和即时性
        this._inActiveScripts();//延时处理组件
    }

    /**
     * @internal
     */
    _inActiveHierarchy(activeChangeScripts: any[]): void {
        this._onInActive();
        if (this._components) {
            for (let i = 0, n = this._components.length; i < n; i++) {
                let comp = this._components[i];
                if (comp._isScript())
                    comp._enabled && (activeChangeScripts.push(comp));
                else
                    comp._setActive(false);
            }
        }
        this._setBit(NodeFlags.ACTIVE_INHIERARCHY, false);

        for (let i = 0, n = this._children.length; i < n; i++) {
            let child = this._children[i];
            (child && !child._getBit(NodeFlags.NOT_ACTIVE)) && (child._inActiveHierarchy(activeChangeScripts));
        }
        this.onDisable();
    }

    /**
     * @private
     */
    private _inActiveScripts(): void {
        let arr = this._activeChangeScripts;
        for (let i = 0, n = arr.length; i < n; i++) {
            let comp = arr[i];
            comp.owner && comp._setActive(false);
        }
        arr.length = 0;
    }

    /**
     * @private
     */
    protected _onAdded(): void {
        if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
            throw "Node: can't set the main inActive node active in hierarchy,if the operate is in main inActive node or it's children script's onDisable Event.";
        } else {
            let parentScene = this._parent.scene;
            parentScene && this._setBelongScene(parentScene);
            (this._parent.activeInHierarchy && this.active) && this._processActive();
        }
    }

    /**
     * @private
     */
    protected _onRemoved(): void {
        if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
            throw "Node: can't set the main active node inActive in hierarchy,if the operate is in main active node or it's children script's onEnable Event.";
        } else {
            (this._parent.activeInHierarchy && this.active) && this._processInActive();
            this._parent.scene && this._setUnBelongScene();
        }
    }

    /**
     * @internal
     */
    _addComponentInstance(comp: Component): void {
        if (!this._components)
            this._components = [];
        this._components.push(comp);

        comp._setOwner(this);
        if (this.activeInHierarchy)
            comp._setActive(true);
        this._componentsChanged?.(comp, 0);
    }

    /**
     * @internal
     */
    _destroyComponent(comp: Component) {
        if (!this._components)
            return;

        let i = this._components.indexOf(comp);
        if (i != -1) {
            this._components.splice(i, 1);
            comp._destroy();
            this._componentsChanged?.(comp, 1);
        }
    }

    /**
     * @internal
     */
    private destroyAllComponent(): void {
        if (!this._components)
            return;

        for (let i = 0, n = this._components.length; i < n; i++) {
            let item = this._components[i];
            item && !item.destroyed && item._destroy();
        }
        this._components.length = 0;
        this._componentsChanged?.(null, 2);
    }

    /**
     * 组件列表发生改变。
     * @private
     */
    protected _componentsChanged?(comp: Component, action: 0 | 1 | 2): void;

    /**
     * @internal 克隆。
     * @param	destObject 克隆源。
     */
    _cloneTo(destObject: any, srcRoot: Node, dstRoot: Node): void {
        var destNode: Node = (<Node>destObject);
        if (this._components) {
            for (let i = 0, n = this._components.length; i < n; i++) {
                var destComponent = destNode.addComponent((this._components[i] as any).constructor);
                this._components[i]._cloneTo(destComponent);
            }
        }
    }


    /**
     * 添加组件实例。
     * @param	component 组建实例。
     * @return	组件。
     */
    addComponentInstance(component: Component): Component {
        if (component.owner)
            throw "Node:the component has belong to other node.";
        if (component._singleton && this.getComponent(((<any>component)).constructor))
            throw "Node:the component is singleton, can't add the second one.";
        this._addComponentInstance(component);
        return component;
    }

    /**
     * 添加组件。
     * @param	componentType 组件类型。
     * @return	组件。
     */
    addComponent<T extends Component>(componentType: new () => T): T {
        let comp: T = Pool.createByClass(componentType);
        if (!comp) {
            throw componentType.toString() + "组件不存在";
        }

        if (comp._singleton && this.getComponent(componentType))
            throw "无法实例" + componentType + "组件" + "，" + componentType + "组件已存在！";
        this._addComponentInstance(comp);
        return comp;
    }

    /**
     * 获得组件实例，如果没有则返回为null
     * @param	componentType 组建类型
     * @return	返回组件
     */
    getComponent<T extends Component>(componentType: new () => T): T {
        if (this._components) {
            for (let i = 0, n = this._components.length; i < n; i++) {
                let comp = this._components[i];
                if (comp instanceof componentType)
                    return comp;
            }
        }
        return null;
    }

    /**
     * 返回所有组件实例。
     * @return 返回组件实例数组。
     */
    get components(): ReadonlyArray<Component> {
        return this._components || ARRAY_EMPTY;
    }

    /**
     * 获得组件实例，如果没有则返回为null
     * @param	componentType 组件类型
     * @return	返回组件数组
     */
    getComponents(componentType: typeof Component): Component[] {
        var arr: any[];
        if (this._components) {
            for (let i = 0, n = this._components.length; i < n; i++) {
                let comp = this._components[i];
                if (comp instanceof componentType) {
                    arr = arr || [];
                    arr.push(comp);
                }
            }
        }
        return arr;
    }

    /**
     * 获取timer
     */
    get timer(): Timer {
        return this._scene ? this._scene.timer : ILaya.timer;
    }
}

export interface INodeExtra { }