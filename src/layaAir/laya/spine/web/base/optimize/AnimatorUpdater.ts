import { VBCreator } from "../buffer/VBCreator";
import { SpineOptimizeRender } from "./SpineOptimizeRender";
import { MultiRenderData } from "../buffer/MultiRenderData";
import { SkeletonOptimise, SkinAttach } from "./SkeletonOptimise";
import { Material } from "../../../../resource/Material";
import { Mesh2D } from "../../../../resource/Mesh2D";
import { Spine2DRenderNode } from "../../../Spine2DRenderNode";
import { SpineTemplet } from "../../../SpineTemplet";
import { SpineMeshUtils } from "../utils/SpineMeshUtils";
import { IVBChange } from "../../interface/IWebSpine";
import { SkinAniRenderData, FrameRenderData, AnimationRender } from "./AnimationRender";
import { SpineConst } from "../../../SpineConst";
import { VertexDeclaration } from "../../../../RenderEngine/VertexDeclaration";
import { Texture2D } from "../../../../resource/Texture2D";
import { IRenderElement2D } from "../../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";

/**
 * @en Animatorupdater used for updating animation render data and skin rendering.
 * @zh Animatorupdater 类用于更新动画渲染数据和皮肤渲染。
 */
export class AnimatorUpdater {
    /**
     * @en The owner of this Animatorupdater.
     * @zh 此 Animatorupdater 的所有者。
     */
    owner: SpineOptimizeRender;

    /**
     * @en The name of the animation.
     * @zh 动画的名称。
     */
    name: string;

    /**
     * @en The Spine template.
     * @zh Spine 模板。
     */
    templet: SpineTemplet;

    /**
     * @en Array of current materials.
     * @zh 当前材质数组。
     */
    currentMaterials: Material[] = [];

    /**
     * @en An array to cache materials for different render states.
     * Each inner array represents a set of materials for a specific render state.
     * @zh 用于缓存不同渲染状态的材质数组。
     * 每个内部数组代表一个特定渲染状态的材质集合。
     */
    cacheMaterials: Material[][] = [];

    vChanges: IVBChange[] = [];

    private _animator: AnimationRender = null;

    /**
     * @en The current animation time.
     * @zh 当前动画时间。
     */
    currentTime: number = -1;

    /**
     * @en The current frame index.
     * @zh 当前帧索引。
     */
    currentFrameIndex: number = -1;

    /**
     * @en The current skin animation render data.
     * @zh 当前皮肤动画渲染数据。
     */
    currentSKin: SkinAniRenderData = null;

    /**
     * @en The animation state.
     * @zh 动画状态。
     */
    state: spine.AnimationState = null;

    /** @internal */
    _skinAttach: SkinAttach = null;


    updateBones: (delta: number, bones: spine.Bone[], boneMat: Float32Array, ofx: number, ofy: number) => void;
    
    /** @internal */
    _mesh: Mesh2D;

    /** @internal */
    private _renderElements: IRenderElement2D[] = [];

    /**
     * @en Create a new instance of Animatorupdater.
     * @param owner The SpineOptimizeRender that owns this Animatorupdater.
     * @zh 创建 Animatorupdater 的新实例。
     * @param owner 拥有此 Animatorupdater 的 SpineOptimizeRender。
     */
    constructor(owner: SpineOptimizeRender) {
        this.owner = owner;
        this.reset();
    }

    set skinAttach(value: SkinAttach) {
        if (this._skinAttach === value) return;
        this._skinAttach = value;
        this._updateData();
    }

    get skinAttach(): SkinAttach {
        return this._skinAttach;
    }

     /**
     * @en The animation renderer.
     * @zh 动画渲染器。
     */
    set animator(value: AnimationRender) {
        if (this._animator === value) return;
        this._animator = value;
        this._updateData();
    }

    get animator(): AnimationRender {
        return this._animator;
    }

    private _updateData() {
        if (!this._animator || !this._skinAttach) return;
        this.currentSKin = this._animator.skinDataArray[this._skinAttach.index];
        this.updateBones = this._animator.isCache ? (this._animator.eventsFrames.length == 0 ? this.updateBoneMatrixCache : this.updateBoneMatCacheEvent) : this.updateBoneMatrix;
    }

    /**
     * @en Gets the animation name if this is an animation-specific updater.
     * @returns The name of the animator, or the skin name if no animator.
     * @zh 获取动画名称（如果这是特定动画的更新器）。
     * @returns 动画器的名称，如果没有动画器则返回皮肤名称。
     */
    get animationName(): string {
        return this.animator ? this.animator.name : this.name;
    }

