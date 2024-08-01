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
 * @en The `Node` class is the base class for all objects that can be placed in the display list.
 * The display list manages all objects displayed in the runtime of Laya. 
 * Use the Node class to arrange the display list. A Node object can have child display objects.
 * @zh `Node` 类是可放在显示列表中的所有对象的基类。
 * 该显示列表管理 LayaAir 运行时中显示的所有对象。使用 Node 类排列显示列表中的显示对象。Node 对象可以有子显示对象。
 */
export class Node extends EventDispatcher {
    /**
     * @internal
     * @en Event constant: Set active scene
     * @zh 事件常量：设置活动场景
     */
    static EVENT_SET_ACTIVESCENE: string = "ActiveScene";
    /**@internal */
    static EVENT_SET_IN_ACTIVESCENE: string = "InActiveScene";
    /**@private */
    private _bits: number = 0;
    /**@private */
    private _hideFlags: number = 0;

    /**
     * @internal
     * @en Child object collection, please do not modify this object directly.
     * @zh 子对象集合，请不要直接修改此对象。
     */
    _children: Node[] = ARRAY_EMPTY;
    /**
     * @internal
     * @en Parent node object.
     * @zh 父节点对象。
     */
    _parent: Node = null;
    /**
     * @internal
     * @en Whether it has been destroyed.
     * @zh 是否已经被销毁。
     */
    _destroyed: boolean = false;
    /**@internal */
    _conchData: any;
    /**@internal */
    _componentDriver: ComponentDriver;
    /**
     * @internal
     * @en Whether it is a 3D node, i.e., Scene3D, Sprite3D and their derived classes.
     * @zh 是否是3D节点，即Scene3D、Sprite3D及其衍生类。
     */
    _is3D: boolean;
    /**
     * @internal
     * @en the URL of the resource.
     * @zh 资源的URL。
     */
    _url: string;

    /**
     * @internal
     * @en Extra data of the node.
     * @zh 节点的额外数据。
     */
    _extra: INodeExtra;

    /**
     * @en Node name.
     * @zh 节点名称。
     */
    name: string = "";

    /**
     * @en Node tag.
     * @zh 节点标签。
     */
    tag: string;

    /**
     * @en The URL of the resource.
     * @zh 资源的URL。
     */
    get url(): string {
        return this._url;
    }

    set url(path: string) {
        this._url = path;
    }

    /**
     * @en Hide flags.
     * @zh 隐藏标志。
     */
    get hideFlags(): number {
        return this._hideFlags;
    }

    set hideFlags(value: number) {
        this._hideFlags = value;
    }

    /**
     * @en Whether it is a 3D node, i.e., Scene3D, Sprite3D and their derived classes.
     * @zh 是否是3D节点，即Scene3D、Sprite3D及其衍生类。
     */
    get is3D(): boolean {
        return this._is3D;
    }

    /**
     * @en Whether it has been destroyed. The object cannot be used after being destroyed.
     * @zh 是否已经销毁。对象销毁后不能再使用。
     */
    get destroyed(): boolean {
        return this._destroyed;
    }


    constructor() {
        super();
        this._initialize();
    }

    /**
    * @internal
    * @en Initialize the node.
    * @zh 初始化节点。
    */
    _initialize(): void {
        this._extra = {};
    }

    /**
     * @internal
     * @en Set a specific bit of the node.
     * @param type The bit type to set.
     * @param value The value to set, true or false.
     * @zh 设置节点的特定位。
     * @param type 要设置的位类型。
     * @param value 要设置的值,true或false。
     */
    _setBit(type: number, value: boolean): void {
        if (type === NodeFlags.DISPLAY) {
            var preValue: boolean = this._getBit(type);
            if (preValue != value) this._updateDisplayedInstage();
        }
        if (value) this._bits |= type;
        else this._bits &= ~type;
    }

    /**
     * @internal
     * @en Get a specific bit of the node.
     * @param type The bit type to get.
     * @returns The bit value, true or false.
     * @zh 获取节点的特定位。
     * @param type 要获取的位类型。
     * @returns 位的值,true或false。
     */
    _getBit(type: number): boolean {
        return (this._bits & type) != 0;
    }

