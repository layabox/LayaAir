import { BaseRender2DType, BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { Material } from "../../resource/Material";
import { Mesh2D } from "../../resource/Mesh2D";
import { Texture } from "../../resource/Texture";
import { Texture2D } from "../../resource/Texture2D";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineAdapter } from "../SpineAdapter";
import { ESpineRenderType } from "../SpineSkeleton";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineRender } from "../interface/ISpineRender";

import { SpineShaderInit } from "../material/SpineShaderInit";
import { SpineMeshUtils } from "../mesh/SpineMeshUtils";
import { FrameRenderData, SkinAniRenderData } from "./AnimationRender";
import { AnimationRenderProxy } from "./AnimationRenderProxy";
import { MultiRenderData } from "./MultiRenderData";
import { SketonDynamicInfo, SketonOptimise, SkinAttach, TSpineBakeData } from "./SketonOptimise";
import { VBCreator } from "./VBCreator";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";
import { IVBChange } from "./interface/IVBChange";
import { IVBIBUpdate } from "./interface/IVBIBUpdate";

export class SpineOptimizeRender implements ISpineOptimizeRender {
    animatorMap: Map<string, AnimationRenderProxy>;
    currentAnimation: AnimationRenderProxy;
    bones: spine.Bone[];
    slots: spine.Slot[];

    skinRenderArray: SkinRender[];

    currentRender: SkinRender;

    _skinIndex: number = 0;

    _curAnimationName: string;

    // /**
    //  * Material
    //  */
    // material: IOptimizeMaterial;
    
    _dynamicMap:Map<number,Mesh2D>;

    private _isRender: boolean;

    spineColor: Color;

    _skeleton: spine.Skeleton;

    _state: spine.AnimationState;

    renderProxy: IRender;
    renderProxyMap: Map<ERenderProxyType, IRender>;

    _nodeOwner: Spine2DRenderNode;

    boneMat: Float32Array;

    isBake: boolean;

    bakeData: TSpineBakeData;

    private _renderProxytype: ERenderProxyType;

    dynamicInfo:SketonDynamicInfo;

    constructor(spineOptimize: SketonOptimise) {
        this.renderProxyMap = new Map();
        // this.geoMap = new Map();
        this._dynamicMap = new Map;
        this.animatorMap = new Map();
        this.skinRenderArray = [];
        this.boneMat = new Float32Array(spineOptimize.maxBoneNumber * 8);
        
        spineOptimize.skinAttachArray.forEach((value) => {
            this.skinRenderArray.push(new SkinRender(this, value));
        })

        let animators = spineOptimize.animators;
        for (let i = 0, n = animators.length; i < n; i++) {
            let animator = animators[i];
            this.animatorMap.set(animator.name, new AnimationRenderProxy(animator));
        }
        this.currentRender = this.skinRenderArray[this._skinIndex];//default
        this.dynamicInfo = spineOptimize.dynamicInfo;
    }

    destroy(): void {
        this._dynamicMap.forEach(mesh=>mesh.destroy());
        this._dynamicMap.clear();
        //throw new Error("Method not implemented.");
    }

    initBake(obj: TSpineBakeData): void {
        this.bakeData = obj;
        if (obj) {
            let render = this.renderProxyMap.get(ERenderProxyType.RenderBake) as RenderBake || new RenderBake(this.bones, this.slots, this._nodeOwner);
            render.simpleAnimatorTexture = obj.texture2d;
            render._bonesNums = obj.bonesNums;
            render.aniOffsetMap = obj.aniOffsetMap;
            this.renderProxyMap.set(ERenderProxyType.RenderBake, render);
        }
        this.isBake = !!obj;
        if (this._curAnimationName) {
            this._clear();
            this.play(this._curAnimationName);
        }
        //throw new Error("Method not implemented.");
    }
    
