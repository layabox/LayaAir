import { Stat } from "../../../utils/Stat";
import { BoundBox } from "../../math/BoundBox";
import { BoundFrustum } from "../../math/BoundFrustum";
import { CollisionUtils } from "../../math/CollisionUtils";
import { Color } from "../../math/Color";
import { ContainmentType } from "../../math/ContainmentType";
import { Ray } from "../../math/Ray";
import { Vector3 } from "../../math/Vector3";
import { Utils3D } from "../../utils/Utils3D";
import { PixelLineSprite3D } from "../pixelLine/PixelLineSprite3D";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { RenderElement } from "../render/RenderElement";
import { IOctreeObject } from "./IOctreeObject";
import { Scene3D } from "./Scene3D";
import { BoundsOctree } from "./BoundsOctree";
import { Shader3D } from "../../shader/Shader3D";
import { CameraCullInfo } from "../../graphics/FrustumCulling";

/**
 * <code>BoundsOctreeNode</code> 类用于创建八叉树节点。
 */
export class BoundsOctreeNode {
	/**@internal */
	private static _tempVector30: Vector3 = new Vector3();
	/**@internal */
	private static _tempColor0: Color = new Color();
	/**@internal */
	private static _tempBoundBox: BoundBox = new BoundBox(new Vector3(), new Vector3());

	/**@internal */
	private static _NUM_OBJECTS_ALLOWED: number = 8;

	/**
	 * @internal
	 */
	private static _encapsulates(outerBound: BoundBox, innerBound: BoundBox): boolean {
		return CollisionUtils.boxContainsBox(outerBound, innerBound) == ContainmentType.Contains;
	}

	/**@internal */
	_octree: BoundsOctree;
	/**@internal */
	_parent: BoundsOctreeNode;
	/**@internal AABB包围盒*/
	private _bounds: BoundBox = new BoundBox(new Vector3(), new Vector3());
	/**@internal */
	private _objects: IOctreeObject[] = [];

	/**@internal */
	_children: BoundsOctreeNode[];
	/**@internal [Debug]*/
	_isContaion: boolean = false;

	/**@internal	[只读]*/
	center: Vector3 = new Vector3();
	/**@internal	[只读]*/
	baseLength: number = 0.0;

	/**
	 * 创建一个 <code>BoundsOctreeNode</code> 实例。
	 * @param octree  所属八叉树。
	 * @param parent  父节点。
	 * @param baseLength  节点基本长度。
	 * @param center  节点的中心位置。
	 */
	constructor(octree: BoundsOctree, parent: BoundsOctreeNode, baseLength: number, center: Vector3) {
		this._setValues(octree, parent, baseLength, center);
	}

	/**
	 * @internal
	 */
	private _setValues(octree: BoundsOctree, parent: BoundsOctreeNode, baseLength: number, center: Vector3): void {
		this._octree = octree;
		this._parent = parent;
		this.baseLength = baseLength;
		center.cloneTo(this.center);//避免引用错乱
		var min: Vector3 = this._bounds.min;
		var max: Vector3 = this._bounds.max;
		var halfSize: number = (octree._looseness * baseLength) / 2;
		min.setValue(center.x - halfSize, center.y - halfSize, center.z - halfSize);
		max.setValue(center.x + halfSize, center.y + halfSize, center.z + halfSize);
	}