    /**
     * @en Resets the animation state.
     * @zh 重置动画状态。
     */
    reset() {
        this.currentTime = -1;
        this.currentFrameIndex = -1;
    }

    clear() {
        this.currentTime = -1;
        this.currentFrameIndex = -1;
        this.currentSKin = null;
        this.state = null;
        this._skinAttach = null;
        this._animator = null;
    }

    /**
     * @en Get material by name and blend mode.
     * @param name The name of the texture.
     * @param blendMode The blend mode.
     * @zh 通过名称和混合模式获取材质。
     * @param name 纹理的名称。
     * @param blendMode 混合模式。
     */
    getMaterialByName(name: string, blendMode: number): Material {
        return this.templet.getMaterial(this.templet.getTexture(name), blendMode);
    }

    /**
     * @en Get material by texture and blend mode.
     * @param texture The texture.
     * @param blendMode The blend mode.
     * @zh 通过纹理和混合模式获取材质。
     * @param texture 纹理。
     * @param blendMode 混合模式。
     */
    getMaterial(texture: Texture2D, blendMode:number): Material{
        return this.templet.getMaterial(texture, blendMode);
    }

    /**
     * 渲染更新
     * @param slots 插槽
     * @param skindata 动画渲染数据
     * @param frame 当前帧
     * @param lastFrame 上一帧
     */
    renderUpdate(slots: spine.Slot[], skindata: SkinAniRenderData, frame: number, lastFrame: number) {
        const renderNode = this.owner._owner;
        let needUpdate = false;
        if (skindata.isDynamic) {
            needUpdate = this.updateDynamicRender(slots, skindata, frame, lastFrame);
        } else {
            needUpdate = this.handleRender(skindata, frame, skindata.getMesh());
        }

        if (needUpdate) {
            this._updateRenderElements();
        }
    }

    private updateDynamicRender(slots: spine.Slot[], skindata: SkinAniRenderData, frame: number, lastFrame: number): boolean {
        let mesh = this.owner.getDynamicMesh(skindata.vb.vertexDeclaration);

        let currentChanges = this.vChanges;

        let frameData = skindata.getFrameData(frame);

        let isFirst = lastFrame < 0;
        let needUpload = false;

        if (isFirst) {
            this._resetVertexBuffers(slots, skindata);
            currentChanges.length = 0;
        }

        //统计vchange
        for (let f = lastFrame + 1; f <= frame; f++) {
            let frameData = skindata.getFrameData(f);
            let frameChanges = frameData.vChanges;
            if (frameChanges) {
                for (const change of frameChanges) {
                    if (!currentChanges.includes(change)) {
                        currentChanges.push(change);
                    }
                }
            }
        }

        //是否有vchange 修改顶点 或者 -1帧初始化状态
        for (let i = currentChanges.length - 1; i >= 0; i--) {
            let change = currentChanges[i];
            if (change.apply(frame, skindata.vb, slots)) {
                needUpload = true;
            } else {
                currentChanges.splice(i, 1);
            }
        }

        if (needUpload || isFirst) {
            this.uploadVertexBuffer(skindata.vb, mesh);
        }

        if (frameData.ib || isFirst) {
            this.uploadIndexBuffer(frameData, mesh);
        }

        let needUpdateMesh = SpineMeshUtils._updateSpineSubMesh(mesh, frameData);
        return this.handleRender(skindata, frame, mesh, needUpdateMesh);
    }

    private handleRender(skindata: SkinAniRenderData, frame: number,  mesh: Mesh2D, forceUpdateMesh = false): boolean {
        let frameData = skindata.getFrameData(frame);
        let needUpdate = false;
        let mulitRenderData = frameData.mulitRenderData;
        if (mulitRenderData) {
            let mats = this.cacheMaterials[mulitRenderData.id] || this.createMaterials(mulitRenderData);
            if (this.currentMaterials !== mats) {
                this._updateMaterials(mats);
                needUpdate = true;
            }
        }

        let meshChanged = this._onMeshChange(mesh, forceUpdateMesh);
        return !meshChanged || needUpdate;
    }

    private createMaterials(mulitRenderData: MultiRenderData): Material[] {
        let mats = mulitRenderData.renderData.map(data =>
            this.getMaterialByName(data.textureName, data.blendMode)
        );
        this.cacheMaterials[mulitRenderData.id] = mats;
        return mats;
    }

    public getDynamicMesh(vertexDeclaration: VertexDeclaration , index = 0): Mesh2D {
        return this.owner.getDynamicMesh(vertexDeclaration , true , index);
    }