    /**
     * @private
     * @en Update the display status of the node in the stage.
     * This method checks the node's hierarchy to determine if it or any of its parents are displayed in the stage, and updates the DISPLAYED_INSTAGE flag accordingly.
     * @zh 更新节点在舞台中的显示状态。
     * 此方法检查节点的层次结构，以确定它或其任何父节点是否显示在舞台中，并相应地更新 DISPLAYED_INSTAGE 标志。
     */
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


    /**
     * @internal
     * @en Set up the notification chain for the node.
     * This method ensures that the DISPLAY flag is propagated upwards through the node's hierarchy.
     * @zh 设置节点的通知链。
     * 此方法确保 DISPLAY 标志向上传播通过节点的层次结构。
     */
    _setUpNoticeChain(): void {
        if (this._getBit(NodeFlags.DISPLAY)) this._setBitUp(NodeFlags.DISPLAY);
    }

    /**
     * @internal
     * @en Set a specific bit up the parent chain.
     * @param type The bit type to set.
     * @zh 向上设置父节点链的特定位。
     * @param type 要设置的位类型。
     */
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
     * @internal
     * @en Start listening to a specific event type.
     * This method sets the DISPLAY flag if the event type is DISPLAY or UNDISPLAY and the node is not already marked as displayed.
     * @param type The event type to listen to.
     * @zh 开始监听特定事件类型。
     * 如果事件类型是 DISPLAY 或 UNDISPLAY 且节点尚未标记为显示，则此方法设置 DISPLAY 标志。
     * @param type 要监听的事件类型。
     */
    protected onStartListeningToType(type: string) {
        if (type === Event.DISPLAY || type === Event.UNDISPLAY) {
            if (!this._getBit(NodeFlags.DISPLAY)) this._setBitUp(NodeFlags.DISPLAY);
        }
    }

    /**
     * @en Bubble an event up the parent chain.
     * @param type The event type.
     * @param data The event data. If not provided, a new Event object will be created.
     * @zh 事件冒泡到父节点链。
     * @param type 事件类型。
     * @param data 事件数据。如果未提供,将创建一个新的Event对象。
     */
    bubbleEvent(type: string, data?: any) {
        let arr: Array<Node> = _bubbleChainPool.length > 0 ? _bubbleChainPool.pop() : [];
        arr.length = 0;

        let obj: Node = this;
        while (obj) {
            if (obj.activeInHierarchy)
                arr.push(obj);
            obj = obj.parent;
        }

        if (data instanceof Event) {
            data._stopped = false;
            for (let obj of arr) {
                data.setTo(type, obj, this);
                obj.event(type, data);
                if (data._stopped)
                    break;
            }
        }
        else {
            for (let obj of arr)
                obj.event(type, data);
        }

        _bubbleChainPool.push(arr);
    }

    /**
     * @en Check whether the node has a specific hide flag.
     * @param flag The hide flag to check.
     * @returns Whether the node has the specified hide flag.
     * @zh 检查节点是否具有特定的隐藏标志。
     * @param flag 要检查的隐藏标志。
     * @returns 节点是否具有指定的隐藏标志。
     */
    hasHideFlag(flag: number): boolean {
        return (this._hideFlags & flag) != 0;
    }

    /**
     * @en Destroy this node. When a node is destroyed, it will be removed from its parent node and the references will be cleared, waiting for the garbage collector to recycle it.
     * When destroying a node, its own event listeners, timer listeners, child objects will be removed, and it will be removed from its parent node.
     * @param destroyChild Whether to destroy child nodes as well. If true, all child nodes will be destroyed recursively; otherwise, they will only be removed from the parent.
     * @zh 销毁此节点。destroy对象默认会把自己从父节点移除,并且清理自身引用关系,等待js自动垃圾回收机制回收。destroy后不能再使用。
     * destroy时会移除自身的事情监听,自身的timer监听,移除子对象及从父节点移除自己。
     * @param destroyChild 是否同时销毁子节点,若值为true,则销毁子节点,否则不销毁子节点。
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
    * @en The callback function when the node is destroyed. This is a virtual method. You can override it for custom logic when the node is about to be destroyed.
    * @zh 节点被销毁时执行的回调函数。此方法为虚方法，使用时重写覆盖即可。
    */
    onDestroy(): void {
        //trace("onDestroy node", this.name);
    }