	/**
	 * @internal
	 */
	private _getChildBound(index: number): BoundBox {
		if (this._children != null && this._children[index]) {
			return this._children[index]._bounds;
		} else {
			var quarter: number = this.baseLength / 4;
			var halfChildSize: number = ((this.baseLength / 2) * this._octree._looseness) / 2;
			var bounds: BoundBox = BoundsOctreeNode._tempBoundBox;
			var min: Vector3 = bounds.min;
			var max: Vector3 = bounds.max;
			switch (index) {
				case 0:
					min.x = this.center.x - quarter - halfChildSize;
					min.y = this.center.y + quarter - halfChildSize;
					min.z = this.center.z - quarter - halfChildSize;
					max.x = this.center.x - quarter + halfChildSize;
					max.y = this.center.y + quarter + halfChildSize;
					max.z = this.center.z - quarter + halfChildSize;
					break;
				case 1:
					min.x = this.center.x + quarter - halfChildSize;
					min.y = this.center.y + quarter - halfChildSize;
					min.z = this.center.z - quarter - halfChildSize;
					max.x = this.center.x + quarter + halfChildSize;
					max.y = this.center.y + quarter + halfChildSize;
					max.z = this.center.z - quarter + halfChildSize;
					break;
				case 2:
					min.x = this.center.x - quarter - halfChildSize;
					min.y = this.center.y + quarter - halfChildSize;
					min.z = this.center.z + quarter - halfChildSize;
					max.x = this.center.x - quarter + halfChildSize;
					max.y = this.center.y + quarter + halfChildSize;
					max.z = this.center.z + quarter + halfChildSize;
					break;
				case 3:
					min.x = this.center.x + quarter - halfChildSize;
					min.y = this.center.y + quarter - halfChildSize;
					min.z = this.center.z + quarter - halfChildSize;
					max.x = this.center.x + quarter + halfChildSize;
					max.y = this.center.y + quarter + halfChildSize;
					max.z = this.center.z + quarter + halfChildSize;
					break;
				case 4:
					min.x = this.center.x - quarter - halfChildSize;
					min.y = this.center.y - quarter - halfChildSize;
					min.z = this.center.z - quarter - halfChildSize;
					max.x = this.center.x - quarter + halfChildSize;
					max.y = this.center.y - quarter + halfChildSize;
					max.z = this.center.z - quarter + halfChildSize;
					break;
				case 5:
					min.x = this.center.x + quarter - halfChildSize;
					min.y = this.center.y - quarter - halfChildSize;
					min.z = this.center.z - quarter - halfChildSize;
					max.x = this.center.x + quarter + halfChildSize;
					max.y = this.center.y - quarter + halfChildSize;
					max.z = this.center.z - quarter + halfChildSize;
					break;
				case 6:
					min.x = this.center.x - quarter - halfChildSize;
					min.y = this.center.y - quarter - halfChildSize;
					min.z = this.center.z + quarter - halfChildSize;
					max.x = this.center.x - quarter + halfChildSize;
					max.y = this.center.y - quarter + halfChildSize;
					max.z = this.center.z + quarter + halfChildSize;
					break;
				case 7:
					min.x = this.center.x + quarter - halfChildSize;
					min.y = this.center.y - quarter - halfChildSize;
					min.z = this.center.z + quarter - halfChildSize;
					max.x = this.center.x + quarter + halfChildSize;
					max.y = this.center.y - quarter + halfChildSize;
					max.z = this.center.z + quarter + halfChildSize;
					break;
				default:
			}
			return bounds;
		}
	}

	/**
	 * @internal
	 */
	private _getChildCenter(index: number): Vector3 {
		if (this._children != null) {
			return this._children[index].center;
		} else {
			var quarter: number = this.baseLength / 4;
			var childCenter: Vector3 = BoundsOctreeNode._tempVector30;
			switch (index) {
				case 0:
					childCenter.x = this.center.x - quarter;
					childCenter.y = this.center.y + quarter;
					childCenter.z = this.center.z - quarter;
					break;
				case 1:
					childCenter.x = this.center.x + quarter;
					childCenter.y = this.center.y + quarter;
					childCenter.z = this.center.z - quarter;
					break;
				case 2:
					childCenter.x = this.center.x - quarter;
					childCenter.y = this.center.y + quarter;
					childCenter.z = this.center.z + quarter;
					break;
				case 3:
					childCenter.x = this.center.x + quarter;
					childCenter.y = this.center.y + quarter;
					childCenter.z = this.center.z + quarter;
					break;
				case 4:
					childCenter.x = this.center.x - quarter;
					childCenter.y = this.center.y - quarter;
					childCenter.z = this.center.z - quarter;
					break;
				case 5:
					childCenter.x = this.center.x + quarter;
					childCenter.y = this.center.y - quarter;
					childCenter.z = this.center.z - quarter;
					break;
				case 6:
					childCenter.x = this.center.x - quarter;
					childCenter.y = this.center.y - quarter;
					childCenter.z = this.center.z + quarter;
					break;
				case 7:
					childCenter.x = this.center.x + quarter;
					childCenter.y = this.center.y - quarter;
					childCenter.z = this.center.z + quarter;
					break;
				default:
			}
			return childCenter;
		}
	}