    /**
     * @en Submit IndexData.
     * @param frameData Frame rendering data.
     * @param mesh Mesh2D object.
     * @zh 提交索引数据。
     * @param frameData 帧渲染数据。
     * @param mesh 网格对象。
     */
    uploadIndexBuffer(frameData: FrameRenderData, mesh: Mesh2D) {
        let indexData = frameData.ib;
        let indexbuffer = mesh._indexBuffer;
        indexbuffer.indexType = frameData.type;
        indexbuffer.indexCount = indexData.length;
        indexbuffer._setIndexDataLength(indexData.byteLength);
        indexbuffer._setIndexData(indexData, 0);
    }

    /**
     * @en Submit vertex data.
     * @param vbCreator Vertex buffer creator object.
     * @param mesh Mesh2D object.
     * @zh 提交顶点数据。
     * @param vbCreator 构建顶点缓冲区对象。
     * @param mesh 网格对象。
     */
    uploadVertexBuffer(vbCreator: VBCreator, mesh: Mesh2D) {
        let vertexBuffer = mesh.vertexBuffers[0];
        let vblen = vbCreator.vbLength * 4;
        vertexBuffer.setDataLength(vbCreator.maxVertexCount * vbCreator.vertexSize * 4);
        vertexBuffer.setData(vbCreator.vb.buffer as ArrayBuffer, 0, 0, vblen);
    }

    /**
     * @en Initialize renderer
     * @param skeleton spine.skeleton instance
     * @param templet Engine spine animation template
     * @zh 初始化渲染器
     * @param skeleton spine.skeleton 实例
     * @param templet 引擎spine动画模板
     */
    init(skeleton: spine.Skeleton, templet: SpineTemplet) {
        this.templet = templet;
    }

    /**
     * @en Renders the animation without matrix transformation.
     * @param slots The slots to render.
     * @param updater The VB/IB updater (usually this).
     * @param curTime The current animation time.
     * @zh 不进行矩阵变换的动画渲染。
     * @param slots 要渲染的插槽。
     * @param updater VB/IB 更新器（通常是 this）。
     * @param curTime 当前动画时间。
     */
    renderWithOutMat(slots: spine.Slot[], updater: AnimatorUpdater, curTime: number) {
        let beforeFrame = this.currentFrameIndex;
        let nowFrame = this.animator.getFrameIndex(curTime, beforeFrame);
        
        updater.renderUpdate(slots , this.currentSKin, nowFrame, beforeFrame);
        
        this.currentTime = curTime;
        this.currentFrameIndex = nowFrame;
    }

    /**
     * @en Renders the animation with matrix transformation.
     * @param bones The bones to render.
     * @param slots The slots to render.
     * @param updater The VB/IB updater (usually this).
     * @param curTime The current animation time.
     * @param boneMat The bone matrix.
     * @param ofx 偏移x。
     * @param ofy 偏移y。
     * @zh 进行矩阵变换的动画渲染。
     * @param bones 要渲染的骨骼。
     * @param slots 要渲染的插槽。
     * @param updater VB/IB 更新器（通常是 this）。
     * @param curTime 当前动画时间。
     * @param boneMat 骨骼矩阵。
     * @param ofx 偏移x。
     * @param ofy 偏移y。
     */
    renderWithMat(bones: spine.Bone[], slots: spine.Slot[], updater: AnimatorUpdater, curTime: number, boneMat: Float32Array, ofx: number, ofy: number) {
        this.renderWithOutMat(slots, updater, curTime);
        this.updateBoneMatrix(curTime, bones, boneMat, ofx, ofy);
    }

    private _resetVertexBuffers(slots: spine.Slot[], skindata: SkinAniRenderData) {
        let map = skindata.vb.slotVBMap;
        let renderDatas = skindata.renderDatas;
        let resetSlots: Set<number> = new Set();

        renderDatas.forEach(data => {
            if (data && data.vChanges) {
                for (const change of data.vChanges) {
                    resetSlots.add(change.slotId);
                }
            }
        });

        resetSlots.forEach(slotId => {
            let slot = slots[slotId];
            if (slot && slot.attachment) {
                let attach = map.get(slotId)?.get(slot.attachment.name);
                if (attach) {
                    skindata.vb.resetVB(attach.attachment);
                }
            }
        });
    }

