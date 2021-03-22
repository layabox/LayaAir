import { Event } from "../../events/Event";
import { LayaGL } from "../../layagl/LayaGL";
import { Stat } from "../../utils/Stat";
import { AnimationNode } from "../animation/AnimationNode";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector3 } from "../math/Vector3";
import { Mesh, skinnedMatrixCache } from "../resource/models/Mesh";
import { SubMesh } from "../resource/models/SubMesh";
import { Utils3D } from "../utils/Utils3D";
import { Avatar } from "./Avatar";
import { Bounds } from "./Bounds";
import { MeshRenderer } from "./MeshRenderer";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { Sprite3D } from "./Sprite3D";
import { Transform3D } from "./Transform3D";
import { RenderContext3D } from "./render/RenderContext3D";
import { RenderElement } from "./render/RenderElement";
import { SkinnedMeshSprite3DShaderDeclaration } from "./SkinnedMeshSprite3DShaderDeclaration";
import { ReflectionProbeMode, ReflectionProbe } from "./reflectionProbe/ReflectionProbe";
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration";
import { TextureCube } from "../resource/TextureCube";
import { Animator } from "../component/Animator";
/**
 * <code>SkinMeshRenderer</code> 类用于蒙皮渲染器。
 */
export class SkinnedMeshRenderer extends MeshRenderer {
	/**@internal */
	private static _tempMatrix4x4: Matrix4x4 = new Matrix4x4();

	/**@internal */
	protected _cacheMesh: Mesh;
	/** @internal */
	protected _bones: Sprite3D[] = [];
	/** @internal */
	_skinnedData: any[];
	/** @internal */
	private _skinnedDataLoopMarks: number[] = [];
	/**@internal */
	protected _localBounds: Bounds = new Bounds(Vector3._ZERO, Vector3._ZERO);
	/**@internal */
	protected _cacheAnimator: Animator;
	/**@internal */
	protected _cacheRootBone: Sprite3D;

	/**
	 * 局部边界。
	 */
	get localBounds(): Bounds {
		return this._localBounds;
	}

	set localBounds(value: Bounds) {
		this._localBounds = value;
	}

	/**
	 * 根节点。
	 */
	get rootBone(): Sprite3D {
		return this._cacheRootBone;
	}

	set rootBone(value: Sprite3D) {
		if (this._cacheRootBone != value) {
			if (this._cacheRootBone)
				this._cacheRootBone.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
			else
				this._owner.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);

			if (value)
				value.transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
			else
				this._owner.transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);