    changeSkeleton(skeleton:spine.Skeleton){
        this._skeleton=skeleton;
        this.bones = skeleton.bones;
        this.slots = skeleton.slots;
        (this.renderProxyMap.get(ERenderProxyType.RenderNormal) as RenderNormal)._skeleton=skeleton;
    }

    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: Spine2DRenderNode, state: spine.AnimationState): void {
        this._skeleton = skeleton;
        this.bones = skeleton.bones;
        this.slots = skeleton.slots;
        this._nodeOwner = renderNode;
        let scolor = skeleton.color;
        this.spineColor = new Color(scolor.r * scolor.a, scolor.g * scolor.a, scolor.b * scolor.a, scolor.a);
        renderNode._spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, this.spineColor);
        this.skinRenderArray.forEach((value) => {
            value.init(skeleton, templet, renderNode);
        });
        this._state = state;

        this.animatorMap.forEach((value, key) => {
            value.state = state;
        });
        let renderOptimize = new RenderOptimize(this.bones, this.slots, this._nodeOwner);
        let renderNormal = new RenderNormal(skeleton, this._nodeOwner);
        this.renderProxyMap.set(ERenderProxyType.RenderNormal, renderNormal);
        this.renderProxyMap.set(ERenderProxyType.RenderOptimize, renderOptimize);
    }

    get renderProxytype(): ERenderProxyType {
        return this._renderProxytype;
    }

    set renderProxytype(value: ERenderProxyType) {
        if (this.isBake && value == ERenderProxyType.RenderOptimize) {
            if (this.bakeData.aniOffsetMap[this._curAnimationName] != undefined) {
                value = ERenderProxyType.RenderBake;
            }
        }
        this.renderProxy = this.renderProxyMap.get(value);
        if (value == ERenderProxyType.RenderNormal) {
            this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
            this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
        }
        this._renderProxytype = value;
    }

    beginCache() {
        //@ts-ignore
        this._state.apply = this._state.applyCache;
        //@ts-ignore
        this._state.getCurrentPlayTime = this._state.getCurrentPlayTimeByCache;
        //@ts-ignore
        this._skeleton.updateWorldTransform = this._skeleton.updateWorldTransformCache;
    }

    endCache() {
        //@ts-ignore
        this._state.apply = this._state.oldApply;
        //@ts-ignore
        this._state.getCurrentPlayTime = this._state.getCurrentPlayTimeOld;
        //@ts-ignore
        this._skeleton.updateWorldTransform = this._skeleton.oldUpdateWorldTransform;
    }

    setSkinIndex(index: number) {
        this._skinIndex = index;
        this.currentRender = this.skinRenderArray[index];
        switch (this.currentRender.skinAttachType) {
            case ESpineRenderType.boneGPU:
                this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_FAST);
                this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                break;
            case ESpineRenderType.rigidBody:
                this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_RB);
                this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                break;
            case ESpineRenderType.normal:
                this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                break;
        }
        if (this.currentAnimation) {
            this._clear();
            this.play(this._curAnimationName);
        }
    }

    /**
     * 获取对应类型的 Dynamic mesh
     * @param type 
     * @param [create=true] 
     * @returns 
     */
    getDynamicMesh( vertexDeclaration:VertexDeclaration , create = true){
        let id = vertexDeclaration.id;
        let mesh = this._dynamicMap.get(id);
        if (!mesh && create) {
            mesh = SpineMeshUtils.createMeshDynamic(vertexDeclaration, 
                this.dynamicInfo.maxVertexCount , this.dynamicInfo.maxIndexCount , 
                this.dynamicInfo.indexFormat , this.dynamicInfo.indexByteCount );
            this._dynamicMap.set(id , mesh);
        }
        return mesh;
    }

    private _clear() {
        this._nodeOwner.clear();
        this._isRender = false;
    }

    play(animationName: string) {
        this._curAnimationName = animationName;
        let currentRender = this.currentRender;
        let oldRenderProxy = this.renderProxy;

        let old = this.currentAnimation;
        let oldSkinData = old ? old.currentSKin : null;
        let currentAnimation = this.currentAnimation = this.animatorMap.get(animationName);
        currentAnimation.skinIndex = this._skinIndex;
        let currentSKin = currentAnimation.currentSKin;
        if (old) {
            old.reset();
        }

        if (currentSKin.isNormalRender) {
            this.renderProxytype = ERenderProxyType.RenderNormal;
        }
        else {
            switch (this.currentRender.skinAttachType) {
                case ESpineRenderType.boneGPU:
                    this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_FAST);
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                    break;
                case ESpineRenderType.rigidBody:
                    this._nodeOwner._spriteShaderData.addDefine(SpineShaderInit.SPINE_RB);
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                    break;
                case ESpineRenderType.normal:
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
                    this._nodeOwner._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
                    break;
            }

            if (old && oldSkinData.isNormalRender) {
                this._clear();
            }

            if (oldSkinData != currentSKin) {
                currentRender.renderUpdate(currentSKin , -1);
            }
            // old.animator.mutiRenderAble
            // let mutiRenderAble = currentSKin.mutiRenderAble;
            if (this._isRender) {
                //
                // if (mutiRenderAble != oldSkinData.mutiRenderAble) {
                    // this._clear();
                // }
            }
            else {
                // else (!this._isRender) {
                this.renderProxytype = ERenderProxyType.RenderOptimize;
                // if (mutiRenderAble) {
                //     //this._nodeOwner.drawGeos(currentRender.geo, currentRender.elements);
                    // this.renderProxytype = ERenderProxyType.RenderOptimize;
                // }
                // else {
                //     // currentRender.material&&this._nodeOwner.drawGeo(currentRender.geo, currentRender.material);
                //     this.renderProxytype = ERenderProxyType.RenderOptimize;
                // }
                this._isRender = true;
            }
        }

        if (oldRenderProxy) {
            oldRenderProxy.leave();
        }

        this.renderProxy.change(currentRender, currentAnimation);
        if ((currentAnimation.animator.isCache || this.renderProxytype == ERenderProxyType.RenderBake) && !currentSKin.isNormalRender) {
            this.beginCache();
        }
        else {
            this.endCache();
        }
    }

    render(time: number): void {
        this.renderProxy.render(time, this.boneMat);
    }
}