    /**
     * @en Updates bone matrices using cached data.
     * @param delta Time delta.
     * @param animation Animation render data.
     * @param bones Spine bones.
     * @param state Spine animation state.
     * @param boneMat Bone matrix array.
     * @zh 使用缓存数据更新骨骼矩阵。
     * @param delta 时间增量。
     * @param animation 动画渲染数据。
     * @param bones 骨骼数组。
     * @param state 骨骼动画状态。
     * @param boneMat 骨骼矩阵数组。
     */
    updateBoneMatrix(delta: number, bones: spine.Bone[], boneMat: Float32Array, ofx: number = 0, ofy: number = 0): void {
        this.writeBoneBuffer(bones, boneMat, ofx, ofy);
    }

    /**
     * @en Updates bone matrices using cached data.
     * @param delta Time delta.
     * @param animation Animation render data.
     * @param bones Spine bones.
     * @param state Spine animation state.
     * @param boneMat Bone matrix array.
     * @zh 使用缓存数据更新骨骼矩阵。
     * @param delta 时间增量。
     * @param animation 动画渲染数据。
     * @param bones 骨骼数组。
     * @param state 骨骼动画状态。
     * @param boneMat 骨骼矩阵数组。
     */
    updateBoneMatrixCache(delta: number, bones: spine.Bone[], boneMat: Float32Array, ofx: number = 0, ofy: number = 0): void {
        this.writeBoneBufferCache(this._animator.boneFrames, delta / SpineConst.SPINE_STEP, boneMat, ofx, ofy);
    }

    /**
     * @en Updates bone matrices using cached data and handles events.
     * @param delta Time delta.
     * @param animation Animation render data.
     * @param bones Spine bones.
     * @param state Spine animation state.
     * @param boneMat Bone matrix array.
     * @zh 使用缓存数据更新骨骼矩阵并处理事件。
     * @param delta 时间增量。
     * @param animation 动画渲染数据。
     * @param bones 骨骼数组。
     * @param state 骨骼动画状态。
     * @param boneMat 骨骼矩阵数组。
     */
    updateBoneMatCacheEvent(delta: number,  bones: spine.Bone[],  boneMat: Float32Array): void {
        let f = delta / SpineConst.SPINE_STEP;

        let animator = this._animator;
        let state = this.state;
        this.writeBoneBufferCache(animator.boneFrames, f, boneMat);

        let currFrame = Math.round(f);
        //@ts-ignore
        let curentTrack: spine.TrackEntry = state.currentTrack;
        //@ts-ignore
        let lastEventFrame = curentTrack.lastEventFrame;
        if (lastEventFrame == currFrame) {
            return;
        }
        if (lastEventFrame > currFrame || lastEventFrame == undefined) {
            lastEventFrame = -1;
        }

        if (currFrame - lastEventFrame <= 1) {
            let events = animator.eventsFrames[currFrame];
            if (events) {
                for (let i = 0, n = events.length; i < n; i++) {
                    //@ts-ignore
                    state.dispatchEvent(null, "event", events[i]);//TODO enty
                }
            }
        }
        else {
            for (let i = lastEventFrame + 1; i <= currFrame; i++) {
                let events = animator.eventsFrames[i];
                if (events) {
                    for (let j = 0, m = events.length; j < m; j++) {
                        //@ts-ignore
                        state.dispatchEvent(null, "event", events[j]);//TODO enty
                    }
                }
            }
        }
        //@ts-ignore
        curentTrack.lastEventFrame = currFrame;
    }

    /**
     * @en Update bone matrices.
     * @param bones Array of bones.
     * @param boneMat Bone matrix array.
     * @param ofx Offset x.
     * @param ofy Offset y.
     * @zh 更新骨骼矩阵。
     * @param bones 骨骼数组。
     * @param boneMat 骨骼矩阵数组。
     * @param ofx 偏移x。
     * @param ofy 偏移y。
     */
    writeBoneBuffer(bones: spine.Bone[], boneMat: Float32Array, ofx: number = 0, ofy: number = 0) {
        let creator = this.currentSKin.vb;
        let boneArray = creator.boneArray;
        for (let i = 0, n = boneArray.length; i < n; i += 2) {
            let offset = boneArray[i] * 8;
            let bone = bones[boneArray[i + 1]];
            boneMat[offset] = bone.a;
            boneMat[offset + 1] = bone.b;
            boneMat[offset + 2] = bone.worldX + ofx;
            boneMat[offset + 3] = 0;
            boneMat[offset + 4] = bone.c;
            boneMat[offset + 5] = bone.d;
            boneMat[offset + 6] = bone.worldY + ofy;
            boneMat[offset + 7] = 0;
        }
    }