    /**
     * @en Destroy all child nodes, without destroying the node itself.
     * @zh 销毁所有子节点,但不销毁节点本身。
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
     * @en Add a child node.
     * @param node The node to be added as a child.
     * @returns The added child node.
     * @zh 添加子节点。
     * @param node 节点对象。
     * @returns 返回添加的节点。
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

    /**
     * @en Add multiple child nodes.
     * @param ...args A variable number of child nodes to be added.
     * @zh 批量增加子节点。
     * @param ...args 无数子节点。
     */
    addChildren(...args: any[]): void {
        var i: number = 0, n: number = args.length;
        while (i < n) {
            this.addChild(args[i++]);
        }
    }

    /**
     * @en Insert a child node at a specific index.
     * @param node The child node to be inserted.
     * @param index The index at which the child node will be inserted.
     * @returns The inserted child node.
     * @zh 在指定的索引位置插入子节点。
     * @param node 节点对象。
     * @param index 索引位置。
     * @returns 返回添加的节点。
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
     * @en Get the index of a child node.
     * @param node The child node to query.
     * @returns The index of the child node.
     * @zh 获取子节点的索引位置。
     * @param node 子节点。
     * @returns 子节点所在的索引位置。
     */
    getChildIndex(node: Node): number {
        return this._children.indexOf(node);
    }

    /**
    * @en Get a child node by its name.
    * @param name The name of the child node.
    * @returns The child node with the specified name, or null if not found.
    * @zh 根据子节点的名字获取子节点对象。
    * @param name 子节点的名字。
    * @returns 节点对象。
    */
    getChildByName(name: string): Node {
        for (let child of this._children) {
            if (child && child.name === name)
                return child;
        }
        return null;
    }

    /**
     * @en Get a child node by its index.
     * @param index The index of the child node.
     * @returns The child node at the specified index, or null if the index is out of range.
     * @zh 根据子节点的索引位置获取子节点对象。
     * @param index 索引位置。
     * @returns 指定索引处的子节点，如果索引超出范围，则为空。
     */
    getChildAt(index: number): Node {
        return this._children[index] || null;
    }

    /**
     * @en Set the index of a child node.
     * @param node The child node to set the index for.
     * @param index The new index of the child node.
     * @returns The child node itself.
     * @zh 设置子节点的索引位置。
     * @param node 子节点。
     * @param index 新的索引。
     * @returns 返回子节点本身。
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
     * @internal
     * @en Callback when a child node changes.
     * @param child The child node that has changed.
     * @zh 子节点发生变化时的回调。
     * @param child 发生变化的子节点。
     */
    protected _childChanged(child: Node = null): void {

    }

    /**
     * @en Remove a child node.
     * @param node The child node to be removed.
     * @returns The removed node.
     * @zh 删除子节点。
     * @param node 子节点。
     * @returns 被删除的节点。
     */
    removeChild(node: Node): Node {
        if (!this._children) return node;
        var index: number = this._children.indexOf(node);
        return this.removeChildAt(index);
    }

    /**
     * @en Remove itself from its parent node. If it hasn't been added to any parent node, nothing happens.
     * @returns The node itself.
     * @zh 从父容器删除自己,如果已经被删除不会抛出异常。
     * @returns 当前节点。
     */
    removeSelf(): Node {
        this._parent && this._parent.removeChild(this);
        return this;
    }

    /**
     * @en Remove a child node by its name.
     * @param name The name of the child node.
     * @returns The removed node.
     * @zh 根据子节点名字删除对应的子节点对象,如果找不到不会抛出异常。
     * @param name 对象名字。
     * @returns 查找到的节点。
     */
    removeChildByName(name: string): Node {
        var node: Node = this.getChildByName(name);
        node && this.removeChild(node);
        return node;
    }

