import { Laya } from "Laya";
import { Node } from "laya/display/Node";
import { Loader } from "laya/net/Loader";
import { URL } from "laya/net/URL";
import { Animator } from "../component/Animator";
import { Shader3D } from "../shader/Shader3D";
import { Transform3D } from "././Transform3D";
/**
 * <code>Sprite3D</code> 类用于实现3D精灵。
 */
export class Sprite3D extends Node {
    /**
     * 创建一个 <code>Sprite3D</code> 实例。
     * @param name 精灵名称。
     * @param isStatic 是否为静态。
     */
    constructor(name = null, isStatic = false) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super();
        /** @private */
        this._needProcessCollisions = false;
        /** @private */
        this._needProcessTriggers = false;
        this._id = ++Sprite3D._uniqueIDCounter;
        this._transform = new Transform3D(this);
        this._isStatic = isStatic;
        this.layer = 0;
        this.name = name ? name : "New Sprite3D";
    }
    /**
     * @private
     */
    static __init__() {
    }
    /**
     * 创建精灵的克隆实例。
     * @param	original  原始精灵。
     * @param   parent    父节点。
     * @param   worldPositionStays 是否保持自身世界变换。
     * @param	position  世界位置,worldPositionStays为false时生效。
     * @param	rotation  世界旋转,worldPositionStays为false时生效。
     * @return  克隆实例。
     */
    static instantiate(original, parent = null, worldPositionStays = true, position = null, rotation = null) {
        var destSprite3D = original.clone();
        (parent) && (parent.addChild(destSprite3D));
        var transform = destSprite3D.transform;
        if (worldPositionStays) {
            var worldMatrix = transform.worldMatrix;
            original.transform.worldMatrix.cloneTo(worldMatrix);
            transform.worldMatrix = worldMatrix;
        }
        else {
            (position) && (transform.position = position);
            (rotation) && (transform.rotation = rotation);
        }
        return destSprite3D;
    }
    /**
     * 加载网格模板。
     * @param url 模板地址。
     * @param complete 完成回掉。
     */
    static load(url, complete) {
        Laya.loader.create(url, complete, null, Sprite3D.HIERARCHY);
    }
    /**
     * 获取唯一标识ID。
     *   @return	唯一标识ID。
     */
    get id() {
        return this._id;
    }
    /**
     * 获取蒙版。
     * @return	蒙版。
     */
    get layer() {
        return this._layer;
    }
    /**
     * 设置蒙版。
     * @param	value 蒙版。
     */
    set layer(value) {
        if (this._layer !== value) {
            if (value >= 0 && value <= 30) {
                this._layer = value;
            }
            else {
                throw new Error("Layer value must be 0-30.");
            }
        }
    }
    /**
     * 获取资源的URL地址。
     * @return URL地址。
     */
    get url() {
        return this._url;
    }
    /**
     * 获取是否为静态。
     * @return 是否为静态。
     */
    get isStatic() {
        return this._isStatic;
    }
    /**
     * 获取精灵变换。
     * @return 精灵变换。
     */
    get transform() {
        return this._transform;
    }
    /**
     * @private
     */
    _setCreateURL(url) {
        this._url = URL.formatURL(url); //perfab根节点会设置URL
    }
    /**
     * @private
     */
    _changeAnimatorsToLinkSprite3D(sprite3D, isLink, path) {
        var animator = this.getComponent(Animator);
        if (animator) {
            if (!animator.avatar)
                sprite3D._changeAnimatorToLinkSprite3DNoAvatar(animator, isLink, path);
        }
        if (this._parent && this._parent instanceof Sprite3D) {
            path.unshift(this._parent.name);
            var p = this._parent;
            (p._hierarchyAnimator) && (p._changeAnimatorsToLinkSprite3D(sprite3D, isLink, path));
        }
    }
    /**
     * @private
     */
    _setHierarchyAnimator(animator, parentAnimator) {
        this._changeHierarchyAnimator(animator);
        this._changeAnimatorAvatar(animator.avatar);
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            (child._hierarchyAnimator == parentAnimator) && (child._setHierarchyAnimator(animator, parentAnimator));
        }
    }
    /**
     * @private
     */
    _clearHierarchyAnimator(animator, parentAnimator) {
        this._changeHierarchyAnimator(parentAnimator);
        this._changeAnimatorAvatar(parentAnimator ? parentAnimator.avatar : null);
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            (child._hierarchyAnimator == animator) && (child._clearHierarchyAnimator(animator, parentAnimator));
        }
    }
    /**
     * @private
     */
    _changeHierarchyAnimatorAvatar(animator, avatar) {
        this._changeAnimatorAvatar(avatar);
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            (child._hierarchyAnimator == animator) && (child._changeHierarchyAnimatorAvatar(animator, avatar));
        }
    }
    /**
     * @private
     */
    _changeAnimatorToLinkSprite3DNoAvatar(animator, isLink, path) {
        animator._handleSpriteOwnersBySprite(isLink, path, this);
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            var index = path.length;
            path.push(child.name);
            child._changeAnimatorToLinkSprite3DNoAvatar(animator, isLink, path);
            path.splice(index, 1);
        }
    }
    /**
     * @private
     */
    _changeHierarchyAnimator(animator) {
        this._hierarchyAnimator = animator;
    }
    /**
     * @private
     */
    _changeAnimatorAvatar(avatar) {
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onAdded() {
        if (this._parent instanceof Sprite3D) {
            var parent3D = this._parent;
            this.transform._setParent(parent3D.transform);
            if (parent3D._hierarchyAnimator) {
                (!this._hierarchyAnimator) && (this._setHierarchyAnimator(parent3D._hierarchyAnimator, null)); //执行条件为sprite3D._hierarchyAnimator==parentAnimator,只有一种情况sprite3D._hierarchyAnimator=null成立,且_hierarchyAnimator不为空有意义
                parent3D._changeAnimatorsToLinkSprite3D(this, true, [this.name]); //TODO:是否获取默认值函数移到active事件函数内，U3D修改active会重新获取默认值
            }
        }
        super._onAdded();
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onRemoved() {
        super._onRemoved();
        if (this._parent instanceof Sprite3D) {
            var parent3D = this._parent;
            this.transform._setParent(null);
            if (parent3D._hierarchyAnimator) {
                (this._hierarchyAnimator == parent3D._hierarchyAnimator) && (this._clearHierarchyAnimator(parent3D._hierarchyAnimator, null)); //_hierarchyAnimator不为空有意义
                parent3D._changeAnimatorsToLinkSprite3D(this, false, [this.name]); //TODO:是否获取默认值函数移到active事件函数内，U3D修改active会重新获取默认值
            }
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _parse(data, spriteMap) {
        (data.isStatic !== undefined) && (this._isStatic = data.isStatic);
        (data.active !== undefined) && (this.active = data.active);
        (data.name != undefined) && (this.name = data.name);
        if (data.position !== undefined) {
            var loccalPosition = this.transform.localPosition;
            loccalPosition.fromArray(data.position);
            this.transform.localPosition = loccalPosition;
        }
        if (data.rotationEuler !== undefined) {
            var localRotationEuler = this.transform.localRotationEuler;
            localRotationEuler.fromArray(data.rotationEuler);
            this.transform.localRotationEuler = localRotationEuler;
        }
        if (data.rotation !== undefined) {
            var localRotation = this.transform.localRotation;
            localRotation.fromArray(data.rotation);
            this.transform.localRotation = localRotation;
        }
        if (data.scale !== undefined) {
            var localScale = this.transform.localScale;
            localScale.fromArray(data.scale);
            this.transform.localScale = localScale;
        }
        (data.layer != undefined) && (this.layer = data.layer);
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    /*override*/ _cloneTo(destObject, srcRoot, dstRoot) {
        if (this.destroyed)
            throw new Error("Sprite3D: Can't be cloned if the Sprite3D has destroyed.");
        var destSprite3D = destObject;
        destSprite3D.name = this.name /* + "(clone)"*/; //TODO:克隆后不能播放刚体动画，找不到名字
        destSprite3D.destroyed = this.destroyed;
        destSprite3D.active = this.active;
        var destLocalPosition = destSprite3D.transform.localPosition;
        this.transform.localPosition.cloneTo(destLocalPosition);
        destSprite3D.transform.localPosition = destLocalPosition;
        var destLocalRotation = destSprite3D.transform.localRotation;
        this.transform.localRotation.cloneTo(destLocalRotation);
        destSprite3D.transform.localRotation = destLocalRotation;
        var destLocalScale = destSprite3D.transform.localScale;
        this.transform.localScale.cloneTo(destLocalScale);
        destSprite3D.transform.localScale = destLocalScale;
        destSprite3D._isStatic = this._isStatic;
        destSprite3D.layer = this.layer;
        super._cloneTo(destSprite3D, srcRoot, dstRoot);
    }
    /**
     * @private
     */
    static _createSprite3DInstance(scrSprite) {
        var node = scrSprite._create();
        var children = scrSprite._children;
        for (var i = 0, n = children.length; i < n; i++) {
            var child = Sprite3D._createSprite3DInstance(children[i]);
            node.addChild(child);
        }
        return node;
    }
    /**
     * @private
     */
    static _parseSprite3DInstance(srcRoot, dstRoot, scrSprite, dstSprite) {
        //scrSprite._cloneTo(dstSprite,srcRoot,dstRoot);//TODO:因为根据名字找Owner,子节点名字还未赋值有BUG
        var srcChildren = scrSprite._children;
        var dstChildren = dstSprite._children;
        for (var i = 0, n = srcChildren.length; i < n; i++)
            Sprite3D._parseSprite3DInstance(srcRoot, dstRoot, srcChildren[i], dstChildren[i]);
        scrSprite._cloneTo(dstSprite, srcRoot, dstRoot);
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dstSprite3D = Sprite3D._createSprite3DInstance(this);
        Sprite3D._parseSprite3DInstance(this, dstSprite3D, this, dstSprite3D);
        return dstSprite3D;
    }
    /**
     * @inheritDoc
     */
    /*override*/ destroy(destroyChild = true) {
        if (this.destroyed)
            return;
        super.destroy(destroyChild);
        this._transform = null;
        this._scripts = null;
        this._url && Loader.clearRes(this._url);
    }
    /**
     * @private
     */
    _create() {
        return new Sprite3D();
    }
}
/**Hierarchy资源。*/
Sprite3D.HIERARCHY = "HIERARCHY";
/**@private 着色器变量名，世界矩阵。*/
Sprite3D.WORLDMATRIX = Shader3D.propertyNameToID("u_WorldMat");
/**@private 着色器变量名，世界视图投影矩阵。*/
Sprite3D.MVPMATRIX = Shader3D.propertyNameToID("u_MvpMatrix");
/*;*/
/**@private */
Sprite3D._uniqueIDCounter = 0;
