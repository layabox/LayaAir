import { VBCreator } from "../buffer/VBCreator";
import { BaseOptimizeRender } from "./BaseOptimizeRender";
import { MultiRenderData } from "../buffer/MultiRenderData";
import { SkinAttach } from "./SkeletonOptimise";
import { Material } from "../../../../resource/Material";
import { Mesh2D } from "../../../../resource/Mesh2D";
import { SpineMeshUtils } from "../utils/SpineMeshUtils";
import { SkinAniRenderData, FrameRenderData, AnimationRender } from "./AnimationRender";
import { SpineConst } from "../../../SpineConst";
import { VertexDeclaration } from "../../../../RenderEngine/VertexDeclaration";
import { IVBChange } from "../../IWebSpine";

/**
 * @en SpineRenderUpdater used for updating animation render data and skin rendering.
 * @zh SpineRenderUpdater 类用于更新动画渲染数据和皮肤渲染。
 */
export class SpineRenderUpdater {
    /**
     * @en The owner of this SpineRenderUpdater.
     * @zh 此 SpineRenderUpdater 的所有者。
     */
    owner: BaseOptimizeRender;

    /**
     * @en The name of the animation.
     * @zh 动画的名称。
     */
    name: string;


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

    /** @internal */
    cacheFrameIndex: number = 0;
    
    /**
     * @en The current key frame index.
     * @zh 当前关键帧索引。
     */
    currentFrameIndex: number = -1;

    /**
     * @en The current skin animation render data.
     * @zh 当前皮肤动画渲染数据。
     */
    currentData: SkinAniRenderData = null;

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

    getSubMeshes() {
        return this._mesh ? this._mesh._subMeshes : [];
    }

    needUpdate = true;

    /**
     * @en Create a new instance of SpineRenderUpdater.
     * @param owner The BaseOptimizeRender that owns this SpineRenderUpdater.
     * @zh 创建 SpineRenderUpdater 的新实例。
     * @param owner 拥有此 SpineRenderUpdater 的 BaseOptimizeRender。
     */
    constructor(owner: BaseOptimizeRender) {
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
        this.currentData = this._animator.skinDataArray[this._skinAttach.index];
        this.updateBones = this._animator.isCache ? this.updateBoneMatrixCache : this.updateBoneMatrix;
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
        this.currentFrameIndex = -1;
    }

    clear() {
        this.cacheMaterials.length = 0;
        this.currentFrameIndex = -1;
        this.currentData = null;
        this.state = null;
        this._skinAttach = null;
        this._animator = null;
        this.vChanges.length = 0;
        this._updateMaterials(null);
        this._mesh = null;
    }

    /**
     * 渲染更新
     * @param slots 插槽
     * @param skindata 动画渲染数据
     * @param frame 当前帧
     * @param lastFrame 上一帧
     */
    renderUpdate(slots: spine.Slot[], skindata: SkinAniRenderData, frame: number, lastFrame: number) {
        let needUpdate = false;
        if (skindata.isDynamic) {
            needUpdate = this.updateDynamicRender(slots, skindata, frame, lastFrame);
        } else {
            needUpdate = this.handleRender(skindata, frame, skindata.getMesh());
        }

        this.needUpdate = this.needUpdate || needUpdate;
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

        let needUpdate = SpineMeshUtils._updateSpineSubMesh(mesh, frameData);
        needUpdate = this.handleRender(skindata, frame, mesh) || needUpdate;
        return needUpdate;
    }

    private handleRender(skindata: SkinAniRenderData, frame: number,  mesh: Mesh2D): boolean {
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

        if (this._mesh !== mesh) {
            this._mesh = mesh;
            needUpdate = true;
        }
        return needUpdate;
    }

    private createMaterials(mulitRenderData: MultiRenderData): Material[] {
        let mats = mulitRenderData.renderData.map(data =>
            this.owner._getMaterialByName(data.textureName, data.blendMode)
        );
        //和上一次比对
        if (this.currentMaterials) {
            for (let i = 0; i < mats.length; i++) {
                if (this.currentMaterials[i] !== mats[i]) {
                    this.cacheMaterials[mulitRenderData.id] = mats;
                    return mats;
                }
            }
            this.cacheMaterials[mulitRenderData.id] = this.currentMaterials;
            return this.currentMaterials;
        } else {
            this.cacheMaterials[mulitRenderData.id] = mats;
            return mats;
        }
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
     * @en Renders the animation without matrix transformation.
     * @param slots The slots to render.
     * @param curTime The current animation time.
     * @zh 不进行矩阵变换的动画渲染。
     * @param slots 要渲染的插槽。
     * @param curTime 当前动画时间。
     */
    renderWithOutMat(slots: spine.Slot[],  curTime: number) {
        let beforeFrame = this.currentFrameIndex;
        let nowFrame = this.animator.getFrameIndex(curTime, beforeFrame);
        
        this.renderUpdate(slots , this.currentData, nowFrame, beforeFrame);
        
        this.currentFrameIndex = nowFrame;
    }

    /**
     * @en Renders the animation with matrix transformation.
     * @param bones The bones to render.
     * @param slots The slots to render.
     * @param curTime The current animation time.
     * @param boneMat The bone matrix.
     * @param ofx 偏移x。
     * @param ofy 偏移y。
     * @zh 进行矩阵变换的动画渲染。
     * @param bones 要渲染的骨骼。
     * @param slots 要渲染的插槽。
     * @param curTime 当前动画时间。
     * @param boneMat 骨骼矩阵。
     * @param ofx 偏移x。
     * @param ofy 偏移y。
     */
    renderWithMat(bones: spine.Bone[], slots: spine.Slot[], curTime: number, boneMat: Float32Array, ofx: number, ofy: number) {
        this.renderWithOutMat(slots, curTime);
        this.updateBones(curTime, bones, boneMat, ofx, ofy);
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
        let creator = this.currentData.vb;
        let boneArray = creator.localBoneIdIndexPairs;
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
        let creator = this.currentData.vb;
        let boneArray = creator.localBoneIdIndexPairs;
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
        if (this.currentMaterials) {
            for (let i = 0, len = this.currentMaterials.length; i < len; i++) {
                this.currentMaterials[i]._removeReference();
            }
        }

        if (elements) {
            for (let i = 0, len = elements.length; i < len; i++) {
                elements[i]._addReference();
            }
        }
        this.currentMaterials = elements;
    }

    _clearCacheMaterials() {
        this.cacheMaterials.length = 0;
    }

    /**
     * @en Destroy the SpineRenderUpdater instance.
     * @zh 销毁 SpineRenderUpdater 实例。
     */
    destroy() {
        this.clear();
        this.owner = null;
    }
}

