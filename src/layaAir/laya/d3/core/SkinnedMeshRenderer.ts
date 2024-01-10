import { Event } from "../../events/Event";
import { Stat } from "../../utils/Stat";
import { Mesh, skinnedMatrixCache } from "../resource/models/Mesh";
import { SubMesh } from "../resource/models/SubMesh";
import { Utils3D } from "../utils/Utils3D";
import { MeshRenderer } from "./MeshRenderer";
import { Sprite3D } from "./Sprite3D";
import { Transform3D } from "./Transform3D";
import { RenderContext3D } from "./render/RenderContext3D";
import { SkinnedMeshSprite3DShaderDeclaration } from "./SkinnedMeshSprite3DShaderDeclaration";
import { Component } from "../../components/Component";
import { SkinRenderElement } from "./render/SkinRenderElement";
import { Material } from "../../resource/Material";
import { BlinnPhongMaterial } from "./material/BlinnPhongMaterial";
import { Scene3D } from "./scene/Scene3D";
import { Bounds } from "../math/Bounds";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector3 } from "../../maths/Vector3";
import { BoundFrustum } from "../math/BoundFrustum";
import { IRenderContext3D } from "../RenderDriverLayer/IRenderContext3D";
/**
 * <code>SkinMeshRenderer</code> 类用于蒙皮渲染器。
 */
export class SkinnedMeshRenderer extends MeshRenderer {

    /**@internal */
    protected _cacheMesh: Mesh;

    _bones: Sprite3D[] = [];

    /**@internal */
    _renderElements: SkinRenderElement[];
    /** @internal */
    _skinnedData: any[];
    /** @internal */
    private _skinnedDataLoopMarks: Uint32Array;
    /**@internal */
    protected _localBounds: Bounds;
    // /**@internal */
    // protected _cacheAnimator: Animator;
    /**@internal */
    protected _cacheRootBone: Sprite3D;

    /**@internal */
    protected _inverseBindPosesBufferForNative: Float32Array = null;

    /**@internal */
    protected _skinnedMatrixCachesBufferForNative: Int32Array = null;
    /**@internal */
    protected _bonesTransformForNative: Transform3D[] = null;
    /**
     * 局部边界。
     */
    get localBounds(): Bounds {
        return this._localBounds;
    }

    set localBounds(value: Bounds) {
        this._localBounds = value;
        this.geometryBounds = this._localBounds;
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
                (this.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);

            if (value)
                value.transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
            else
                (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);

            this._cacheRootBone = value;
            this._onWorldMatNeedChange(Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE);

            let count = this._renderElements.length;
            for (var i: number = 0; i < count; i++) {
                var renderElement: SkinRenderElement = this._renderElements[i];
                renderElement.setTransform(value.transform);
            }
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
    constructor() {
        super();
        this._localBounds = new Bounds(Vector3.ZERO, Vector3.ZERO);
        this._baseRenderNode.shaderData.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE);
    }




