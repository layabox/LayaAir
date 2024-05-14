import { IIndexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { Graphics } from "../../display/Graphics";
import { LayaGL } from "../../layagl/LayaGL";
import { Vector4 } from "../../maths/Vector4";
import { Material } from "../../resource/Material";
import { Texture } from "../../resource/Texture";
import { ERenderType } from "../SpineSkeleton";
import { SpineSkeletonRenderer } from "../SpineSkeletonRenderer";
import { SpineTemplet } from "../SpineTemplet";
import { IOptimizeMaterial } from "../material/IOptimizeMaterial";
import { SpineFastMaterial } from "../material/SpineFastMaterial";
import { SpineFastMaterialShaderInit } from "../material/SpineFastMaterialShaderInit";
import { SpineRBMaterial } from "../material/SpineRBMaterial";
import { SpineRBMaterialShaderInit } from "../material/SpineRBMaterialShaderInit";
import { AnimationRenderProxy } from "./AnimationRenderProxy";
import { MultiRenderData } from "./MultiRenderData";
import { SketonOptimise, SkinAttach } from "./SketonOptimise";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";
import { IVBIBUpdate } from "./interface/IVBIBUpdate";

export class SpineOptimizeRender implements ISpineOptimizeRender {
    animatorMap: Map<string, AnimationRenderProxy>;
    currentAnimation: AnimationRenderProxy;
    bones: spine.Bone[];
    boneMat: Float32Array = new Float32Array(200 * 4);
    graphics: Graphics;
    slots: spine.Slot[];

    skinRenderArray: SkinRender[];

    currentRender: SkinRender;

    _skinIndex: number = 0;

    _curAnimationName: string;

    /**
     * Material
     */
    material: IOptimizeMaterial;

    materialMap: Map<string, IOptimizeMaterial>;

    geoMap: Map<ERenderType, TGeo>;

    private _isRender: boolean;

    spineColor: Vector4;

    _skeleton: spine.Skeleton;

    renderProxy: IRender;
    renderProxyMap: Map<ERenderProxyType, IRender>;


    constructor(spineOptimize: SketonOptimise) {
        this.renderProxyMap = new Map();
        this.geoMap = new Map();
        this.materialMap = new Map();
        this.animatorMap = new Map();
        this.skinRenderArray = [];

        spineOptimize.skinAttachArray.forEach((value) => {
            this.skinRenderArray.push(new SkinRender(this, value));
        })

        let animators = spineOptimize.animators;
        for (let i = 0, n = animators.length; i < n; i++) {
            let animator = animators[i];
            this.animatorMap.set(animator.name, new AnimationRenderProxy(animator));
        }
        this.currentRender = this.skinRenderArray[this._skinIndex];//default
    }

    initRender(type: ERenderType) {
        let geoResult = this.geoMap.get(type);
        if (!geoResult) {
            let geo = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            let mesh = LayaGL.renderDeviceFactory.createBufferState();
            geo.bufferState = mesh;
            let vb = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
            vb.vertexDeclaration = type == ERenderType.rigidBody ? SpineRBMaterialShaderInit.vertexDeclaration : SpineFastMaterialShaderInit.vertexDeclaration;
            let ib = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
            mesh.applyState([vb], ib)
            geo.indexFormat = IndexFormat.UInt16;
            geoResult = { geo, vb, ib };
            this.geoMap.set(type, geoResult);
        }
        return geoResult;
    }

    init(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics) {
        this._skeleton = skeleton;
        this.bones = skeleton.bones;
        this.slots = skeleton.slots;
        this.graphics = graphics;
        let scolor = skeleton.color;
        this.spineColor = new Vector4(scolor.r * scolor.a, scolor.g * scolor.a, scolor.b * scolor.a, scolor.a);
        this.skinRenderArray.forEach((value) => {
            value.init(skeleton, templet, graphics);
        });

        let renderone = new RenderOne(this.bones, this.slots);
        let rendermulti = new RenderMulti(this.bones, this.slots);
        let rendernormal = new RenderNormal(skeleton, graphics);
        this.renderProxyMap.set(ERenderProxyType.RenderNormal, rendernormal);
        this.renderProxyMap.set(ERenderProxyType.RenderOne, renderone);
        this.renderProxyMap.set(ERenderProxyType.RenderMulti, rendermulti);
    }

    set renderProxytype(value: ERenderProxyType) {
        this.renderProxy = this.renderProxyMap.get(value);
    }

    setSkinIndex(index: number) {
        this._skinIndex = index;
        this.currentRender = this.skinRenderArray[index];
        if (this.currentAnimation) {
            this._clear();
            this.play(this._curAnimationName);
        }
    }

    private _clear() {
        this.graphics.clear();
        this._isRender = false;
    }

    play(animationName: string) {
        this._curAnimationName = animationName;
        let currentRender = this.currentRender;

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
            if (old && oldSkinData.isNormalRender) {
                this._clear();
            }
            if (oldSkinData != currentSKin) {
                currentRender.updateVB(currentSKin.vb.vb, currentSKin.vb.vbLength);
            }
            //currentAnimation.
            // old.animator.mutiRenderAble
            let mutiRenderAble = currentSKin.mutiRenderAble;
            if (this._isRender) {
                if (mutiRenderAble != oldSkinData.mutiRenderAble) {
                    this._clear();
                }
            }
            if (!this._isRender) {
                if (mutiRenderAble) {
                    this.graphics.drawGeos(currentRender.geo, currentRender.elements);
                    this.renderProxytype = ERenderProxyType.RenderMulti;
                }
                else {
                    this.graphics.drawGeo(currentRender.geo, currentRender.material);
                    this.renderProxytype = ERenderProxyType.RenderOne;
                }
                //this.graphics.drawGeos(this.geo, this.elements);
                this._isRender = true;
            }
        }
        this.renderProxy.change(currentRender, currentAnimation);
    }

    render(time: number): void {
        this.renderProxy.render(time);
    }
}
enum ERenderProxyType {
    RenderNormal,
    RenderOne,
    RenderMulti
}
interface IRender {
    change(skinRender: SkinRender, currentAnimation: AnimationRenderProxy): void;
    render(curTime: number): void;
}
class RenderOne implements IRender {
    bones: spine.Bone[];
    slots: spine.Slot[];

