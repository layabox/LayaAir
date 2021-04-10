import { Const } from "../Const"
import { Component } from "../components/Component"
import { Event } from "../events/Event"
import { EventDispatcher } from "../events/EventDispatcher"
import { Pool } from "../utils/Pool"
import { Stat } from "../utils/Stat"
import { Timer } from "../utils/Timer"
import { Sprite } from "./Sprite";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

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
    protected static ARRAY_EMPTY: any[] = [];
    /**@private */
    private _bits: number = 0;
    /**@internal 子对象集合，请不要直接修改此对象。*/
    _children: any[] = Node.ARRAY_EMPTY;

    /**@internal 仅仅用来处理输入事件的,并不是真正意义上的子对象 */
    _extUIChild: any[] = Node.ARRAY_EMPTY;

    /**@internal 父节点对象*/
    _parent: Node = null;

    /**节点名称。*/
    name: string = "";
    /**[只读]是否已经销毁。对象销毁后不能再使用。*/
    destroyed: boolean = false;
    /**@internal */
    _conchData: any;

    constructor() {
        super();
        this.createGLBuffer();
    }

    createGLBuffer(): void {
    }

    /**@internal */
    _setBit(type: number, value: boolean): void {
        if (type === Const.DISPLAY) {
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
        if (this._getBit(Const.DISPLAY)) this._setBitUp(Const.DISPLAY);
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

    /**
     * <p>增加事件侦听器，以使侦听器能够接收事件通知。</p>
     * <p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
     * @param	type		事件的类型。
     * @param	caller		事件侦听函数的执行域。
     * @param	listener	事件侦听函数。
     * @param	args		（可选）事件侦听函数的回调参数。
     * @return 此 EventDispatcher 对象。
     * @override
     */
    on(type: string, caller: any, listener: Function, args: any[] = null): EventDispatcher {
        if (type === Event.DISPLAY || type === Event.UNDISPLAY) {
            if (!this._getBit(Const.DISPLAY)) this._setBitUp(Const.DISPLAY);
        }
        return this._createListener(type, caller, listener, args, false);
    }

    /**
     * <p>增加事件侦听器，以使侦听器能够接收事件通知，此侦听事件响应一次后则自动移除侦听。</p>
     * <p>如果侦听鼠标事件，则会自动设置自己和父亲节点的属性 mouseEnabled 的值为 true(如果父节点mouseEnabled=false，则停止设置父节点mouseEnabled属性)。</p>
     * @param	type		事件的类型。
     * @param	caller		事件侦听函数的执行域。
     * @param	listener	事件侦听函数。
     * @param	args		（可选）事件侦听函数的回调参数。
     * @return 此 EventDispatcher 对象。
     * @override
     */
    once(type: string, caller: any, listener: Function, args: any[] = null): EventDispatcher {
        if (type === Event.DISPLAY || type === Event.UNDISPLAY) {
            if (!this._getBit(Const.DISPLAY)) this._setBitUp(Const.DISPLAY);
        }
        return this._createListener(type, caller, listener, args, true);
    }

    /**
     * <p>销毁此对象。destroy对象默认会把自己从父节点移除，并且清理自身引用关系，等待js自动垃圾回收机制回收。destroy后不能再使用。</p>
     * <p>destroy时会移除自身的事情监听，自身的timer监听，移除子对象及从父节点移除自己。</p>
     * @param destroyChild	（可选）是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
     */
    destroy(destroyChild: boolean = true): void {
        this.destroyed = true;
        this._destroyAllComponent();
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

        //移除所有timer
        //this.timer.clearAll(this);			
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
            for (var i: number = 0, n: number = this._children.length; i < n; i++) {
                this._children[0].destroy(true);
            }
        }
    }

    /**
     * 添加子节点。
     * @param	node 节点对象
     * @return	返回添加的节点
     */
    addChild(node: Node): Node {
        if (!node || this.destroyed || node === this) return node;
        if ((<Sprite>node)._zOrder) this._setBit(Const.HAS_ZORDER, true);
        if (node._parent === this) {
            var index: number = this.getChildIndex(node);
            if (index !== this._children.length - 1) {
                this._children.splice(index, 1);
                this._children.push(node);
                this._childChanged();
            }
        } else {
            node._parent && node._parent.removeChild(node);
            this._children === Node.ARRAY_EMPTY && (this._children = []);
            this._children.push(node);
            node._setParent(this);
            this._childChanged();
        }

        return node;
    }

    addInputChild(node: Node): Node {
        if (this._extUIChild == Node.ARRAY_EMPTY) {
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
    addChildren(...args:any[]): void {
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
        if (!node || this.destroyed || node === this) return node;
        if (((<Sprite>node))._zOrder) this._setBit(Const.HAS_ZORDER, true);
        if (index >= 0 && index <= this._children.length) {
            if (node._parent === this) {
                var oldIndex: number = this.getChildIndex(node);
                this._children.splice(oldIndex, 1);
                this._children.splice(index, 0, node);
                this._childChanged();
            } else {
                node._parent && node._parent.removeChild(node);
                this._children === Node.ARRAY_EMPTY && (this._children = []);
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
                this._children = Node.ARRAY_EMPTY;
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

    /**@private */
    protected _setParent(value: Node): void {
        if (this._parent !== value) {
            if (value) {
                this._parent = value;
                //如果父对象可见，则设置子对象可见
                this._onAdded();
                this.event(Event.ADDED);
                if (this._getBit(Const.DISPLAY)) {
                    this._setUpNoticeChain();
                    value.displayedInStage && this._displayChild(this, true);
                }
                value._childChanged(this);
            } else {
                //设置子对象不可见
                this._onRemoved();
                this.event(Event.REMOVED);
                this._parent._childChanged();
                if (this._getBit(Const.DISPLAY)) this._displayChild(this, false);
                this._parent = value;
            }
        }
    }

    /**表示是否在显示列表中显示。*/
    get displayedInStage(): boolean {
        if (this._getBit(Const.DISPLAY)) return this._getBit(Const.DISPLAYED_INSTAGE);
        this._setBitUp(Const.DISPLAY);
        return this._getBit(Const.DISPLAYED_INSTAGE);
    }

    /**@private */
    private _updateDisplayedInstage(): void {
        var ele: Node;
        ele = this;
        var stage: Node = ILaya.stage;
        var displayedInStage: boolean = false;
        while (ele) {
            if (ele._getBit(Const.DISPLAY)) {
                displayedInStage = ele._getBit(Const.DISPLAYED_INSTAGE);
                break;
            }
            if (ele === stage || ele._getBit(Const.DISPLAYED_INSTAGE)) {
                displayedInStage = true;
                break;
            }
            ele = ele._parent;
        }
        this._setBit(Const.DISPLAYED_INSTAGE, displayedInStage);
    }

    /**@internal */
    _setDisplay(value: boolean): void {
        if (this._getBit(Const.DISPLAYED_INSTAGE) !== value) {
            this._setBit(Const.DISPLAYED_INSTAGE, value);
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
                if (!child._getBit(Const.DISPLAY)) continue;
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
        var timer: Timer = this.scene ? this.scene.timer : ILaya.timer;
        timer.loop(delay, caller, method, args, coverBefore, jumpFrame);
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
        var timer: Timer = this.scene ? this.scene.timer : ILaya.timer;
        timer._create(false, false, delay, caller, method, args, coverBefore);
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
        var timer: Timer = this.scene ? this.scene.timer : ILaya.timer;
        timer._create(true, true, delay, caller, method, args, coverBefore);
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
        var timer: Timer = this.scene ? this.scene.timer : ILaya.timer;
        timer._create(true, false, delay, caller, method, args, coverBefore);
    }

    /**
     * 清理定时器。功能同Laya.timer.clearTimer()。
     * @param	caller 执行域(this)。
     * @param	method 结束时的回调方法。
     */
    clearTimer(caller: any, method: Function): void {
        var timer: Timer = this.scene ? this.scene.timer : ILaya.timer;
        timer.clear(caller, method);
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
        var timer: Timer = this.scene ? this.scene.timer : ILaya.timer;
        timer.callLater(this, method, args);
    }

    /**
     * <p>如果有需要延迟调用的函数（通过 <code>callLater</code> 函数设置），则立即执行延迟调用函数。</p>
     * @param method 要执行的函数名称。例如，functionName。
     * @see #callLater()
     */
    runCallLater(method: Function): void {
        var timer: Timer = this.scene ? this.scene.timer : ILaya.timer;
        timer.runCallLater(this, method);
    }

    //============================组件化支持==============================
    /** @private */
    private _components: any[];
    /**@private */
    private _activeChangeScripts: any[];//TODO:可用对象池

    /**@internal */
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
        return !this._getBit(Const.NOT_READY) && !this._getBit(Const.NOT_ACTIVE);
    }

    /**
     * 设置是否激活。
     * @param	value 是否激活。
     */
    set active(value: boolean) {
        value = !!value;
        if (!this._getBit(Const.NOT_ACTIVE) !== value) {
            if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
                if (value)
                    throw "Node: can't set the main inActive node active in hierarchy,if the operate is in main inActive node or it's children script's onDisable Event.";
                else
                    throw "Node: can't set the main active node inActive in hierarchy,if the operate is in main active node or it's children script's onEnable Event.";
            } else {
                this._setBit(Const.NOT_ACTIVE, !value);
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
        return this._getBit(Const.ACTIVE_INHIERARCHY);
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
     * @internal
     */
    _parse(data: any, spriteMap: any): void {
        //override it.
    }

    /**
     * @internal
     */
    _setBelongScene(scene: Node): void {
        if (!this._scene) {
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
        this._setBit(Const.ACTIVE_INHIERARCHY, true);
        if (this._components) {
            for (var i: number = 0, n: number = this._components.length; i < n; i++) {
                var comp: Component = this._components[i];
                if (comp._isScript())//TODO:maybe should combime the logic with script and unScript. 
                    (comp._enabled) && (activeChangeScripts.push(comp));
                else
                    comp._setActive(true);
            }
        }

        this._onActive();
        for (i = 0, n = this._children.length; i < n; i++) {
            var child: Node = this._children[i];
            (!child._getBit(Const.NOT_ACTIVE) && !child._getBit(Const.NOT_READY)) && (child._activeHierarchy(activeChangeScripts));
        }
        if (!this._getBit(Const.AWAKED)) {
            this._setBit(Const.AWAKED, true);
            this.onAwake();
        }
        this.onEnable();
    }

    /**
     * @private
     */
    private _activeScripts(): void {
        for (var i: number = 0, n: number = this._activeChangeScripts.length; i < n; i++) {
            var comp: Component = this._activeChangeScripts[i]
            if (!comp._awaked) {
                comp._awaked = true;
                comp._onAwake();
            }
            comp._onEnable();
        }
        this._activeChangeScripts.length = 0;
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
            for (var i: number = 0, n: number = this._components.length; i < n; i++) {
                var comp: Component = this._components[i];
                (!comp._isScript())&&comp._setActive(false);
                (comp._isScript() && comp._enabled) && (activeChangeScripts.push(comp));
            }
        }
        this._setBit(Const.ACTIVE_INHIERARCHY, false);

        for (i = 0, n = this._children.length; i < n; i++) {
            var child: Node = this._children[i];
            (child && !child._getBit(Const.NOT_ACTIVE)) && (child._inActiveHierarchy(activeChangeScripts));
        }
        this.onDisable();
    }

    /**
     * @private
     */
    private _inActiveScripts(): void {
        for (var i: number = 0, n: number = this._activeChangeScripts.length; i < n; i++)
            this._activeChangeScripts[i]._onDisable();
        this._activeChangeScripts.length = 0;
    }

    /**
     * 组件被禁用时执行，比如从节点从舞台移除后
     * 此方法为虚方法，使用时重写覆盖即可
     */
    onDisable(): void {
        //trace("onDisable node", this.name);
    }

    /**
     * @private
     */
    protected _onAdded(): void {
        if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
            throw "Node: can't set the main inActive node active in hierarchy,if the operate is in main inActive node or it's children script's onDisable Event.";
        } else {
            var parentScene: Node = this._parent.scene;
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
        this._components = this._components || [];
        this._components.push(comp);

        comp.owner = this;
        comp._onAdded();
        if (this.activeInHierarchy)
            comp._setActive(true);
    }

    /**
     * @internal
     */
    _destroyComponent(comp: Component): void {
        if (this._components) {
            for (var i: number = 0, n: number = this._components.length; i < n; i++) {
                var item: Component = this._components[i];
                if (item === comp) {
                    item._destroy();
                    this._components.splice(i, 1);
                    break;
                }
            }
        }
    }

    /**
     * @internal
     */
    _destroyAllComponent(): void {
        if (this._components) {
            for (var i: number = 0, n: number = this._components.length; i < n; i++) {
                var item: Component = this._components[i];
                item && item._destroy();
            }
            this._components.length = 0;
        }
    }

    /**
     * @internal 克隆。
     * @param	destObject 克隆源。
     */
    _cloneTo(destObject: any, srcRoot: Node, dstRoot: Node): void {
        var destNode: Node = (<Node>destObject);
        if (this._components) {
            for (var i: number = 0, n: number = this._components.length; i < n; i++) {
                var destComponent: Component = destNode.addComponent(this._components[i].constructor);
                this._components[i]._cloneTo(destComponent);
            }
        }
    }

    /**
     * 添加组件实例。
     * @param	component 组建实例。
     * @return	组件。
     */
    addComponentIntance(component: Component): any {
        if (component.owner)
            throw "Node:the component has belong to other node.";
        if (component.isSingleton && this.getComponent(((<any>component)).constructor))
            throw "Node:the component is singleton,can't add the second one.";
        this._addComponentInstance(component);
        return component;
    }

    /**
     * 添加组件。
     * @param	componentType 组件类型。
     * @return	组件。
     */
    addComponent(componentType: typeof Component): any {
        var comp: Component = Pool.createByClass(componentType);
        if(!comp){
           throw componentType.toString() + "组件不存在";
        }
        comp._destroyed = false;
        if (comp.isSingleton && this.getComponent(componentType))
            throw "无法实例" + componentType + "组件" + "，" + componentType + "组件已存在！";
        this._addComponentInstance(comp);
        return comp;
    }

    /**
     * 获得组件实例，如果没有则返回为null
     * @param	componentType 组建类型
     * @return	返回组件
     */
    getComponent(componentType: typeof Component): any {
        if (this._components) {
            for (var i: number = 0, n: number = this._components.length; i < n; i++) {
                var comp: Component = this._components[i];
                if (comp instanceof componentType)
                    return comp;
            }
        }
        return null;
    }

    /**
     * 获得组件实例，如果没有则返回为null
     * @param	componentType 组建类型
     * @return	返回组件数组
     */
    getComponents(componentType: typeof Component): any[] {
        var arr: any[];
        if (this._components) {
            for (var i: number = 0, n: number = this._components.length; i < n; i++) {
                var comp: Component = this._components[i];
                if (comp instanceof componentType) {
                    arr = arr || [];
                    arr.push(comp);
                }
            }
        }
        return arr;
    }

    /**
     * @private
     * 获取timer
     */
    get timer(): Timer {
        return this.scene ? this.scene.timer : ILaya.timer;
    }
}


ClassUtils.regClass("laya.display.Node", Node);
ClassUtils.regClass("Laya.Node", Node);