import { Event } from "../../events/Event";
import { Stat } from "../../utils/Stat";
import { Mesh } from "../resource/models/Mesh";
import { SubMesh } from "../resource/models/SubMesh";
import { Utils3D } from "../utils/Utils3D";
import { MeshRenderer } from "./MeshRenderer";
import { Sprite3D } from "./Sprite3D";
import { RenderContext3D } from "./render/RenderContext3D";
import { SkinnedMeshSprite3DShaderDeclaration } from "./SkinnedMeshSprite3DShaderDeclaration";
import { SkinRenderElement } from "./render/SkinRenderElement";
import { Material } from "../../resource/Material";
import { BlinnPhongMaterial } from "./material/BlinnPhongMaterial";
import { Scene3D } from "./scene/Scene3D";
import { Bounds } from "../math/Bounds";
import { Vector3 } from "../../maths/Vector3";
import { BoundFrustum } from "../math/BoundFrustum";
import { Laya3DRender } from "../RenderObjs/Laya3DRender";
import { Vector4 } from "../../maths/Vector4";
import { Transform3D } from "./Transform3D";
import { BaseRenderType, IBaseRenderNode, ISkinRenderNode } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { RenderElement } from "./render/RenderElement";
/**
 * @en The `SkinnedMeshRenderer` class is used for skinned mesh rendering.
 * @zh `SkinnedMeshRenderer` 类用于蒙皮网格渲染。
 */
export class SkinnedMeshRenderer extends MeshRenderer {

    declare owner: Sprite3D;

    /**@internal */
    protected _cacheMesh: Mesh;

    /**@internal */
    protected __bones: Sprite3D[] = [];

    /**@internal 不可删  IDE数据在这里*/
    public get _bones(): Sprite3D[] {
        return this.__bones;
    }
    /**@internal */
    public set _bones(value: Sprite3D[]) {
        this.__bones = value;
        this._isISkinRenderNode() && this._ownerSkinRenderNode.setBones(value);
    }

    /**@internal */
    _renderElements: RenderElement[];
    /** @internal */
    _skinnedData: any[];
    /** @internal */
    private _skinnedDataLoopMarks: Uint32Array;
    /**@internal */
    protected _localBounds: Bounds;
    /**@internal */
    protected _cacheRootBone: Sprite3D;

    /**@internal */
    protected _worldParams = new Vector4();

    /**@internal */
    _baseRenderNode: IBaseRenderNode;
    //解决编译bug TODO
    private _ownerSkinRenderNode: ISkinRenderNode;

    /**
     * @en Local bounds.
     * @zh 局部边界。
     */
    get localBounds(): Bounds {
        return this._localBounds;
    }

    set localBounds(value: Bounds) {
        this._localBounds = value;
        this.geometryBounds = this._localBounds;
    }

    /**
     * @en Root node.
     * @zh 根节点。
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

            if (value) {
                value.transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
                this._baseRenderNode.transform = value.transform;
            }
            else {
                (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange);
                this._baseRenderNode.transform = this.owner.transform;
            }

            this._cacheRootBone = value;


            this._onWorldMatNeedChange(Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE);

            let count = this._renderElements.length;
            for (var i: number = 0; i < count; i++) {
                var renderElement = this._renderElements[i] as SkinRenderElement;
                renderElement.setTransform(value.transform);
            }
            this._isISkinRenderNode() && this._ownerSkinRenderNode.setRootBoneTransfom(this._cacheRootBone);
        }
        this._baseRenderNode.transform = this.rootBone ? this.rootBone.transform : this.owner.transform;
    }

    /**
     * @en The bones used for skinning.
     * @zh 用于蒙皮的骨骼。
     */
    get bones(): Sprite3D[] {
        return this._bones;
    }

    set bones(value: Sprite3D[]) {
        this._bones = value;
    }