    /**
     * @en Update bone cache.
     * @param boneFrames Array of bone frame data.
     * @param frames Frame number.
     * @param boneMat Bone matrix array.
     * @zh 更新骨骼缓存。
     * @param boneFrames 骨骼帧数据数组。
     * @param frames 帧数。
     * @param boneMat 骨骼矩阵数组。
     */
    writeBoneBufferCache(boneFrames: Float32Array[][], frames: number, boneMat: Float32Array, ofx: number = 0, ofy: number = 0) {
        let creator = this.currentSKin.vb;
        let boneArray = creator.boneArray;
        let floor = Math.floor(frames);
        let detal;
        if (floor == boneFrames.length - 1) { detal = 0; }
        else {
            detal = frames - floor;
        }
        let boneFrames1 = boneFrames[floor];
        let boneFrames2 = boneFrames[floor + 1];
        if (detal > 0.0001) {
            for (let i = 0, n = boneArray.length; i < n; i += 2) {
                let offset = boneArray[i] * 8;
                let boneFloatArray = boneFrames1[boneArray[i + 1]];
                let boneFloatArray2 = boneFrames2[boneArray[i + 1]];
                boneMat[offset] = boneFloatArray[0] + (boneFloatArray2[0] - boneFloatArray[0]) * detal;
                boneMat[offset + 1] = boneFloatArray[1] + (boneFloatArray2[1] - boneFloatArray[1]) * detal;
                boneMat[offset + 2] = boneFloatArray[2] + (boneFloatArray2[2] - boneFloatArray[2]) * detal;
                boneMat[offset + 3] = 0
                boneMat[offset + 4] = boneFloatArray[4] + (boneFloatArray2[4] - boneFloatArray[4]) * detal;
                boneMat[offset + 5] = boneFloatArray[5] + (boneFloatArray2[5] - boneFloatArray[5]) * detal;
                boneMat[offset + 6] = boneFloatArray[6] + (boneFloatArray2[6] - boneFloatArray[6]) * detal;
                boneMat[offset + 7] = 0;
            }
        }
        else {
            for (let i = 0, n = boneArray.length; i < n; i += 2) {
                let offset = boneArray[i] * 8;
                let bone = boneFrames1[boneArray[i + 1]];
                boneMat.set(bone, offset);
            }
        }
    }

    /** @internal */
    _updateMaterials(elements: Material[]) {
        for (let i = 0, len = this.currentMaterials.length; i < len; i++) {
            this.currentMaterials[i]._removeReference();
        }

        for (let i = 0, len = elements.length; i < len; i++) {
            elements[i]._addReference();
        }
        this.currentMaterials = elements;
    }

    /** @internal */
    _updateRenderElements() {
        let elementLength = this._renderElements.length;
        for (let i = 0; i < elementLength; i++) {
            let element = this._renderElements[i];
            let material = this._materials[i];
            element.materialShaderData = material.shaderData;
            element.subShader = material._shader.getSubShaderAt(0);
            element.value2DShaderData = this.owner._shaderData;
        }
    }

    /** @internal */
    _onMeshChange(mesh: Mesh2D, force: boolean = false) {
        let hasChange = false;
        if (this._mesh != mesh || force) {
            hasChange = true;
            if (mesh) {
                let subMeshes = mesh._subMeshes;
                let elementLength = this._renderElements.length;
                let flength = Math.max(elementLength, mesh.subMeshCount);
                for (let i = 0; i < flength; i++) {
                    let element = this._renderElements[i];
                    let subMesh = subMeshes[i];
                    if (subMesh) {
                        if (!element) {
                            element = Spine2DRenderNode.createRenderElement2D();
                            this._renderElements[i] = element;
                        }
                        let material = this.currentMaterials[i];
                        element.geometry = subMesh;
                        element.materialShaderData = material.shaderData;
                        element.subShader = material._shader.getSubShaderAt(0);
                        element.value2DShaderData = this.owner._shaderData;
                        element.nodeCommonMap = this._getcommonUniformMap();
                        element.owner = this.owner._struct;
                    } else {
                        Spine2DRenderNode.recoverRenderElement2D(element);
                    }
                }
                this._renderElements.length = mesh.subMeshCount;
                SpineShaderInit.changeVertexDefine(this.owner._shaderData, mesh);
            } else {
                for (let i = 0, len = this._renderElements.length; i < len; i++)
                    Spine2DRenderNode.recoverRenderElement2D(this._renderElements[i]);
                this._renderElements.length = 0;
            }

            if (this.owner._struct) {
                this.owner._struct.renderElements = this._renderElements;
            }

        }
        this._mesh = mesh;
        return hasChange;
    }

    /**
     * @en Destroy the Animatorupdater instance.
     * @zh 销毁 Animatorupdater 实例。
     */
    destroy() {
    }
}