enum ERenderProxyType {
    RenderNormal,
    RenderOptimize,
    RenderBake
}
interface IRender {
    change(skinRender: SkinRender, currentAnimation: AnimationRenderProxy): void;
    leave(): void;
    render(curTime: number, boneMat: Float32Array): void;
}
class RenderOptimize implements IRender {
    bones: spine.Bone[];
    slots: spine.Slot[];

    _renderNode: Spine2DRenderNode;
    skinRender: SkinRender;
    currentAnimation: AnimationRenderProxy;

    constructor(bones: spine.Bone[], slots: spine.Slot[], renderNode: Spine2DRenderNode) {
        this.bones = bones;
        this.slots = slots;
        this._renderNode = renderNode;
    }

    change(currentRender: SkinRender, currentAnimation: AnimationRenderProxy) {
        this.skinRender = currentRender;
        this.currentAnimation = currentAnimation;
    }

    leave(): void {

    }

    render(curTime: number, boneMat: Float32Array) {
        this.currentAnimation.render(this.bones, this.slots, this.skinRender, curTime, boneMat );//TODO bone
        // this.material.boneMat = boneMat;
        this._renderNode._spriteShaderData.setBuffer(SpineShaderInit.BONEMAT, boneMat);
    }
}

class RenderNormal implements IRender {
    _renderNode: Spine2DRenderNode;
    _renerer: ISpineRender;
    _skeleton: spine.Skeleton;

    constructor(skeleton: spine.Skeleton, renderNode: Spine2DRenderNode) {
        this._renderNode = renderNode;
        this._skeleton = skeleton;
    }