    /**
     * @ignore
     * @en Creates an instance of SkinnedMeshRenderer.
     * @zh 创建一个 SkinnedMeshRenderer 的实例。
     */
    constructor() {
        super();
        this.localBounds = new Bounds(Vector3.ZERO, Vector3.ZERO);
        this._baseRenderNode.shaderData.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE);
        this._baseRenderNode.renderNodeType = BaseRenderType.SkinnedMeshRender;
    }

    /**
     * override it
     * @returns 
     */
    protected _createBaseRenderNode(): IBaseRenderNode {
        this._ownerSkinRenderNode = Laya3DRender.Render3DModuleDataFactory.createSkinRenderNode();
        return this._ownerSkinRenderNode;
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
    _createRenderElement(): RenderElement {
        let renderelement = new SkinRenderElement();
        return renderelement;
    }

    protected _isISkinRenderNode(): any {
        return this._ownerSkinRenderNode.setCacheMesh;
    }

    /**
     * @internal
     */
    _onSkinMeshChange(mesh: Mesh): void {
        if (mesh && this._mesh != mesh) {
            this._changeVertexDefine(mesh);
            this._changeMorphData(mesh);
            this._mesh = mesh;
            this._isISkinRenderNode() && this._ownerSkinRenderNode.setCacheMesh(mesh);
            var count: number = mesh.subMeshCount;
            this._renderElements.length = count;
            let materials = this.sharedMaterials;
            materials.length = count;
            for (var i: number = 0; i < count; i++) {
                let renderElement: RenderElement = this._renderElements[i];
                if (!renderElement) {
                    renderElement = this._renderElements[i] = <SkinRenderElement>this._createRenderElement();
                    if (this._cacheRootBone) {
                        renderElement.setTransform(this._cacheRootBone.transform);
                    } else {
                        renderElement.setTransform((this.owner as Sprite3D)._transform);
                    }
                    renderElement.render = this;
                }
                materials[i] = materials[i] || BlinnPhongMaterial.defaultMaterial;
                renderElement.setGeometry(mesh.getSubMesh(i));
            }
            this.sharedMaterials = materials;
            this.boundsChange = true;
        } else if (!mesh) {
            this._renderElements.length = 0;
            this._mesh = null;
            this._changeVertexDefine(null);
            this._changeMorphData(null);
            this.boundsChange = false;
        }
        this._meshChange = true;
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

        for (var i: number = 0; i < subMeshCount; i++) {
            var subBoneIndices: Uint16Array[] = ((<SubMesh>value.getSubMesh(i)))._boneIndicesList;
            var subCount: number = subBoneIndices.length;
            var subData: Float32Array[] = this._skinnedData[i] = [];
            for (var j: number = 0; j < subCount; j++)
                subData[j] = new Float32Array(subBoneIndices[j].length * 16);
            (this._renderElements[i] as SkinRenderElement).setSkinData(subData);
        }
        this._isISkinRenderNode() && this._ownerSkinRenderNode.setSkinnedData(this._skinnedData);
        this._setRenderElements();
    }

    /**
     * @internal
     * @param scene 场景类
     */
    _setBelongScene(scene: Scene3D): void {
        super._setBelongScene(scene);
        this._isISkinRenderNode() && this._ownerSkinRenderNode.setOwnerTransform(this.owner);

        Stat.skinRenderNode++;
        Stat.meshRenderNode--;
    }

    /**
     * @internal
     */
    _setUnBelongScene() {
        super._setUnBelongScene();
        Stat.skinRenderNode--;
    }

    /**
     * @perfTag PerformanceDefine.T_SkinBoneUpdate
     * @en Updates the render state of the skinned mesh renderer.
     * @param context The 3D render context.
     * @zh 更新蒙皮网格渲染器的渲染状态。
     * @param context 3D渲染上下文。
     */
    renderUpdate(context: RenderContext3D): void {
        super.renderUpdate(context);
        this._isISkinRenderNode() && this._ownerSkinRenderNode.computeSkinnedData();
    }

    /**
     * @override
     * @param dest 
     */
    _cloneTo(dest: SkinnedMeshRenderer): void {
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
            let node = cloneHierachFun(this.owner as Sprite3D, this.rootBone as Sprite3D, dest.owner as Sprite3D);
            if (node)
                dest.rootBone = node;
            else
                dest.rootBone = rootBone;
        }
        //BonesClone
        var bones: Sprite3D[] = this.bones;
        var destBone: Sprite3D[] = dest.bones;
        let n = destBone.length = bones.length;
        for (var i = 0; i < n; i++) {
            let ceckNode = bones[i];
            destBone[i] = cloneHierachFun(this.owner as Sprite3D, ceckNode, dest.owner as Sprite3D);
        }
        dest.bones = dest.bones;
        //bounds
        var lbb: Bounds = this.localBounds;
        (lbb) && (lbb.cloneTo(dest.localBounds));
        (dest.localBounds) && (dest.localBounds = dest.localBounds);
        super._cloneTo(dest);
    }

    /**
     * @internal
     * @protected
     */
    protected _onDestroy() {
        if (this._cacheRootBone)
            (!this._cacheRootBone._destroyed) && (this._cacheRootBone.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));
        else
            (this.owner && !this.owner._destroyed) && ((this.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));
        super._onDestroy();
    }
}

