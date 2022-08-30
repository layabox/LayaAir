import { Event } from "../../events/Event";
import { Stat } from "../../utils/Stat";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector3 } from "../math/Vector3";
import { Mesh, skinnedMatrixCache } from "../resource/models/Mesh";
import { SubMesh } from "../resource/models/SubMesh";
import { Utils3D } from "../utils/Utils3D";
import { MeshRenderer } from "./MeshRenderer";
import { Sprite3D } from "./Sprite3D";
import { Transform3D } from "./Transform3D";
import { RenderContext3D } from "./render/RenderContext3D";
import { RenderElement } from "./render/RenderElement";
import { SkinnedMeshSprite3DShaderDeclaration } from "./SkinnedMeshSprite3DShaderDeclaration";
import { Component } from "../../components/Component";
import { LayaGL } from "../../layagl/LayaGL";
import { SkinRenderElement } from "./render/SkinRenderElement";
import { Material } from "./material/Material";
import { BlinnPhongMaterial } from "./material/BlinnPhongMaterial";
import { Scene3D } from "./scene/Scene3D";
import { Bounds } from "../math/Bounds";
import { RenderBounds } from "./RenderBounds";
/**
 * <code>SkinMeshRenderer</code> 类用于蒙皮渲染器。
 */
export class SkinnedMeshRenderer extends MeshRenderer {
    /**@internal */
    private static _tempMatrix4x4: Matrix4x4 = new Matrix4x4();

    /**@internal */
    protected _cacheMesh: Mesh;

    _bones: Sprite3D[] = [];

    /**@internal */
    _renderElements: SkinRenderElement[];
    /** @internal */
    _skinnedData: any[];
    /** @internal */
    private _skinnedDataLoopMarks: number[] = [];
    /**@internal */
    protected _localBounds: RenderBounds;
    // /**@internal */
    // protected _cacheAnimator: Animator;
    /**@internal */
    protected _cacheRootBone: Sprite3D;

    /**
     * 局部边界。
     */
    get localBounds(): Bounds {
        return this._localBounds;
    }

    set localBounds(value: Bounds) {
        this._localBounds.set(value);
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
        this._localBounds = LayaGL.renderOBJCreate.createBounds(Vector3.ZERO, Vector3.ZERO);
        this._shaderValues.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE);
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
                Utils3D._mulMatrixArray(this._bones[index].transform.worldMatrix.elements, bindPoses[index].elements, 0, data, k * 16);
                this._skinnedDataLoopMarks[index] = Stat.loopCount;
            }
        }
    }

    /**
     * @internal
     * @override
     */
    protected _onWorldMatNeedChange(flag: number): void {
        this.boundsChange = true;
        // if (this._octreeNode) {
        // 	flag &= Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE;//过滤有用TRANSFORM标记
        // 	if (flag) {
        // 		if (this._indexInOctreeMotionList === -1)//_octreeNode表示在八叉树队列中
        // 			this._octreeNode.getManagerNode().addMotionObject(this);
        // 	}
        // }
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
            this._mesh = mesh;
            var count: number = mesh.subMeshCount;
            this._renderElements.length = count;
            for (var i: number = 0; i < count; i++) {
                var renderElement: SkinRenderElement = this._renderElements[i];
                if (!renderElement) {
                    var material: Material = this.sharedMaterials[i];
                    renderElement = this._renderElements[i] = this._renderElements[i] ? this._renderElements[i] : this._createRenderElement();
                    renderElement.setTransform((this.owner as Sprite3D)._transform);
                    renderElement.render = this;
                    renderElement.material = material ? material : BlinnPhongMaterial.defaultMaterial;//确保有材质,由默认材质代替。
                }
                renderElement.setGeometry(mesh.getSubMesh(i));
            }
        } else if (!mesh) {
            this._renderElements.length = 0;
            this._mesh = null;
            this._changeVertexDefine(null);
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
        this._skinnedDataLoopMarks.length = value._inverseBindPoses.length;
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
    protected _calculateBoundingBox(): void {//TODO:是否可直接在boundingSphere属性计算优化
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
    _renderUpdate(context: RenderContext3D, transform: Transform3D): void {
        if (this.bones.length > 0) {
            this._computeSkinnedData();
            this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
        } else {
            this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
        }
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