    leave(): void {

    }

    change(currentRender: SkinRender, currentAnimation: AnimationRenderProxy) {
        this._renerer = currentRender._renderer;
    }

    render(curTime: number, boneMat: Float32Array) {
        this._renderNode.clear();
        this._renerer.draw(this._skeleton, this._renderNode, -1, -1);
    }

}

class RenderBake implements IRender {
    bones: spine.Bone[];
    slots: spine.Slot[];
    /** @internal */
    _simpleAnimatorParams: Vector4;
    /** @internal */
    private _simpleAnimatorTextureSize: number;
    /** @internal */
    private _simpleAnimatorTexture: Texture2D;
    /** @internal  x simpleAnimation offset,y simpleFrameOffset*/
    private _simpleAnimatorOffset: Vector2;
    /** @internal */
    _bonesNums: number;
    aniOffsetMap: Record<string, number>;
    /**
     * 设置动画帧贴图
     */
    get simpleAnimatorTexture(): Texture2D {
        return this._simpleAnimatorTexture;
    }

    /**
     * @internal
     */
    set simpleAnimatorTexture(value: Texture2D) {
        if (this._simpleAnimatorTexture) {
            this._simpleAnimatorTexture._removeReference();
        }
        this._simpleAnimatorTexture = value;
        this._simpleAnimatorTextureSize = value.width;
        this._renderNode._spriteShaderData.setTexture(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE, value);
        value._addReference();
        this._renderNode._spriteShaderData.setNumber(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE, this._simpleAnimatorTextureSize);
    }

    /**
     * @internal
     * 设置动画帧数参数
     */
    get simpleAnimatorOffset(): Vector2 {
        return this._simpleAnimatorOffset;
    }

    /**
     * @internal
     */
    set simpleAnimatorOffset(value: Vector2) {
        value.cloneTo(this._simpleAnimatorOffset);
    }


    _renderNode: Spine2DRenderNode;
    skinRender: SkinRender;
    currentAnimation: AnimationRenderProxy;
    step = 1 / 60;
    constructor(bones: spine.Bone[], slots: spine.Slot[], renderNode: Spine2DRenderNode) {
        this._simpleAnimatorParams = new Vector4();
        this.bones = bones;
        this.slots = slots;
        this._renderNode = renderNode;
        this._simpleAnimatorOffset = new Vector2();

    }

    leave() {
        this._renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_SIMPLE);
        //this._renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
        this._renderNode._renderType = BaseRender2DType.spine;
    }

    change(currentRender: SkinRender, currentAnimation: AnimationRenderProxy) {
        this.skinRender = currentRender;
        this.currentAnimation = currentAnimation;
        this._renderNode._spriteShaderData.addDefine(SpineShaderInit.SPINE_SIMPLE);
        this._simpleAnimatorOffset.x = this.aniOffsetMap[currentAnimation.name];
        if (currentAnimation.currentSKin.canInstance) {
            this._renderNode._renderType = BaseRender2DType.spineSimple;
            // this._renderNode._spriteShaderData.addDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
        }
    }

    /**
     * @internal
     */
    _computeAnimatorParamsData() {
        this._simpleAnimatorParams.x = this._simpleAnimatorOffset.x;
        this._simpleAnimatorParams.y = Math.round(this._simpleAnimatorOffset.y) * this._bonesNums * 2;
    }

    /**
     * 自定义数据
     * @param value1 自定义数据1
     * @param value2 自定义数据1
     */
    setCustomData(value1: number, value2: number = 0) {
        this._simpleAnimatorParams.z = value1;
        this._simpleAnimatorParams.w = value2;
    }

    render(curTime: number, boneMat: Float32Array) {
        this.currentAnimation.renderWithOutMat(this.slots, this.skinRender, curTime );
        this._simpleAnimatorOffset.y = curTime / this.step;
        this._computeAnimatorParamsData();
        // let boneMat = this.currentAnimation.render(this.bones, this.slots, this.skinRender, curTime);//TODO bone
        // this.material.boneMat = boneMat;
        this._renderNode._spriteShaderData.setVector(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS, this._simpleAnimatorParams);
    }
}