    /**
     * @en Remove a child node by its index.
     * @param index The index of the child node.
     * @returns The removed node.
     * @zh 根据子节点索引位置,删除对应的子节点对象。
     * @param index 节点索引位置。
     * @returns 被删除的节点。
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
     * @en Remove all children from this node.
     * @param beginIndex The begin index.
     * @param endIndex The end index.
     * @returns The node itself.
     * @zh 删除指定索引区间的所有子对象。
     * @param beginIndex 开始索引。
     * @param endIndex 结束索引。
     * @returns 当前节点对象。
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
     * @en Replace a child node.
     * @param newNode The new node to replace the old one.
     * @param oldNode The old node to be replaced.
     * @returns The new node.
     * @zh 替换子节点。
     * @param newNode 新节点。
     * @param oldNode 老节点。
     * @returns 返回新节点。
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
     * @en The number of child nodes.
     * @zh 子对象数量。
     */
    get numChildren(): number {
        return this._children ? this._children.length : 0;
    }

    /**
     * @en The parent node.
     * @zh 父节点。
     */
    get parent(): Node {
        return this._parent;
    }

    /**
     * @en Check if this node is an ancestor of the given node.
     * @returns True if this node is an ancestor of the given node, false otherwise.
     * @param node The node to check.
     * @zh 检查本节点是否是某个节点的上层节点。
     * @param node 要检查的节点。
     * @returns 一个布尔值，表示本节点是否是某个节点的上层节点。
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

    /**
     * @private
     * @internal
     * @en Set the parent node of the current node.
     * @param value The new parent node.
     * @zh 设置当前节点的父节点。
     * @param value 新的父节点。
     */
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

    /**
     * @en Indicates whether the node is displayed in the scene.
     * @zh 表示是否在显示列表中显示。
     */
    get displayedInStage(): boolean {
        if (this._getBit(NodeFlags.DISPLAY)) return this._getBit(NodeFlags.DISPLAYED_INSTAGE);
        this._setBitUp(NodeFlags.DISPLAY);
        return this._getBit(NodeFlags.DISPLAYED_INSTAGE);
    }



    /**
     * @internal
     * @en Set the display status of the node.
     * @param value The display status.
     * @zh 设置节点的显示状态。
     * @param value 显示状态。
     */
    _setDisplay(value: boolean): void {
        if (this._getBit(NodeFlags.DISPLAYED_INSTAGE) !== value) {
            this._setBit(NodeFlags.DISPLAYED_INSTAGE, value);
            if (value) this.event(Event.DISPLAY);
            else this.event(Event.UNDISPLAY);
        }
    }

    /**
    * @private
    * @internal
    * @en Set the display state of a node's children.
    * @param node The node whose children's display state needs to change.
    * @param display The display state to set.
    * @zh 设置指定节点对象的子对象是否可见（是否在渲染列表中）。
    * @param node 节点。
    * @param display 是否可见。
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
     * @en Checks whether the current node contains the specified node.
     * @returns A Boolean value indicating whether the current node contains the specified node.
     * @param node The specified node.
     * @zh 当前容器是否包含指定的节点对象。
     * @param node 指定的节点对象。
     * @returns 一个布尔值，表示是否包含指定的节点对象。
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
     * @en Repeatedly execute a callback function at a fixed interval. This is a wrapper of the `loop` method in the timer property of the node.
     * @param delay The interval between executions, in milliseconds.
     * @param caller The execution scope of the callback function (this).
     * @param method The callback function.
     * @param args The parameters passed to the callback function.
     * @param coverBefore Whether to override the previous delayed execution. The default value is true.
     * @param jumpFrame Whether the callback should be executed when the timer jumps frames. The default value is false. If set to true, the callback will be executed multiple times in a single frame if possible, for performance reasons.
     * @zh 定时重复执行某函数。这是对节点 timer 属性的 `loop` 方法的封装。
     * @param delay 执行间隔时间,以毫秒为单位。
     * @param caller 回调函数的执行域(this)。
     * @param method 回调函数。
     * @param args 传递给回调函数的参数。
     * @param coverBefore 是否覆盖之前的延迟执行,默认为 true。
     * @param jumpFrame 时钟是否跳帧。基于时间的循环回调,单位时间间隔内,如能执行多次回调,出于性能考虑,引擎默认只执行一次,设置jumpFrame为true后,则回调会连续执行多次。默认为false。
     */
    timerLoop(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true, jumpFrame: boolean = false): void {
        this.timer.loop(delay, caller, method, args, coverBefore, jumpFrame);
    }