    skinRender: SkinRender;
    currentAnimation: AnimationRenderProxy;
    material: IOptimizeMaterial;

    constructor(bones: spine.Bone[], slots: spine.Slot[]) {
        this.bones = bones;
        this.slots = slots;
    }
    change(currentRender: SkinRender, currentAnimation: AnimationRenderProxy) {
        this.skinRender = currentRender;
        this.currentAnimation = currentAnimation;
        this.material = currentRender.material;
    }

    render(curTime: number) {
        let boneMat = this.currentAnimation.render(this.bones, this.slots, this.skinRender, curTime);
        this.material.boneMat = boneMat;
    }
}

class RenderMulti implements IRender {
    bones: spine.Bone[];
    slots: spine.Slot[];

    skinRender: SkinRender;
    currentAnimation: AnimationRenderProxy;

    constructor(bones: spine.Bone[], slots: spine.Slot[]) {
        this.bones = bones;
        this.slots = slots;
    }

    change(skinRender: SkinRender, currentAnimation: AnimationRenderProxy) {
        this.skinRender = skinRender;
        this.currentAnimation = currentAnimation;
    }

    render(curTime: number) {
        let skinRender = this.skinRender;
        let boneMat = this.currentAnimation.render(this.bones, this.slots, skinRender, curTime);
        let currentMaterials = skinRender.currentMaterials;
        for (let i = 0, n = currentMaterials.length; i < n; i++) {
            currentMaterials[i].boneMat = boneMat;
        }
    }
}

class RenderNormal implements IRender {
    graphics: Graphics;
    _renerer: SpineSkeletonRenderer;
    _skeleton: spine.Skeleton;

    constructor(skeleton: spine.Skeleton, graphics: Graphics) {
        this.graphics = graphics;
        this._skeleton = skeleton;
    }

    change(currentRender: SkinRender, currentAnimation: AnimationRenderProxy) {
        this._renerer = currentRender._renerer;
    }

    render(curTime: number) {
        this.graphics.clear();
        this._renerer.draw(this._skeleton, this.graphics, -1, -1);
    }

}


class SkinRender implements IVBIBUpdate {
    static EMPTY: IOptimizeMaterial[] = [];
    owner: SpineOptimizeRender;
    name: string;
    /**
   * Geometry
   */
    geo: IRenderGeometryElement;

    protected vb: IVertexBuffer;
    protected ib: IIndexBuffer;
    materialConstructor: new () => IOptimizeMaterial;
    elements: [Material, number, number][];
    private hasNormalRender: boolean;
    _renerer: SpineSkeletonRenderer;
    /**
    * Material
    */
    material: IOptimizeMaterial;