			this._cacheRootBone = value;
			this._onWorldMatNeedChange(Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE);
		}
	}

	/**
	 * 用于蒙皮的骨骼。
	 */
	get bones(): Sprite3D[] {
		return this._bones;
	}

	/**
	 * 创建一个 <code>SkinnedMeshRender</code> 实例。
	 */
	constructor(owner: RenderableSprite3D) {
		super(owner);
	}


	/**
	 * @internal
	 */
	private _computeSkinnedData(): void {
		if (this._cacheMesh && this._cacheAvatar/*兼容*/ || this._cacheMesh && !this._cacheAvatar) {
			var bindPoses: Matrix4x4[] = this._cacheMesh._inverseBindPoses;
			var pathMarks: skinnedMatrixCache[] = this._cacheMesh._skinnedMatrixCaches;
			for (var i: number = 0, n: number = this._cacheMesh.subMeshCount; i < n; i++) {
				var subMeshBoneIndices: Uint16Array[] = ((<SubMesh>this._cacheMesh.getSubMesh(i)))._boneIndicesList;
				var subData: Float32Array[] = this._skinnedData[i];
				for (var j: number = 0, m: number = subMeshBoneIndices.length; j < m; j++) {
					var boneIndices: Uint16Array = subMeshBoneIndices[j];
					this._computeSubSkinnedData(bindPoses, boneIndices, subData[j], pathMarks);
				}
			}
		}
	}

	/**
	 * @internal
	 */
	private _computeSubSkinnedData(bindPoses: Matrix4x4[], boneIndices: Uint16Array, data: Float32Array, matrixCaches: skinnedMatrixCache[]): void {
		for (var k: number = 0, q: number = boneIndices.length; k < q; k++) {
			var index: number = boneIndices[k];
			if (this._skinnedDataLoopMarks[index] === Stat.loopCount) {
				var c: skinnedMatrixCache = matrixCaches[index];
				var preData: Float32Array = this._skinnedData[c.subMeshIndex][c.batchIndex];
				var srcIndex: number = c.batchBoneIndex * 16;
				var dstIndex: number = k * 16;
				for (var d: number = 0; d < 16; d++)
					data[dstIndex + d] = preData[srcIndex + d];
			} else {
				if (!this._cacheAvatar) {
					Utils3D._mulMatrixArray(this._bones[index].transform.worldMatrix.elements, bindPoses[index].elements,0, data, k * 16);
				} else {//[兼容代码]
					Utils3D._mulMatrixArray(this._cacheAnimationNode[index].transform.getWorldMatrix(), bindPoses[index].elements,0, data, k * 16);
				}
				this._skinnedDataLoopMarks[index] = Stat.loopCount;
			}
		}
	}

	/**
	 * @internal
	 * @override
	 */
	protected _onWorldMatNeedChange(flag: number): void {
		this._boundsChange = true;
		if (this._octreeNode) {
			if (this._cacheAvatar) {//兼容性 
				if (this._indexInOctreeMotionList === -1)//_octreeNode表示在八叉树队列中
					this._octreeNode._octree.addMotionObject(this);
			}
			else {
				flag &= Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE;//过滤有用TRANSFORM标记
				if (flag) {
					if (this._indexInOctreeMotionList === -1)//_octreeNode表示在八叉树队列中
						this._octreeNode._octree.addMotionObject(this);
				}
			}
		}
	}

	/**
	 *@inheritDoc
	 *@override
	 *@internal
	 */
	_createRenderElement(): RenderElement {
		return new RenderElement();
	}

	/**
	*@inheritDoc
	*@override
	*@internal
	*/
	_onMeshChange(value: Mesh): void {
		super._onMeshChange(value);
		this._cacheMesh = (<Mesh>value);

		var subMeshCount: number = value.subMeshCount;
		this._skinnedData = [];
		this._skinnedDataLoopMarks.length = value._inverseBindPoses.length;
		for (var i: number = 0; i < subMeshCount; i++) {
			var subBoneIndices: Uint16Array[] = ((<SubMesh>value.getSubMesh(i)))._boneIndicesList;
			var subCount: number = subBoneIndices.length;
			var subData: Float32Array[] = this._skinnedData[i] = [];
			for (var j: number = 0; j < subCount; j++)
				subData[j] = new Float32Array(subBoneIndices[j].length * 16);
		}

		(this._cacheAvatar && value) && (this._getCacheAnimationNodes());//[兼容性]
	}

	/**
	 * @internal
	 */
	_setCacheAnimator(animator: Animator): void {
		this._cacheAnimator = animator;
		this._shaderValues.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE);
		this._setRootNode();//[兼容性API]
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _calculateBoundingBox(): void {//TODO:是否可直接在boundingSphere属性计算优化
		if (!this._cacheAvatar) {
			if (this._cacheRootBone)
				this._localBounds._tranform(this._cacheRootBone.transform.worldMatrix, this._bounds);
			else
				this._localBounds._tranform(this._owner.transform.worldMatrix, this._bounds);

		} else {//[兼容性API]
			if (this._cacheAnimator && this._rootBone) {
				var worldMat: Matrix4x4 = SkinnedMeshRenderer._tempMatrix4x4;
				Utils3D.matrix4x4MultiplyMFM(((<Sprite3D>this._cacheAnimator.owner)).transform.worldMatrix, this._cacheRootAnimationNode.transform.getWorldMatrix(), worldMat);
				this._localBounds._tranform(worldMat, this._bounds);
			} else {
				super._calculateBoundingBox();
			}
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_renderUpdate(context: RenderContext3D, transform: Transform3D): void {
		if (this._cacheAnimator) {
			this._computeSkinnedData();
			if (!this._cacheAvatar) {
				this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
			} else {//[兼容性]
				var aniOwnerTrans: Transform3D = ((<Sprite3D>this._cacheAnimator.owner))._transform;
				this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, aniOwnerTrans.worldMatrix);
			}
		} else {
			this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
		}
		//更新反射探针
		if(!this._probReflection)
		return;
		if(this._reflectionMode==ReflectionProbeMode.off){
			this._shaderValues.removeDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
			this._shaderValues.setVector(RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS,ReflectionProbe.defaultTextureHDRDecodeValues);
			this._shaderValues.setTexture(RenderableSprite3D.REFLECTIONTEXTURE,TextureCube.blackTexture);
		}
		else{
			if(!this._probReflection.boxProjection){
				this._shaderValues.removeDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
				
			}
			else{
				this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
				this._shaderValues.setVector3(RenderableSprite3D.REFLECTIONCUBE_PROBEPOSITION,this._probReflection.probePosition);
				this._shaderValues.setVector3(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMAX,this._probReflection.boundsMax);
				this._shaderValues.setVector3(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMIN,this._probReflection.boundsMin);
			}
			this._shaderValues.setTexture(RenderableSprite3D.REFLECTIONTEXTURE,this._probReflection.reflectionTexture);
			this._shaderValues.setVector(RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS,this._probReflection.reflectionHDRParams);
			
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void {
		var projectionView: Matrix4x4 = context.projectionViewMatrix;
		if (this._cacheAnimator) {
			if (!this._cacheAvatar) {
				this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
			}
			else {//[兼容性]
				var aniOwnerTrans: Transform3D = ((<Sprite3D>this._cacheAnimator.owner))._transform;
				Matrix4x4.multiply(projectionView, aniOwnerTrans.worldMatrix, this._projectionViewWorldMatrix);
				this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
			}
		} else {
			Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
			this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_destroy(): void {
		super._destroy();
		if (!this._cacheAvatar) {
			if (this._cacheRootBone)
				(!this._cacheRootBone.destroyed) && (this._cacheRootBone.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));
			else
				(this._owner && !this._owner.destroyed) && (this._owner.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));
		} else {//[兼容性]
			if (this._cacheRootAnimationNode)
				this._cacheRootAnimationNode.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
		}
	}

	//-----------------------------------------------------------------------------------------------------------------------------------------------------------

	/**@internal */
	_rootBone: string;//[兼容性API]
	/**@internal */
	private _cacheAvatar: Avatar;//[兼容性API]
	/**@internal */
	private _cacheRootAnimationNode: AnimationNode;//[兼容性API]
	/** @internal */
	private _cacheAnimationNode: AnimationNode[] = [];//[兼容性]

	/**
	 * @override
	 * 包围盒。
	 */
	get bounds(): Bounds {
		if (this._boundsChange || this._cacheAvatar) {//有this._cacheAvatar模式会导致裁剪后动画不更新。动画不更新包围不更新。包围盒不更新就永远裁掉了
			this._calculateBoundingBox();
			this._boundsChange = false;
		}
		return this._bounds;
	}

	/**
	 * @internal
	 */
	_setRootBone(name: string): void {//[兼容性API]
		this._rootBone = name;
		this._setRootNode();//[兼容性API]
	}

	/**
	 * @internal
	 */
	protected _setRootNode(): void {//[兼容性API]
		var rootNode: AnimationNode;
		if (this._cacheAnimator && this._rootBone && this._cacheAvatar)
			rootNode = this._cacheAnimator._avatarNodeMap[this._rootBone];
		else
			rootNode = null;

		if (this._cacheRootAnimationNode != rootNode) {
			this._onWorldMatNeedChange(Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE);
			this._owner.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
			if (this._cacheRootAnimationNode)
				this._cacheRootAnimationNode.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
			(rootNode) && (rootNode.transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));
			this._cacheRootAnimationNode = rootNode;
		}
	}

	/**
	 * @internal
	 */
	private _getCacheAnimationNodes(): void {//[兼容性API]
		var meshBoneNames: string[] = this._cacheMesh._boneNames;
		var innerBindPoseCount: number = this._cacheMesh._inverseBindPoses.length;

			this._cacheAnimationNode.length = innerBindPoseCount;
			var nodeMap: any = this._cacheAnimator._avatarNodeMap;
			for (var i: number = 0; i < innerBindPoseCount; i++) {
				var node: AnimationNode = nodeMap[meshBoneNames[i]];
				this._cacheAnimationNode[i] = node;
			}
	}



	/**
	 * @internal
	 */
	_setCacheAvatar(value: Avatar): void {//[兼容性API]
		if (this._cacheAvatar !== value) {
			if (this._cacheMesh) {
				this._cacheAvatar = value;
				if (value) {
					this._shaderValues.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE);
					this._getCacheAnimationNodes();
				}
			} else {
				this._cacheAvatar = value;
			}
			this._setRootNode();
		}
	}
}