    /**
     * @en Executes a callback function once after a specified delay.
     * @param delay The delay time, in milliseconds.
     * @param caller The execution scope of the callback function (this).
     * @param method The callback function.
     * @param args The parameters passed to the callback function.
     * @param coverBefore Whether to override the previous delayed execution. The default value is true.
     * @zh 在指定延迟时间后执行一次回调函数。功能同Laya.timer.once()。
     * @param delay 延迟时间,以毫秒为单位。
     * @param caller 回调函数的执行域(this)。
     * @param method 回调函数。
     * @param args 传递给回调函数的参数。
     * @param coverBefore 是否覆盖之前的延迟执行,默认为 true。
     */
    timerOnce(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this.timer._create(false, false, delay, caller, method, args, coverBefore);
    }

    /**
     * @en Repeatedly executes a callback function at a fixed interval based on frame rate.
     * @param delay The interval between executions, in frames.
     * @param caller The execution scope of the callback function (this).
     * @param method The callback function.
     * @param args The parameters passed to the callback function.
     * @param coverBefore Whether to override the previous delayed execution. The default value is true.
     * @zh 基于帧率,定时重复执行回调函数。功能同Laya.timer.frameLoop()。
     * @param delay 执行间隔时间,以帧为单位。
     * @param caller 回调函数的执行域(this)。
     * @param method 回调函数。
     * @param args 传递给回调函数的参数。
     * @param coverBefore 是否覆盖之前的延迟执行,默认为 true。
     */
    frameLoop(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this.timer._create(true, true, delay, caller, method, args, coverBefore);
    }

    /**
     * @en Executes a callback function once after a specified delay based on frame rate.
     * @param delay The delay time, in frames.
     * @param caller The execution scope of the callback function (this).
     * @param method The callback function.
     * @param args The parameters passed to the callback function.
     * @param coverBefore Whether to override the previous delayed execution. The default value is true.
     * @zh 基于帧率,在指定延迟时间后执行一次回调函数。功能同Laya.timer.frameOnce()。
     * @param delay 延迟时间,以帧为单位。
     * @param caller 回调函数的执行域(this)。
     * @param method 回调函数。
     * @param args 传递给回调函数的参数。
     * @param coverBefore 是否覆盖之前的延迟执行,默认为 true。
     */
    frameOnce(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this.timer._create(true, false, delay, caller, method, args, coverBefore);
    }

    /**
     * @en Clears a timer.
     * @param caller The execution scope of the callback function (this).
     * @param method The callback function.
     * @zh 清除定时器。功能同Laya.timer.clear()。
     * @param caller 回调函数的执行域(this)。
     * @param method 回调函数。
     */
    clearTimer(caller: any, method: Function): void {
        this.timer.clear(caller, method);
    }

    /**
     * @en Delays the execution of a callback function until the next frame after the current execution block is finished.
     * The callback function will only be executed once. It is generally called before the control is displayed on the screen to delay the calculation of data.
     * @param method The callback function.
     * @param args The parameters passed to the callback function.
     * @zh 在当前执行块完成后,延迟执行回调函数到下一帧。
     * 回调函数只会被执行一次。一般在控件被显示在屏幕之前调用，用于延迟计算数据。
     * @param method 回调函数。
     * @param args 传递给回调函数的参数。
     */
    callLater(method: Function, args: any[] = null): void {
        this.timer.callLater(this, method, args);
    }