	/**
	 * @internal
	 */
	private _getChild(index: number): BoundsOctreeNode {
		var quarter: number = this.baseLength / 4;
		this._children || (this._children = []);
		switch (index) {
			case 0:
				return this._children[0] || (this._children[0] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x + -quarter, this.center.y + quarter, this.center.z - quarter)));
			case 1:
				return this._children[1] || (this._children[1] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x + quarter, this.center.y + quarter, this.center.z - quarter)));
			case 2:
				return this._children[2] || (this._children[2] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x - quarter, this.center.y + quarter, this.center.z + quarter)));
			case 3:
				return this._children[3] || (this._children[3] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x + quarter, this.center.y + quarter, this.center.z + quarter)));
			case 4:
				return this._children[4] || (this._children[4] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x - quarter, this.center.y - quarter, this.center.z - quarter)));
			case 5:
				return this._children[5] || (this._children[5] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x + quarter, this.center.y - quarter, this.center.z - quarter)));
			case 6:
				return this._children[6] || (this._children[6] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x - quarter, this.center.y - quarter, this.center.z + quarter)));
			case 7:
				return this._children[7] || (this._children[7] = new BoundsOctreeNode(this._octree, this, this.baseLength / 2, new Vector3(this.center.x + quarter, this.center.y - quarter, this.center.z + quarter)));
			default:
				throw "BoundsOctreeNode: unknown index.";
		}
	}

	/**
	 * @internal
	 * 是否合并判断(如果该节点和子节点包含的物体小于_NUM_OBJECTS_ALLOWED则应将子节点合并到该节点)
	 */
	private _shouldMerge(): boolean {//无子节点不能调用该函数
		var objectCount: number = this._objects.length;
		for (var i: number = 0; i < 8; i++) {
			var child: BoundsOctreeNode = this._children[i];
			if (child) {
				if (child._children != null) //有孙子节点不合并
					return false;
				objectCount += child._objects.length;
			}
		}
		return objectCount <= BoundsOctreeNode._NUM_OBJECTS_ALLOWED;
	}

	/**
	 * @internal
	 */
	private _mergeChildren(): void {
		for (var i: number = 0; i < 8; i++) {
			var child: BoundsOctreeNode = this._children[i];
			if (child) {
				child._parent = null;
				var childObjects: IOctreeObject[] = child._objects;
				for (var j: number = childObjects.length - 1; j >= 0; j--) {
					var childObject: IOctreeObject = childObjects[j];
					this._objects.push(childObject);
					childObject._setOctreeNode(this);
				}
			}
		}

		this._children = null;
	}

	/**
	 * @internal
	 */
	private _merge(): void {
		if (this._children === null) {
			var parent: BoundsOctreeNode = this._parent;
			if (parent && parent._shouldMerge()) {
				parent._mergeChildren();
				parent._merge();
			}
		}
	}

	/**
	 * @internal
	 */
	private _checkAddNode(object: IOctreeObject): BoundsOctreeNode {
		//始终将物体放入可能的最深层子节点，如果有子节点可以跳过检查
		if (this._children == null) {
			//如果该节点当前为末级节点,包含物体小于_NUM_OBJECTS_ALLOWED数量或不能再创建子节点,则存入该节点
			if (this._objects.length < BoundsOctreeNode._NUM_OBJECTS_ALLOWED || (this.baseLength / 2) < this._octree._minSize) {
				return this;
			}

			for (var i: number = this._objects.length - 1; i >= 0; i--) {//已有新子节点,检查已经存在的物体是否更适合子节点
				var existObject: IOctreeObject = this._objects[i];
				var fitChildIndex: number = this._bestFitChild(existObject.bounds.getCenter());
				if (BoundsOctreeNode._encapsulates(this._getChildBound(fitChildIndex), existObject.bounds._getBoundBox())) {
					this._objects.splice(this._objects.indexOf(existObject), 1);//当前节点移除
					this._getChild(fitChildIndex)._add(existObject);//加入更深层节点
				}
			}
		}

		var newFitChildIndex: number = this._bestFitChild(object.bounds.getCenter());
		if (BoundsOctreeNode._encapsulates(this._getChildBound(newFitChildIndex), object.bounds._getBoundBox()))
			return this._getChild(newFitChildIndex)._checkAddNode(object);
		else
			return this;
	}

	/**
	 * @internal
	 */
	private _add(object: IOctreeObject): void {
		var addNode: BoundsOctreeNode = this._checkAddNode(object);
		addNode._objects.push(object);
		object._setOctreeNode(addNode);
	}

	/**
	 * @internal
	 */
	private _remove(object: IOctreeObject): void {
		var index: number = this._objects.indexOf(object);
		this._objects.splice(index, 1);
		object._setOctreeNode(null);
		this._merge();
	}

	/**
	 * @internal
	 */
	private _addUp(object: IOctreeObject): boolean {
		if ((CollisionUtils.boxContainsBox(this._bounds, object.bounds._getBoundBox()) === ContainmentType.Contains)) {
			this._add(object);
			return true;
		} else {
			if (this._parent)
				return this._parent._addUp(object);
			else
				return false;
		}
	}

	/**
	 * @internal
	 */
	private _getCollidingWithFrustum(cameraCullInfo: CameraCullInfo, context: RenderContext3D, testVisible: boolean, customShader: Shader3D, replacementTag: string, isShadowCasterCull: boolean): void {
		//if (_children === null && _objects.length == 0) {//无用末级节不需要检查，调试用
		//debugger;
		//return;
		//}

		var frustum: BoundFrustum = cameraCullInfo.boundFrustum;
		var camPos: Vector3 = cameraCullInfo.position;
		var cullMask: number = cameraCullInfo.cullingMask;

		if (testVisible) {
			var type: number = frustum.containsBoundBox(this._bounds);
			Stat.octreeNodeCulling++;
			if (type === ContainmentType.Disjoint){
				for (var i: number = 0, n: number = this._objects.length; i < n; i++){
					(this._objects[i] as BaseRender)._OctreeNoRender();
				}
				return;
			}
			testVisible = (type === ContainmentType.Intersects);
		}
		this._isContaion = !testVisible;//[Debug] 用于调试信息,末级无用子节点不渲染、脱节节点看不见,所以无需更新变量

		//检查节点中的对象
		var scene: Scene3D = context.scene;
		var loopCount: number = Stat.loopCount;
		for (var i: number = 0, n: number = this._objects.length; i < n; i++) {
			var render: BaseRender = <BaseRender>this._objects[i];
			var canPass: boolean;
			if (isShadowCasterCull)
				canPass = render._castShadow && render._enable;
			else
				canPass = (((Math.pow(2, render._owner._layer) & cullMask) != 0)) && render._enable;
			if (canPass) {
				if (testVisible) {
					Stat.frustumCulling++;
					if (!render._needRender(frustum, context))
						continue;
				}

				render._renderMark = loopCount;
				render._distanceForSort = Vector3.distance(render.bounds.getCenter(), camPos);//TODO:合并计算浪费,或者合并后取平均值
				var elements: RenderElement[] = render._renderElements;
				for (var j: number = 0, m: number = elements.length; j < m; j++) {
					var element: RenderElement = elements[j];
					element._update(scene, context, customShader, replacementTag);
				}
			}
		}

		//检查子节点
		if (this._children != null) {
			for (i = 0; i < 8; i++) {
				var child: BoundsOctreeNode = this._children[i];
				child && child._getCollidingWithFrustum(cameraCullInfo, context, testVisible, customShader, replacementTag, isShadowCasterCull);
			}
		}
	}

	/**
	 * @internal
	 */
	private _getCollidingWithBoundBox(checkBound: BoundBox, testVisible: boolean, result: any[]): void {
		//if (_children === null && _objects.length == 0){//无用末级节不需要检查，调试用
		//debugger;
		//return;
		//}

		//检查checkBound是否部分在_bounds中
		if (testVisible) {
			var type: number = CollisionUtils.boxContainsBox(this._bounds, checkBound);
			if (type === ContainmentType.Disjoint)
				return;
			testVisible = (type === ContainmentType.Intersects);
		}

		//检查节点中的对象
		if (testVisible) {
			for (var i: number = 0, n: number = this._objects.length; i < n; i++) {
				var object: IOctreeObject = this._objects[i];
				if (CollisionUtils.intersectsBoxAndBox(object.bounds._getBoundBox(), checkBound)) {
					result.push(object);
				}
			}
		}

		//检查子节点
		if (this._children != null) {
			for (i = 0; i < 8; i++) {
				var child: BoundsOctreeNode = this._children[i];
				child._getCollidingWithBoundBox(checkBound, testVisible, result);
			}
		}
	}

	/**
	 * @internal
	 */
	_bestFitChild(boundCenter: Vector3): number {
		return (boundCenter.x <= this.center.x ? 0 : 1) + (boundCenter.y >= this.center.y ? 0 : 4) + (boundCenter.z <= this.center.z ? 0 : 2);
	}

	/**
	 * @internal
	 * @return 是否需要扩充根节点
	 */
	_update(object: IOctreeObject): boolean {
		if (CollisionUtils.boxContainsBox(this._bounds, object.bounds._getBoundBox()) === ContainmentType.Contains) {//addDown
			var addNode: BoundsOctreeNode = this._checkAddNode(object);
			if (addNode !== object._getOctreeNode()) {
				addNode._objects.push(object);
				object._setOctreeNode(addNode);
				var index: number = this._objects.indexOf(object);
				this._objects.splice(index, 1);
				this._merge();
			}
			return true;
		} else {//addUp
			if (this._parent) {
				var sucess: boolean = this._parent._addUp(object);
				if (sucess) {//移除成功后才缩减节点,并且在最后移除否则可能造成节点层断裂
					index = this._objects.indexOf(object);
					this._objects.splice(index, 1);
					this._merge();
				}
				return sucess;
			} else {
				return false;
			}
		}
	}

	/**
	 * 添加指定物体。
	 * @param	object 指定物体。
	 */
	add(object: IOctreeObject): boolean {
		if (!BoundsOctreeNode._encapsulates(this._bounds, object.bounds._getBoundBox())) //如果不包含,直接return false
			return false;
		this._add(object);
		return true;
	}

	/**
	 * 移除指定物体。
	 * @param	obejct 指定物体。
	 * @return 是否成功。
	 */
	remove(object: IOctreeObject): boolean {
		if (object._getOctreeNode() !== this)
			return false;
		this._remove(object);
		return true;
	}

	/**
	 * 更新制定物体，
	 * @param	obejct 指定物体。
	 * @return 是否成功。
	 */
	update(object: IOctreeObject): boolean {
		if (object._getOctreeNode() !== this)
			return false;
		return this._update(object);
	}

	/**
	 * 	收缩八叉树节点。
	 *	-所有物体都在根节点的八分之一区域
	 * 	-该节点无子节点或有子节点但1/8的子节点不包含物体
	 *	@param minLength 最小尺寸。
	 * 	@return 新的根节点。
	 */
	shrinkIfPossible(minLength: number): BoundsOctreeNode {
		if (this.baseLength < minLength * 2)//该节点尺寸大于等于minLength*2才收缩
			return this;

		//检查根节点的物体
		var bestFit: number = -1;
		for (var i: number = 0, n: number = this._objects.length; i < n; i++) {
			var object: IOctreeObject = this._objects[i];
			var newBestFit: number = this._bestFitChild(object.bounds.getCenter());
			if (i == 0 || newBestFit == bestFit) {//判断所有的物理是否在同一个子节点中
				var childBounds: BoundBox = this._getChildBound(newBestFit);
				if (BoundsOctreeNode._encapsulates(childBounds, object.bounds._getBoundBox()))
					(i == 0) && (bestFit = newBestFit);
				else //不能缩减,适合位置的子节点不能全包
					return this;
			} else {//不在同一个子节点不能缩减
				return this;
			}
		}

		// 检查子节点的物体是否在同一缩减区域
		if (this._children != null) {
			var childHadContent: boolean = false;
			for (i = 0, n = this._children.length; i < n; i++) {
				var child: BoundsOctreeNode = this._children[i];
				if (child && child.hasAnyObjects()) {
					if (childHadContent)
						return this; // 大于等于两个子节点有物体,不能缩减

					if (bestFit >= 0 && bestFit != i)
						return this; //包含物体的子节点并非最佳索引,不能缩减
					childHadContent = true;
					bestFit = i;
				}
			}
		} else {
			if (bestFit != -1) {//无子节点,直接缩减本节点
				var childCenter: Vector3 = this._getChildCenter(bestFit);
				this._setValues(this._octree, null, this.baseLength / 2, childCenter);
			}
			return this;
		}

		if (bestFit != -1) {
			var newRoot: BoundsOctreeNode = this._children[bestFit];//用合适的子节点作为新的根节点,bestFit!=-1,_children[bestFit]一定有值
			newRoot._parent = null;//根节点需要置空父节点
			return newRoot;
		} else {// 整个节点包括子节点没有物体
			return this;
		}
	}

	/**
	 * 检查该节点和其子节点是否包含任意物体。
	 * @return 是否包含任意物体。
	 */
	hasAnyObjects(): boolean {
		if (this._objects.length > 0)
			return true;

		if (this._children != null) {
			for (var i: number = 0; i < 8; i++) {
				var child: BoundsOctreeNode = this._children[i];
				if (child && child.hasAnyObjects())
					return true;
			}
		}
		return false;
	}

	/**
	 * 获取与指定包围盒相交的物体列表。
	 * @param checkBound AABB包围盒。
	 * @param result 相交物体列表
	 */
	getCollidingWithBoundBox(checkBound: BoundBox, result: any[]): void {
		this._getCollidingWithBoundBox(checkBound, true, result);
	}

	/**
	 *	获取与指定射线相交的的物理列表。
	 * 	@param	ray 射线。
	 * 	@param	result 相交物体列表。
	 * 	@param	maxDistance 射线的最大距离。
	 */
	getCollidingWithRay(ray: Ray, result: any[], maxDistance: number = Number.MAX_VALUE): void {
		var distance: number = CollisionUtils.intersectsRayAndBoxRD(ray, this._bounds);
		if (distance == -1 || distance > maxDistance)
			return;

		//检查节点中的对象
		for (var i: number = 0, n: number = this._objects.length; i < n; i++) {
			var object: IOctreeObject = this._objects[i];
			distance = CollisionUtils.intersectsRayAndBoxRD(ray, object.bounds._getBoundBox());
			if (distance !== -1 && distance <= maxDistance)
				result.push(object);
		}

		//检查子节点
		if (this._children != null) {
			for (i = 0; i < 8; i++) {
				var child: BoundsOctreeNode = this._children[i];
				child.getCollidingWithRay(ray, result, maxDistance);
			}
		}
	}

	/**
	 *	获取与指定视锥相交的的物理列表。
	 * 	@param	ray 射线。.
	 * 	@param	result 相交物体列表。
	 */
	getCollidingWithFrustum(cameraCullInfo: CameraCullInfo, context: RenderContext3D, customShader: Shader3D, replacementTag: string, isShadowCasterCull: boolean): void {
		this._getCollidingWithFrustum(cameraCullInfo, context, true, customShader, replacementTag, isShadowCasterCull);
	}

	/**
	 * 获取是否与指定包围盒相交。
	 * @param checkBound AABB包围盒。
	 * @return 是否相交。
	 */
	isCollidingWithBoundBox(checkBound: BoundBox): boolean {
		//检查checkBound是否部分在_bounds中
		if (!(CollisionUtils.intersectsBoxAndBox(this._bounds, checkBound)))
			return false;

		//检查节点中的对象
		for (var i: number = 0, n: number = this._objects.length; i < n; i++) {
			var object: IOctreeObject = this._objects[i];
			if (CollisionUtils.intersectsBoxAndBox(object.bounds._getBoundBox(), checkBound))
				return true;
		}

		//检查子节点
		if (this._children != null) {
			for (i = 0; i < 8; i++) {
				var child: BoundsOctreeNode = this._children[i];
				if (child.isCollidingWithBoundBox(checkBound))
					return true;
			}
		}
		return false;
	}

	/**
	 *	获取是否与指定射线相交。
	 * 	@param	ray 射线。
	 * 	@param	maxDistance 射线的最大距离。
	 *  @return 是否相交。
	 */
	isCollidingWithRay(ray: Ray, maxDistance: number = Number.MAX_VALUE): boolean {
		var distance: number = CollisionUtils.intersectsRayAndBoxRD(ray, this._bounds);
		if (distance == -1 || distance > maxDistance)
			return false;

		//检查节点中的对象
		for (var i: number = 0, n: number = this._objects.length; i < n; i++) {
			var object: IOctreeObject = this._objects[i];
			distance = CollisionUtils.intersectsRayAndBoxRD(ray, object.bounds._getBoundBox());
			if (distance !== -1 && distance <= maxDistance)
				return true;
		}

		//检查子节点
		if (this._children != null) {
			for (i = 0; i < 8; i++) {
				var child: BoundsOctreeNode = this._children[i];
				if (child.isCollidingWithRay(ray, maxDistance))
					return true;
			}
		}
		return false;
	}

	/**
	 * 获取包围盒。
	 */
	getBound(): BoundBox {
		return this._bounds;
	}

	/**
	 * @internal
	 * [Debug]
	 */
	drawAllBounds(debugLine: PixelLineSprite3D, currentDepth: number, maxDepth: number): void {
		if (this._children === null && this._objects.length == 0)//无用末级节不需要渲染
			return;

		currentDepth++;
		var color: Color = BoundsOctreeNode._tempColor0;
		if (this._isContaion) {
			color.r = 0.0;
			color.g = 0.0;
			color.b = 1.0;
		} else {
			var tint: number = maxDepth ? currentDepth / maxDepth : 0;
			color.r = 1.0 - tint;
			color.g = tint;
			color.b = 0.0;
		}
		color.a = 0.3;
		Utils3D._drawBound(debugLine, this._bounds, color);
		if (this._children != null) {
			for (var i: number = 0; i < 8; i++) {
				var child: BoundsOctreeNode = this._children[i];
				child && child.drawAllBounds(debugLine, currentDepth, maxDepth);
			}
		}
	}

	/**
	 * @internal
	 * [Debug]
	 */
	drawAllObjects(debugLine: PixelLineSprite3D, currentDepth: number, maxDepth: number): void {
		currentDepth++;

		var color: Color = BoundsOctreeNode._tempColor0;
		if (this._isContaion) {
			color.r = 0.0;
			color.g = 0.0;
			color.b = 1.0;
		} else {
			var tint: number = maxDepth ? currentDepth / maxDepth : 0;
			color.r = 1.0 - tint;
			color.g = tint;
			color.b = 0.0;
		}
		color.a = 1.0;

		for (var i: number = 0, n: number = this._objects.length; i < n; i++)
			Utils3D._drawBound(debugLine, this._objects[i].bounds._getBoundBox(), color);

		if (this._children != null) {
			for (i = 0; i < 8; i++) {
				var child: BoundsOctreeNode = this._children[i];
				child && child.drawAllObjects(debugLine, currentDepth, maxDepth);
			}
		}
	}

}