    protected _computeSkinnedData(): void {
        if (this._cacheMesh) {
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
        for (let k: number = 0, q: number = boneIndices.length; k < q; k++) {
            let index: number = boneIndices[k];
            if (this._skinnedDataLoopMarks[index] === Stat.loopCount) {
                let c: skinnedMatrixCache = matrixCaches[index];
                let preData: Float32Array = this._skinnedData[c.subMeshIndex][c.batchIndex];
                let srcIndex: number = c.batchBoneIndex * 16;
                let dstIndex: number = k * 16;
                for (let d: number = 0; d < 16; d++)
                    data[dstIndex + d] = preData[srcIndex + d];
            } else {
                let bone = this._bones[index];
                if (bone)
                    Utils3D._mulMatrixArray(bone.transform.worldMatrix.elements, bindPoses[index].elements, 0, data, k * 16);
                this._skinnedDataLoopMarks[index] = Stat.loopCount;
            }
        }
    }

    protected _computeSkinnedDataForNative(): void {
        if (this._cacheMesh) {
            var bindPoses: Matrix4x4[] = this._cacheMesh._inverseBindPoses;
            var pathMarks: skinnedMatrixCache[] = this._cacheMesh._skinnedMatrixCaches;
            if (this._inverseBindPosesBufferForNative == null) {
                this._inverseBindPosesBufferForNative = new Float32Array(bindPoses.length * 16);
                var offset: number = 0;
                for (var i: number = 0, n: number = bindPoses.length; i < n; i++) {
                    this._inverseBindPosesBufferForNative.set(bindPoses[i].elements, offset);
                    offset += 16;
                }
            }
            if (this._skinnedMatrixCachesBufferForNative == null) {
                this._skinnedMatrixCachesBufferForNative = new Int32Array(pathMarks.length * 3);
                var j: number = 0;
                for (var i: number = 0, n: number = pathMarks.length; i < n; i++) {
                    if (!pathMarks[i]) {
                        break;
                    }
                    this._skinnedMatrixCachesBufferForNative[j] = pathMarks[i].subMeshIndex;
                    this._skinnedMatrixCachesBufferForNative[j + 1] = pathMarks[i].batchIndex;
                    this._skinnedMatrixCachesBufferForNative[j + 2] = pathMarks[i].batchBoneIndex;
                    j += 3;
                }
            }
            if (this._bonesTransformForNative == null) {
                this._bonesTransformForNative = [];
                for (var i: number = 0, n: number = this._bones.length; i < n; i++) {
                    let bone = this._bones[i];
                    if (bone) {
                        this._bonesTransformForNative[i] = (bone.transform as any)._nativeObj;
                    }
                    else {
                        this._bonesTransformForNative[i] = null;
                    }
                }
            }

            for (var i: number = 0, n: number = this._cacheMesh.subMeshCount; i < n; i++) {
                var subMeshBoneIndices: Uint16Array[] = ((<SubMesh>this._cacheMesh.getSubMesh(i)))._boneIndicesList;
                var subData: Float32Array[] = this._skinnedData[i];
                for (var j: number = 0, m: number = subMeshBoneIndices.length; j < m; j++) {
                    var boneIndices: Uint16Array = subMeshBoneIndices[j];
                    (window as any).conch.computeSubSkinnedDataForNative(this._inverseBindPosesBufferForNative, boneIndices, subData[j], this._skinnedMatrixCachesBufferForNative, this._bonesTransformForNative, this._skinnedDataLoopMarks, this._skinnedData);
                }
            }
        }
    }

    /**
    * @inheritDoc
    * @internal
    * @override
    */
    _needRender(boundFrustum: BoundFrustum, context: RenderContext3D): boolean {
        if (!Stat.enableSkin)
            return false;
        return super._needRender(boundFrustum, context);
    }

    /**
     *@inheritDoc
     *@override
     *@internal
     */
    _createRenderElement(): SkinRenderElement {
        let renderelement = new SkinRenderElement();
        return renderelement;
    }
    /**
     * @internal
     */
    _onSkinMeshChange(mesh: Mesh): void {
        if (mesh && this._mesh != mesh) {
            this._changeVertexDefine(mesh);
            this._changeMorphData(mesh);
            this._mesh = mesh;
            var count: number = mesh.subMeshCount;
            this._renderElements.length = count;
            for (var i: number = 0; i < count; i++) {
                var renderElement: SkinRenderElement = this._renderElements[i];
                if (!renderElement) {
                    var material: Material = this.sharedMaterials[i];
                    renderElement = this._renderElements[i] = this._renderElements[i] ? this._renderElements[i] : this._createRenderElement();
                    if (this._cacheRootBone) {
                        renderElement.setTransform(this._cacheRootBone._transform);
                    } else {
                        renderElement.setTransform((this.owner as Sprite3D)._transform);
                    }
                    renderElement.render = this;
                    renderElement.material = material ? material : BlinnPhongMaterial.defaultMaterial;//确保有材质,由默认材质代替。
                }
                renderElement.setGeometry(mesh.getSubMesh(i));
            }
        } else if (!mesh) {
            this._renderElements.length = 0;
            this._mesh = null;
            this._changeVertexDefine(null);
            this._changeMorphData(null);
        }
        this.boundsChange = true;
        // if (this._octreeNode && this._indexInOctreeMotionList === -1) {
        // 	this._octreeNode.getManagerNode().addMotionObject(this);
        // }
    }
    /**
    *@inheritDoc
    *@override
    *@internal
    */
    _onMeshChange(value: Mesh): void {
        this._onSkinMeshChange(value);
        if (!value)
            return;
        this._cacheMesh = (<Mesh>value);

        var subMeshCount: number = value.subMeshCount;
        this._skinnedData = [];
        this._skinnedDataLoopMarks = new Uint32Array(value._inverseBindPoses.length);
        for (var i: number = 0; i < subMeshCount; i++) {
            var subBoneIndices: Uint16Array[] = ((<SubMesh>value.getSubMesh(i)))._boneIndicesList;
            var subCount: number = subBoneIndices.length;
            var subData: Float32Array[] = this._skinnedData[i] = [];
            for (var j: number = 0; j < subCount; j++)
                subData[j] = new Float32Array(subBoneIndices[j].length * 16);
            this._renderElements[i].setSkinData(subData);
        }
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _calculateBoundingBox(): void {//TODO:是否可直接在boundingSphere属性计算优化
        if (this._cacheRootBone)
            this._localBounds._tranform(this._cacheRootBone.transform.worldMatrix, this._bounds);
        else
            this._localBounds._tranform((this.owner as Sprite3D).transform.worldMatrix, this._bounds);
    }

    _setBelongScene(scene: Scene3D): void {
        super._setBelongScene(scene);
        Stat.skinRenderNode++;
    }

    /**
     * @internal
     */
    _setUnBelongScene() {
        super._setUnBelongScene();
        Stat.skinRenderNode--;
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _renderUpdate(context: IRenderContext3D): void {
        // this._applyReflection();
        // if (this.bones.length > 0) {
        //     this._computeSkinnedData();
        //     this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
        //     this._worldParams.x = 1;
        //     this._shaderValues.setVector(Sprite3D.WORLDINVERTFRONT, this._worldParams);
        // } else {
        //     this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
        //     this._worldParams.x = transform.getFrontFaceValue();
        //     this._shaderValues.setVector(Sprite3D.WORLDINVERTFRONT, this._worldParams);
        // }

        // this._mesh.morphTargetData && this._applyMorphdata();
    }

    // /**
    //  * @inheritDoc
    //  * @override
    //  * @internal
    //  */
    // _renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void {
    // 	var projectionView: Matrix4x4 = context.projectionViewMatrix;
    // 	this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
    // }

    /**
     * @override
     * @param dest 
     */
    _cloneTo(dest: Component): void {
        let render = (dest as SkinnedMeshRenderer);

        render._inverseBindPosesBufferForNative = null;
        render._skinnedMatrixCachesBufferForNative = null;
        render._bonesTransformForNative = null;

        //get common parent
        let getCommomParent = (rootNode: Sprite3D, rootCheckNode: Sprite3D): Sprite3D => {
            let nodeArray: Sprite3D[] = [];
            let node = rootNode;
            while (!!node) {
                if (node instanceof Sprite3D)
                    nodeArray.push(node);
                node = node.parent as Sprite3D;
            }
            let checkNode: Sprite3D = rootCheckNode;
            while (!!checkNode && nodeArray.indexOf(checkNode) == -1) {
                checkNode = checkNode.parent as Sprite3D;
            }
            return checkNode;
        }
        let cloneHierachFun = (rootNode: Sprite3D, rootCheckNode: Sprite3D, destNode: Sprite3D): Sprite3D => {
            let rootparent: Sprite3D = getCommomParent(rootNode, rootCheckNode);
            if (!rootparent)
                return null;
            let path: number[] = [];
            Utils3D._getHierarchyPath(rootparent, rootNode, path);
            let pathcheck: number[] = [];
            Utils3D._getHierarchyPath(rootparent, rootCheckNode, pathcheck);
            let destParent = Utils3D._getParentNodeByHierarchyPath(destNode, path);
            if (!destParent)
                return null;
            return Utils3D._getNodeByHierarchyPath(destParent, pathcheck) as Sprite3D;
        }
        //rootBone Clone
        var rootBone: Sprite3D = this.rootBone;
        if (rootBone) {
            let node = cloneHierachFun(this.owner as Sprite3D, this.rootBone as Sprite3D, render.owner as Sprite3D);
            if (node)
                render.rootBone = node;
            else
                render.rootBone = rootBone;
        }
        //BonesClone
        var bones: Sprite3D[] = this.bones;
        var destBone: Sprite3D[] = render.bones;
        let n = destBone.length = bones.length;
        for (var i = 0; i < n; i++) {
            let ceckNode = bones[i];
            destBone[i] = cloneHierachFun(this.owner as Sprite3D, ceckNode, render.owner as Sprite3D);
        }
        //bounds
        var lbb: Bounds = this.localBounds;
        (lbb) && (lbb.cloneTo(render.localBounds));
        (render.localBounds) && (render.localBounds = render.localBounds);
        super._cloneTo(dest);
    }

    protected _onDestroy() {
        if (this._cacheRootBone)
            (!this._cacheRootBone._destroyed) && (this._cacheRootBone.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));
        else
            (this.owner && !this.owner._destroyed) && ((this.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));
        super._onDestroy();
    }
}