    /**
     * @en If there are callback functions delayed by `callLater`, they will be executed immediately.
     * @param method The name of the callback function to be executed, such as `functionName`.
     * @zh 如果有通过 `callLater` 延迟执行的回调函数,将立即执行它们。
     * @param method 要执行的回调函数名称,例如 `functionName`。
     */
    runCallLater(method: Function): void {
        this.timer.runCallLater(this, method);
    }

    //============================组件化支持==============================
    /** 
     * @private
     * @internal
     * @en The component list of this node.
     * @zh 节点的组件列表。
     */
    protected _components: Component[];
    /**@private */
    private _activeChangeScripts: Component[];


    /**
    * @internal
    * @en The scene this node belongs to.
    * @zh 该节点所属的场景。
    */
    _scene: Node;

    /**
     * @en Get the scene this node belongs to.
     * @zh 获取该节点所属的场景。
     */
    get scene(): any {
        return this._scene;
    }

    /**
     * @en Thether this node is active.
     * @zh 该节点自身是否激活。
     */
    get active(): boolean {
        return !this._getBit(NodeFlags.NOT_READY) && !this._getBit(NodeFlags.NOT_ACTIVE);
    }

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
                        this._processActive(value, true);
                    }
                }
            }
        }
    }

    /**
     * @en Thether this node is active in the hierarchy.
     * @zh 该节点在层级中是否激活。
     */
    get activeInHierarchy(): boolean {
        return this._getBit(NodeFlags.ACTIVE_INHIERARCHY);
    }

    /**
     * @private
     * @internal
     * @en Actions performed when the node becomes active.
     * @zh 节点激活时执行的操作。
     */
    protected _onActive(): void {
        Stat.spriteCount++;
    }

    /**
     * @private
     * @internal
     * @en Actions performed when the node becomes inactive.
     * @zh 节点停用时执行的操作。
     */
    protected _onInActive(): void {
        Stat.spriteCount--;
    }

    /**
     * @private
     * @internal
     * @en Actions performed when the node is added to the scene.
     * @zh 节点被添加到场景时执行的操作。
     */
    protected _onActiveInScene(): void {
        this.event(Node.EVENT_SET_ACTIVESCENE, this._scene);
        //override it.
    }

    /**
     * @private
     * @internal
     * @en Actions performed when the node is removed from the scene.
     * @zh 节点从场景中移除时执行的操作。
     */
    protected _onInActiveInScene(): void {
        this.event(Node.EVENT_SET_IN_ACTIVESCENE, this._scene);
        //override it.
    }

    /**
     * @en The callback function that is executed when the component is activated, at which point all nodes and components have been created.
     * This is a virtual method that needs to be overridden in the subclass.
     * @zh 组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次。
     * 此方法为虚方法，使用时重写覆盖即可。
     */
    onAwake(): void {
        //this.name  && trace("onAwake node ", this.name);
    }

    /**
    * @en The callback function that is executed when the component is enabled, such as when a node is added to the stage.
    * This is a virtual method that needs to be overridden in the subclass.
    * @zh 组件被启用后执行，比如节点被添加到舞台后。
    * 此方法为虚方法，使用时重写覆盖即可。
    */
    onEnable(): void {
        //this.name  && trace("onEnable node ", this.name);
    }

    /**
     * @en The callback function that is executed when the component is disabled, such as when a node is removed from the stage.
     * This is a virtual method that needs to be overridden in the subclass.
     * @zh 组件被禁用时执行，比如从节点从舞台移除后。
     * 此方法为虚方法，使用时重写覆盖即可。
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
    * @en Set the scene to which the node belongs.
    * @param scene The scene the node belongs to.
    * @zh 设置节点归属的场景。
    * @param scene 节点所属的场景。
    */
    _setBelongScene(scene: Node): void {
        if (!this._scene || this.scene != scene) {
            this._scene = scene;
            this._onActiveInScene();
            for (let i = 0, n = this._children.length; i < n; i++)
                this._children[i]._setBelongScene(scene);
        }
    }

    /**
     * @internal
     * @en Unset the node from its belong scene.
     * @zh 从所属场景中移除节点。
     */
    _setUnBelongScene(): void {
        if (this._scene !== this) {//移除节点本身是scene不继续派发
            this._onInActiveInScene();
            this._scene = null;
            for (let i = 0, n = this._children.length; i < n; i++)
                this._children[i]._setUnBelongScene();
        }
    }

    /**
    * @internal
    * @en Processes the active state of the node and its children in the hierarchy.
    * @param active The active state to be set.
    * @param fromSetter Whether the state is set from a setter.
    * @zh 处理节点及其子节点在层级中的激活状态。
    * @param active 设置的激活状态。
    * @param fromSetter 是否由 setter 设置。
    */
    _processActive(active: boolean, fromSetter?: boolean) {
        (this._activeChangeScripts) || (this._activeChangeScripts = []);
        let arr = this._activeChangeScripts;

        if (active)
            this._activeHierarchy(arr, fromSetter);
        else
            this._inActiveHierarchy(arr, fromSetter);

        for (let i = 0, n = arr.length; i < n; i++) {
            let comp = arr[i];
            comp.owner && comp._setActive(active);
        }

        arr.length = 0;
    }

    /**
     * @internal
     * @en Activate the node and its children within the hierarchy. It marks the node and all its children as active, and adds eligible component scripts to the activation change list.
     * @param activeChangeScripts The list of component scripts affected by the activation change.
     * @zh 在层级中递归地激活节点及其子节点。这个方法将节点及其所有子节点标记为激活状态，并将符合条件的组件脚本添加到激活变更列表中。
     * @param activeChangeScripts 存放激活状态变更的组件脚本列表。
     */
    _activeHierarchy(activeChangeScripts: any[], fromSetter?: boolean): void {
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
            (!child._getBit(NodeFlags.NOT_ACTIVE) && !child._getBit(NodeFlags.NOT_READY)) && (child._activeHierarchy(activeChangeScripts, fromSetter));
        }
        if (!this._getBit(NodeFlags.AWAKED)) {
            this._setBit(NodeFlags.AWAKED, true);
            this.onAwake();
        }
        this.onEnable();
    }

    /**
     * @internal
     * @en Deactivates the current node, its components, and children recursively. Only the scripts that are marked as active will have their references pushed to `activeChangeScripts`.
     * @param activeChangeScripts Array to hold the references of active scripts that are being deactivated.
     * @zh 在层级中递归地停用当前节点、其组件和子节点。只有标记为活动的脚本才会将其引用推送到 `activeChangeScripts` 中。
     * @param activeChangeScripts 用于保存正在被停用的活动脚本的引用的数组。
     */
    _inActiveHierarchy(activeChangeScripts: any[], fromSetter?: boolean): void {
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
            (child && !child._getBit(NodeFlags.NOT_ACTIVE)) && (child._inActiveHierarchy(activeChangeScripts, fromSetter));
        }
        this.onDisable();
    }

    /**
     * @private
     * @internal
     * @en Handle the addition of the node to its parent.
     * This method is called when the node is added to a parent node, updating the active state and scene reference if applicable.
     * @zh 处理节点被添加到父节点时的操作。
     * 当节点被添加到父节点时调用此方法，如果适用，更新激活状态和场景引用。
     */
    protected _onAdded(): void {
        if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
            throw "Node: can't set the main inActive node active in hierarchy,if the operate is in main inActive node or it's children script's onDisable Event.";
        } else {
            let parentScene = this._parent.scene;
            parentScene && this._setBelongScene(parentScene);
            (this._parent.activeInHierarchy && this.active) && this._processActive(true);
        }
    }


    /**
     * @private
     * @internal
     * @en Handle the removal of the node from its parent.
     * This method is called when the node is removed from its parent node, updating the active state and scene reference if applicable.
     * @zh 处理节点从父节点移除时的操作。
     * 当节点从父节点移除时调用此方法，如果适用，更新激活状态和场景引用。
     */
    protected _onRemoved(): void {
        if (this._activeChangeScripts && this._activeChangeScripts.length !== 0) {
            throw "Node: can't set the main active node inActive in hierarchy,if the operate is in main active node or it's children script's onEnable Event.";
        } else {
            (this._parent.activeInHierarchy && this.active) && this._processActive(false);
            this._parent.scene && this._setUnBelongScene();
        }
    }

    /**
     * @internal
     * @en Add a component instance to the node.
     * @param comp The component instance.
     * @zh 添加组件实例到节点。
     * @param comp 组件实例。
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
     * @en Destroy a component on the node.
     * @param comp The component to destroy.
     * @zh 销毁节点上的组件。
     * @param comp 要销毁的组件。
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
     * @en Destroy all components on the node.
     * @zh 销毁节点上的所有组件。
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
     * @internal
     * @en Handle changes to the node's components.
     * This method is called when a component is added, removed, or all components are destroyed.
     * @param comp The component that was changed.
     * @param action The action performed: 0 for added, 1 for removed, 2 for all destroyed.
     * @zh 处理节点组件的变化。
     * 当组件被添加、移除或所有组件被销毁时调用此方法。
     * @param comp 发生变化的组件。
     * @param action 执行的操作：0 表示添加，1 表示移除，2 表示全部销毁。
     */
    protected _componentsChanged?(comp: Component, action: 0 | 1 | 2): void;

    /**
    * @internal
    * @en Clones the components from the current node to the destination object.
    * @param destObject The destination object to clone the components to.
    * @zh 将当前节点的组件克隆到指定的目标对象中。
    * @param destObject 要克隆组件到的目标对象。
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
     * @en Add a component instance to the node.
     * @param component The component instance.
     * @returns The added component instance.
     * @zh 添加组件实例到节点。
     * @param component 组件实例。
     * @returns 添加的组件实例。
     */
    addComponentInstance(component: Component): Component {
        if (component.owner)
            throw "Node:the component has belong to other node.";
        if (component._singleton && this.getComponent(((<any>component)).constructor))
            console.warn("Node:the component is singleton, can't add the second one.", component);
        else
            this._addComponentInstance(component);
        return component;
    }

    /**
     * @en Add a component to the node.
     * @param componentType The type of the component.
     * @returns The added component instance.
     * @zh 添加组件到节点。
     * @param componentType 组件类型。
     * @returns 添加的组件实例。
     */
    addComponent<T extends Component>(componentType: new () => T): T {
        let comp: T = Pool.createByClass(componentType);
        if (!comp) {
            throw "missing " + componentType.toString();
        }

        if (comp._singleton && this.getComponent(componentType))
            console.warn("Node:the component is singleton, can't add the second one.", comp);
        else
            this._addComponentInstance(comp);
        return comp;
    }

    /**
     * @en Get a component instance by type. Returns null if not found.
     * @param componentType The type of the component.
     * @returns The component instance.
     * @zh 根据类型获取组件实例。如果没有找到则返回null。
     * @param componentType 组件类型。
     * @returns 组件实例。
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
     * @en Get all component instances on the node.
     * @returns An array of component instances.
     * @zh 获取节点上的所有组件实例。
     * @returns 组件实例数组。
     */
    get components(): ReadonlyArray<Component> {
        return this._components || ARRAY_EMPTY;
    }

    /**
     * @en Get all component instances by type. Returns an empty array if none are found.
     * @param componentType The type of the component.
     * @returns An array of component instances.
     * @zh 根据类型获取所有组件实例。如果没有找到则返回空数组。
     * @param componentType 组件类型。
     * @returns 组件实例数组。
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
     * @en Get the timer associated with the node.
     * @returns The timer.
     * @zh 获取与节点关联的计时器。
     * @returns 计时器。
     */
    get timer(): Timer {
        return this._scene ? this._scene.timer : ILaya.timer;
    }

    /**
     * @en Called after deserialization.
     * @zh 反序列化后调用。
     */
    onAfterDeserialize() { }
}

const _bubbleChainPool: Array<Array<Node>> = [];

export interface INodeExtra { }
