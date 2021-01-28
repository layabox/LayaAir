//@ts-nocheck
import { Node } from "../../display/Node";
import { Loader } from "../../net/Loader";
import { URL } from "../../net/URL";
import { Handler } from "../../utils/Handler";
import { Animator } from "../component/Animator";
import { Script3D } from "../component/Script3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Shader3D } from "../shader/Shader3D";
import { Avatar } from "./Avatar";
import { Transform3D } from "./Transform3D";
import { Laya } from "../../../Laya";
import { ICreateResource } from "../../resource/ICreateResource";

/**
 * <code>Sprite3D</code> 类用于实现3D精灵。
 */
export class Sprite3D extends Node implements ICreateResource {
	/**Hierarchy资源。*/
	static HIERARCHY: string = "HIERARCHY";

	/**@internal 着色器变量名，世界矩阵。*/
	static WORLDMATRIX: number = Shader3D.propertyNameToID("u_WorldMat");
	/**@internal 着色器变量名，世界视图投影矩阵。*/
	static MVPMATRIX: number = Shader3D.propertyNameToID("u_MvpMatrix");
	/*;*/

	/**@internal */
	protected static _uniqueIDCounter: number = 0;

	/**
	 * @internal
	 */
	static __init__(): void {
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
	static instantiate(original: Sprite3D, parent: Node = null, worldPositionStays: boolean = true, position: Vector3 = null, rotation: Quaternion = null): Sprite3D {
		var destSprite3D: Sprite3D = (<Sprite3D>original.clone());
		(parent) && (parent.addChild(destSprite3D));
		var transform: Transform3D = destSprite3D.transform;
		if (worldPositionStays) {
			var worldMatrix: Matrix4x4 = transform.worldMatrix;
			original.transform.worldMatrix.cloneTo(worldMatrix);
			transform.worldMatrix = worldMatrix;
		} else {
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
	static load(url: string, complete: Handler): void {
		Laya.loader.create(url, complete, null, Sprite3D.HIERARCHY);
	}

	/** @internal */
	private _id: number;

	/**@internal */
	private _url: string;

	/** @internal */
	_isStatic: boolean;
	/** @internal */
	_layer: number;
	/** @internal */
	_scripts: Script3D[];
	/**@internal */
	_transform: Transform3D;
	/** @internal */
	_hierarchyAnimator: Animator|null;
	/** @internal */
	_needProcessCollisions: boolean = false;
	/** @internal */
	_needProcessTriggers: boolean = false;

	/**
	 * 唯一标识ID。
	 */
	get id(): number {
		return this._id;
	}

	/**
	 * 蒙版层。
	 */
	get layer(): number {
		return this._layer;
	}

	set layer(value: number) {
		if (this._layer !== value) {
			if (value >= 0 && value <= 30) {
				this._layer = value;
			} else {
				throw new Error("Layer value must be 0-30.");
			}
		}
	}

	/**
	 * 资源的URL地址。
	 */
	get url(): string {
		return this._url;
	}

	/**
	 * 是否为静态。
	 */
	get isStatic(): boolean {
		return this._isStatic;
	}

	/**
	 * 精灵变换。
	 */
	get transform(): Transform3D {
		return this._transform;
	}

	/**
	 * 创建一个 <code>Sprite3D</code> 实例。
	 * @param name 精灵名称。
	 * @param isStatic 是否为静态。
	 */
	constructor(name: string = null, isStatic: boolean = false) {
		super();
		this._id = ++Sprite3D._uniqueIDCounter;
		this._transform = new Transform3D(this);
		this._isStatic = isStatic;
		this.layer = 0;
		this.name = name ? name : "New Sprite3D";
	}

	/**
	 * 
	 */
	_setCreateURL(url: string): void {
		this._url = URL.formatURL(url);//perfab根节点会设置URL
	}

	/**
	 * @internal
	 */
	private _changeAnimatorsToLinkSprite3D(sprite3D: Sprite3D, isLink: boolean, path: string[]): void {
		var animator: Animator = (<Animator>this.getComponent(Animator));
		if (animator) {
			if (!animator.avatar)
				sprite3D._changeAnimatorToLinkSprite3DNoAvatar(animator, isLink, path);
		}

		if (this._parent && this._parent instanceof Sprite3D) {
			path.unshift(this._parent.name);
			var p: Sprite3D = (<Sprite3D>this._parent);
			(p._hierarchyAnimator) && (p._changeAnimatorsToLinkSprite3D(sprite3D, isLink, path));
		}
	}

	/**
	 * @internal
	 */
	_setHierarchyAnimator(animator: Animator, parentAnimator: Animator|null): void {
		this._changeHierarchyAnimator(animator);
		this._changeAnimatorAvatar(animator.avatar);
		for (var i: number = 0, n: number = this._children.length; i < n; i++) {
			var child: Sprite3D = this._children[i];
			(child._hierarchyAnimator == parentAnimator) && (child._setHierarchyAnimator(animator, parentAnimator));
		}
	}

	/**
	 * @internal
	 */
	_clearHierarchyAnimator(animator: Animator, parentAnimator: Animator|null): void {
		this._changeHierarchyAnimator(parentAnimator);
		this._changeAnimatorAvatar(parentAnimator ? parentAnimator.avatar : null);
		for (var i: number = 0, n: number = this._children.length; i < n; i++) {
			var child: Sprite3D = this._children[i];
			(child._hierarchyAnimator == animator) && (child._clearHierarchyAnimator(animator, parentAnimator));
		}
	}

	/**
	 * @internal
	 */
	_changeHierarchyAnimatorAvatar(animator: Animator, avatar: Avatar|null): void {
		this._changeAnimatorAvatar(avatar);
		for (var i: number = 0, n: number = this._children.length; i < n; i++) {
			var child: Sprite3D = this._children[i];
			(child._hierarchyAnimator == animator) && (child._changeHierarchyAnimatorAvatar(animator, avatar));
		}
	}

	/**
	 * @internal
	 */
	_changeAnimatorToLinkSprite3DNoAvatar(animator: Animator, isLink: boolean, path: string[]): void {
		animator._handleSpriteOwnersBySprite(isLink, path, this);
		for (var i: number = 0, n: number = this._children.length; i < n; i++) {
			var child: Sprite3D = this._children[i];
			var index: number = path.length;
			path.push(child.name);
			child._changeAnimatorToLinkSprite3DNoAvatar(animator, isLink, path);
			path.splice(index, 1);
		}
	}

	/**
	 * @internal
	 */
	protected _changeHierarchyAnimator(animator: Animator|null): void {
		this._hierarchyAnimator = animator;
	}

	/**
	 * @internal
	 */
	protected _changeAnimatorAvatar(avatar: Avatar|null): void {
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onAdded(): void {
		if (this._parent instanceof Sprite3D) {
			var parent3D: Sprite3D = (<Sprite3D>this._parent);
			this.transform._setParent(parent3D.transform);
			if (parent3D._hierarchyAnimator) {
				(!this._hierarchyAnimator) && (this._setHierarchyAnimator(parent3D._hierarchyAnimator, null));//执行条件为sprite3D._hierarchyAnimator==parentAnimator,只有一种情况sprite3D._hierarchyAnimator=null成立,且_hierarchyAnimator不为空有意义
				parent3D._changeAnimatorsToLinkSprite3D(this, true, [this.name]);//TODO:是否获取默认值函数移到active事件函数内，U3D修改active会重新获取默认值
			}
		}
		super._onAdded();
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onRemoved(): void {
		super._onRemoved();

		if (this._parent instanceof Sprite3D) {
			var parent3D: Sprite3D = (<Sprite3D>this._parent);
			this.transform._setParent(null);
			if (parent3D._hierarchyAnimator) {
				(this._hierarchyAnimator == parent3D._hierarchyAnimator) && (this._clearHierarchyAnimator(parent3D._hierarchyAnimator, null));//_hierarchyAnimator不为空有意义
				parent3D._changeAnimatorsToLinkSprite3D(this, false, [this.name]);//TODO:是否获取默认值函数移到active事件函数内，U3D修改active会重新获取默认值
			}
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_parse(data: any, spriteMap: any): void {
		(data.isStatic !== undefined) && (this._isStatic = data.isStatic);
		(data.active !== undefined) && (this.active = data.active);
		(data.name != undefined) && (this.name = data.name);

		if (data.position !== undefined) {
			var loccalPosition: Vector3 = this.transform.localPosition;
			loccalPosition.fromArray(data.position);
			this.transform.localPosition = loccalPosition;
		}

		if (data.rotationEuler !== undefined) {
			var localRotationEuler: Vector3 = this.transform.localRotationEuler;
			localRotationEuler.fromArray(data.rotationEuler);
			this.transform.localRotationEuler = localRotationEuler;
		}
		if (data.rotation !== undefined) {
			var localRotation: Quaternion = this.transform.localRotation;
			localRotation.fromArray(data.rotation);
			this.transform.localRotation = localRotation;
		}

		if (data.scale !== undefined) {
			var localScale: Vector3 = this.transform.localScale;
			localScale.fromArray(data.scale);
			this.transform.localScale = localScale;
		}

		(data.layer != undefined) && (this.layer = data.layer);
	}

	/**
	 * @override
	 * @internal
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	_cloneTo(destObject: any, srcRoot: Node, dstRoot: Node): void {
		if (this.destroyed)
			throw new Error("Sprite3D: Can't be cloned if the Sprite3D has destroyed.");

		var destSprite3D: Sprite3D = <Sprite3D>destObject;
		var trans: Transform3D = this._transform;
		var destTrans: Transform3D = destSprite3D._transform;

		destSprite3D.name = this.name/* + "(clone)"*/;//TODO:克隆后不能播放刚体动画，找不到名字
		destSprite3D.destroyed = this.destroyed;
		destSprite3D.active = this.active;
		destTrans.localPosition = trans.localPosition;
		destTrans.localRotation = trans.localRotation;
		destTrans.localScale = trans.localScale;

		destSprite3D._isStatic = this._isStatic;
		destSprite3D.layer = this.layer;
		super._cloneTo(destSprite3D, srcRoot, dstRoot);
	}

	/**
	 * @internal
	 */
	private static _createSprite3DInstance(scrSprite: Sprite3D): Node {
		var node: Node = scrSprite._create();
		var children: any[] = scrSprite._children;
		for (var i: number = 0, n: number = children.length; i < n; i++) {
			var child: any = Sprite3D._createSprite3DInstance(children[i])
			node.addChild(child);
		}
		return node;
	}

	/**
	 * @internal
	 */
	private static _parseSprite3DInstance(srcRoot: Node, dstRoot: Node, scrSprite: Node, dstSprite: Node): void {
		//scrSprite._cloneTo(dstSprite,srcRoot,dstRoot);//TODO:因为根据名字找Owner,子节点名字还未赋值有BUG
		var srcChildren: any[] = scrSprite._children;
		var dstChildren: any[] = dstSprite._children;
		for (var i: number = 0, n: number = srcChildren.length; i < n; i++)
			Sprite3D._parseSprite3DInstance(srcRoot, dstRoot, srcChildren[i], dstChildren[i])
		scrSprite._cloneTo(dstSprite, srcRoot, dstRoot);
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): Node {
		var dstSprite3D: Node = Sprite3D._createSprite3DInstance(this);
		Sprite3D._parseSprite3DInstance(this, dstSprite3D, this, dstSprite3D);
		return dstSprite3D;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(destroyChild: boolean = true): void {
		if (this.destroyed)
			return;

		super.destroy(destroyChild);
		this._transform = null;
		this._scripts = null;
		this._url && Loader.clearRes(this._url);
	}

	/**
	 * @internal
	 */
	protected _create(): Node {
		return new Sprite3D();
	}
}