class SkinRender implements IVBIBUpdate {

    owner: SpineOptimizeRender;
    name: string;
    // protected vb: IVertexBuffer;
    // protected ib: IIndexBuffer;
    // elements: [Material, number, number][];
    private hasNormalRender: boolean;
    _renderer: ISpineRender;

    // elementsMap: Map<number, ElementCreator>;

    templet: SpineTemplet;

    skinAttachType: ESpineRenderType;
    material: Material;
    currentMaterials: Material[] = [];

    cacheMaterials: Material[][] = [];

    vChanges:IVBChange[] = [];

    constructor(owner: SpineOptimizeRender, skinAttach: SkinAttach) {
        this.owner = owner;
        this.name = skinAttach.name;
        // this.elements = [];
        this.hasNormalRender = skinAttach.hasNormalRender;
        // this.elementsMap = new Map();
        this.skinAttachType = skinAttach.type;
    }

    getMaterialByName(name: string, blendMode: number): Material {
        return this.templet.getMaterial(this.templet.getTexture(name), blendMode);
    }

    renderUpdate( skindata:SkinAniRenderData, frame:number){
        let frameData = skindata.getFrameData(frame);
        let mulitRenderData = frameData.mulitRenderData
        let mats:Material[] = this.cacheMaterials[mulitRenderData.id];

        let needUpdate = false;
        if (!mats) {
            mats = this.cacheMaterials[mulitRenderData.id] = [];
            let renderData = mulitRenderData.renderData;
            for (let i = 0, n = renderData.length; i < n; i++) {
                let data = renderData[i];
                let mat = this.getMaterialByName(data.textureName, data.blendMode);
                mats.push(mat);
            }
        }

        let renderNode = this.owner._nodeOwner;
        if (this.currentMaterials != mats) {
            renderNode._updateMaterials(mats);
            needUpdate = true;
        }
        this.currentMaterials = mats;

        let mesh : Mesh2D ;
        if (skindata.isDynamic) {
            let mesh = this.owner.getDynamicMesh(skindata.vb.vertexDeclaration);
            
            if (this.vChanges.length || frameData.vChanges || frame < 0) {
                let needUpload = frame <= 0;
                let currentChanges = this.vChanges;
                let frameChanges = frameData.vChanges;
                
                if (frameChanges) {
                    for (let i = 0 , n = frameChanges.length; i < n; i++) 
                        currentChanges.indexOf(frameChanges[i]) == -1 && currentChanges.push(frameChanges[i]);
                }

                for (let i = currentChanges.length - 1; i > -1; i--) {
                    let change = currentChanges[i];
                    if ( change.startFrame <= frame 
                        && change.endFrame >= frame 
                        || frame <= 0) {
                            if(change.updateVB(skindata.vb ,this.owner.slots)){
                                needUpload = true;
                            }else
                                currentChanges.splice(i , 1);
                    }else{
                        currentChanges.splice(i , 1);
                    }
                }

                if (needUpload) {
                    this.uploadVertexBuffer( skindata.vb , mesh);
                }
            }

            
            if (frameData.ib || frame < 0) {
                this.uploadIndexBuffer( frameData.ib , mesh)
            }
            needUpdate = SpineMeshUtils.updateSpineSubMesh(mesh , frameData.mulitRenderData , this.owner.dynamicInfo);
            needUpdate = !renderNode._onMeshChange(mesh , needUpdate);
        }else{
            mesh = skindata.getMesh();
            needUpdate = !renderNode._onMeshChange(mesh);
        }

        if (needUpdate) renderNode._updateRenderElements();
            
    }