    elementsMap: Map<number, ElementCreator>;

    currentMaterials: IOptimizeMaterial[];
    constructor(owner: SpineOptimizeRender, skinAttach: SkinAttach) {
        this.owner = owner;
        this.name = skinAttach.name;
        this.elements = [];
        this.hasNormalRender = skinAttach.hasNormalRender;
        this.elementsMap = new Map();
        this.currentMaterials = SkinRender.EMPTY;
        if (skinAttach.type == ERenderType.boneGPU) {
            this.materialConstructor = SpineFastMaterial;
        }
        else if (skinAttach.type == ERenderType.rigidBody) {
            this.materialConstructor = SpineRBMaterial;
        }
        else {
            this.materialConstructor = SpineFastMaterial;
        }
        let geoResult = owner.initRender(skinAttach.type);
        this.geo = geoResult.geo;
        this.vb = geoResult.vb;
        this.ib = geoResult.ib;
    }

    getMaterial(texture: Texture, blendMode: number): IOptimizeMaterial {
        let key = texture.id + "_" + blendMode;
        let mat = this.owner.materialMap.get(key);
        if (!mat) {
            mat = new this.materialConstructor();
            mat.texture = texture;
            mat.blendMode = blendMode;
            mat.color = this.owner.spineColor;
            //mat.setVector2("u_size",new Vector2(Laya.stage.width,Laya.stage.height));
            this.owner.materialMap.set(key, mat);
        }
        return mat;
    }

    /**
     * 添加到渲染队列
     * @param graphics 
     */
    draw(vertexArray: Float32Array, vbLength: number, indexArray: Uint16Array, ibLength: number, mutiRenderData: MultiRenderData) {
        this.updateVB(vertexArray, vbLength);
        this.updateIB(indexArray, ibLength, mutiRenderData);
    }

    updateVB(vertexArray: Float32Array, vbLength: number) {
        let vb = this.vb;
        let vblen = vbLength * 4;
        vb.setDataLength(vblen);
        vb.setData(vertexArray.buffer, 0, 0, vblen);
    }

    updateIB(indexArray: Uint16Array, ibLength: number, mutiRenderData: MultiRenderData) {
        let ib = this.ib;
        let iblen = ibLength * 2;
        ib._setIndexDataLength(iblen)
        ib._setIndexData(new Uint16Array(indexArray.buffer, 0, iblen / 2), 0)
        this.geo.clearRenderParams();
        this.geo.setDrawElemenParams(iblen / 2, 0);
        if (mutiRenderData) {
            let elementsCreator = this.elementsMap.get(mutiRenderData.id);
            if (!elementsCreator) {
                elementsCreator = new ElementCreator(mutiRenderData, this);
                this.elementsMap.set(mutiRenderData.id, elementsCreator);
            }
            elementsCreator.cloneTo(this.elements);
            this.currentMaterials = elementsCreator.currentMaterials;
        }
        //mutiRenderData.renderData.
    }
    init(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics) {
        if (this.hasNormalRender) {
            this._renerer = new SpineSkeletonRenderer(templet, false);
        }
        this.material = this.getMaterial(templet.mainTexture, 0);
    }

    render(time: number) {

    }
}

class ElementCreator {
    elements: [Material, number, number][];
    currentMaterials: IOptimizeMaterial[];

    constructor(mutiRenderData: MultiRenderData, skinData: SkinRender) {
        let elements: [Material, number, number][] = this.elements = [];
        let currentMaterials: IOptimizeMaterial[] = this.currentMaterials = [];
        let renderData = mutiRenderData.renderData;
        for (let i = 0, n = renderData.length; i < n; i++) {
            let data = renderData[i];
            let mat = skinData.getMaterial(data.texture, data.blendMode);
            if (currentMaterials.indexOf(mat) == -1) {
                this.currentMaterials.push(mat);
            }
            elements[i] = [mat, data.length, data.offset * 2];
        }
    }

    cloneTo(source: [Material, number, number][]) {
        let target = this.elements;
        for (let i = 0, n = target.length; i < n; i++) {
            source[i] = target[i];
        }
        source.length = target.length;
    }
}

type TGeo = {
    geo: IRenderGeometryElement;
    vb: IVertexBuffer;
    ib: IIndexBuffer;
}