    uploadIndexBuffer( indexData:Uint16Array|Uint8Array|Uint32Array , mesh:Mesh2D){
        let indexbuffer = mesh._indexBuffer;
        indexbuffer._setIndexData(indexData , 0);
    }


    uploadVertexBuffer( vbCreator : VBCreator , mesh:Mesh2D){
        let vertexBuffer = mesh.vertexBuffers[0];
        // let float32 = new Float32Array(vbCreator.vb , vbCreator.vbLength);
        let vblen = vbCreator.vbLength * 4;
        vertexBuffer.setDataLength(vblen);
        vertexBuffer.setData(vbCreator.vb.buffer, 0, 0, vblen);
    }

    // updateVB(vertexArray: Float32Array, vbLength: number) {
    //     let vb = this.vb;
    //     let vblen = vbLength * 4;
    //     vb.setDataLength(vblen);
    //     vb.setData(vertexArray.buffer, 0, 0, vblen);
    // }

    // updateIB(indexArray: Uint16Array, ibLength: number, mutiRenderData: MultiRenderData, isMuti: boolean) {
    //     let ib = this.ib;
    //     let iblen = ibLength * 2;
    //     ib._setIndexDataLength(iblen)
    //     ib._setIndexData(new Uint16Array(indexArray.buffer, 0, iblen / 2), 0);
    //     this.geo.clearRenderParams();
    //     this.geo.setDrawElemenParams(iblen / 2, 0);
    //     this.ib.indexCount = iblen / 2;
    //     if (isMuti) {
    //         let elementsCreator = this.elementsMap.get(mutiRenderData.id);
    //         if (!elementsCreator) {
    //             elementsCreator = new ElementCreator(mutiRenderData, this);
    //             this.elementsMap.set(mutiRenderData.id, elementsCreator);
    //         }
    //         elementsCreator.cloneTo(this.elements);
    //         this.currentMaterials = elementsCreator.currentMaterials;
    //         this.owner._nodeOwner.updateElements(this.geo, this.elements);
    //     }
    //     else {
    //         let currentData = mutiRenderData.currentData;
    //         if(!currentData) return;
    //         let material=currentData.material;
    //         if (!material) {
    //             material=currentData.material = this.getMaterialByName(currentData.textureName, currentData.blendMode);
    //         }
    //         if(material!=this.material){
    //             this.owner._nodeOwner.clear();
    //             this.owner._nodeOwner.drawGeo(this.geo, material);
    //         }
    //     }
    // }

    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: Spine2DRenderNode) {
        this.templet = templet;
        if (this.hasNormalRender) {
            this._renderer = SpineAdapter.createNormalRender(templet, false);
        }
        if (templet.mainTexture) {
            this.material = templet.getMaterial(templet.mainTexture, templet.mainBlendMode);
        }
    }

    render(time: number) {

    }
}

// class ElementCreator {
//     elements: [Material, number, number][];
//     currentMaterials: Material[];

//     constructor(mutiRenderData: MultiRenderData, skinData: SkinRender) {
//         let elements: [Material, number, number][] = this.elements = [];
//         let currentMaterials: Material[] = this.currentMaterials = [];
//         let renderData = mutiRenderData.renderData;
//         for (let i = 0, n = renderData.length; i < n; i++) {
//             let data = renderData[i];
//             let mat = skinData.getMaterialByName(data.textureName, data.blendMode);
//             if (currentMaterials.indexOf(mat) == -1) {
//                 this.currentMaterials.push(mat);
//             }
//             elements[i] = [mat, data.length, data.offset * 2];
//         }
//     }

//     cloneTo(source: [Material, number, number][]) {
//         let target = this.elements;
//         for (let i = 0, n = target.length; i < n; i++) {
//             source[i] = target[i];
//         }
//         source.length = target.length;
//     }
// }

type TGeo = {
    geo: IRenderGeometryElement;
    vb: IVertexBuffer;
    ib: IIndexBuffer;
}