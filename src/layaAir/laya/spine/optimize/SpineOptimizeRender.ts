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
import { SketonOptimise } from "./SketonOptimise";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";
import { IVBIBUpdate } from "./interface/IVBIBUpdate";

export class SpineOptimizeRender implements IVBIBUpdate, ISpineOptimizeRender {
    animatorMap: Map<string, AnimationRenderProxy>;
    currentAnimation: AnimationRenderProxy;
    bones: spine.Bone[];
    boneMat: Float32Array = new Float32Array(200 * 4);
    graphics: Graphics;
    slots: spine.Slot[];

    /**
     * Geometry
     */
    geo: IRenderGeometryElement;

    elements: [Material, number, number][]
    /**
     * Material
     */
    material: IOptimizeMaterial;

    private materialMap: Map<string, IOptimizeMaterial>;

    materialConstructor: new () => IOptimizeMaterial;

    protected vb: IVertexBuffer;
    protected ib: IIndexBuffer;

    private _isRender: boolean;

    spineColor: Vector4;

    currentMaterials: Set<IOptimizeMaterial>;

    _renerer: SpineSkeletonRenderer;
    _skeleton: spine.Skeleton;

    private hasNormalRender: boolean;

    private initRender(type: ERenderType) {
        let geo = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let mesh = LayaGL.renderDeviceFactory.createBufferState();
        geo.bufferState = mesh;
        let vb = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        vb.vertexDeclaration = type == ERenderType.boneGPU ? SpineFastMaterialShaderInit.vertexDeclaration : SpineRBMaterialShaderInit.vertexDeclaration;
        let ib = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        mesh.applyState([vb], ib)
        geo.indexFormat = IndexFormat.UInt16;
        this.geo = geo;
        this.vb = vb;
        this.ib = ib;
    }
    //abstract get vertexDeclarition(): VertexDeclaration;

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
        let renderData = mutiRenderData.renderData;
        let elements = this.elements;
        elements.length = renderData.length;
        this.currentMaterials.clear();
        for (let i = 0, n = renderData.length; i < n; i++) {
            let data = renderData[i];
            let mat = this.getMaterial(data.texture, data.blendMode);
            this.currentMaterials.add(mat);
            elements[i] = [mat, data.length, data.offset * 2];
        }
        //mutiRenderData.renderData.
    }

    constructor(spineOptimize: SketonOptimise) {
        this.hasNormalRender = spineOptimize.hasNormalRender;
        this.materialMap = new Map();
        this.animatorMap = new Map();
        this.elements = [];
        this.currentMaterials = new Set();
        if (spineOptimize.type == ERenderType.boneGPU) {
            this.materialConstructor = SpineFastMaterial;
        }
        else if (spineOptimize.type == ERenderType.rigidBody) {
            this.materialConstructor = SpineRBMaterial;
        }
        else {
            console.error("unkown error");
        }
        let animators = spineOptimize.animators;
        for (let i = 0, n = animators.length; i < n; i++) {
            let animator = animators[i];
            this.animatorMap.set(animator.name, new AnimationRenderProxy(animator));
        }
        this.initRender(spineOptimize.type);
    }

    getMaterial(texture: Texture, blendMode: number): IOptimizeMaterial {
        let key = texture.id + "_" + blendMode;
        let mat = this.materialMap.get(key);
        if (!mat) {
            mat = new this.materialConstructor();
            mat.texture = texture;
            mat.blendMode = blendMode;
            mat.color = this.spineColor;
            //mat.setVector2("u_size",new Vector2(Laya.stage.width,Laya.stage.height));
            this.materialMap.set(key, mat);
        }
        return mat;
    }

    init(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics) {
        this._skeleton = skeleton;
        this.bones = skeleton.bones;
        this.slots = skeleton.slots;
        this.graphics = graphics;
        let scolor = skeleton.color;
        this.spineColor = new Vector4(scolor.r, scolor.g, scolor.b, scolor.a);
        this.material = this.getMaterial(templet.mainTexture, 0);
        if (this.hasNormalRender) {
            this._renerer = new SpineSkeletonRenderer(templet, false);
        }
    }

    private _clear() {
        this.graphics.clear();
        this._isRender = false;
    }

    play(animationName: string) {

        let old = this.currentAnimation;
        let currentAnimation = this.currentAnimation = this.animatorMap.get(animationName);
        if (old) {
            old.reset();
        }

        if (currentAnimation.isNormalRender) {
            this.render = this.renderNormal;
            return;
        }
        if (old && old.isNormalRender) {
            this._clear();
        }
        if (old != currentAnimation) {
            this.updateVB(currentAnimation.vb.vb, currentAnimation.vb.vbLength);
        }
        //currentAnimation.
        // old.animator.mutiRenderAble
        let mutiRenderAble = currentAnimation.mutiRenderAble;
        if (this._isRender) {
            if (mutiRenderAble != old.mutiRenderAble) {
                this._clear();
            }
        }
        if (!this._isRender) {
            if (mutiRenderAble) {
                this.graphics.drawGeos(this.geo, this.elements);
                this.render = this.renderMulti;
            }
            else {
                this.graphics.drawGeo(this.geo, this.material);
                this.render = this.renderOne;
            }
            //this.graphics.drawGeos(this.geo, this.elements);
            this._isRender = true;
        }
    }

    renderMulti(curTime: number) {
        this.currentAnimation.render(this.bones, this.slots, this.boneMat, this, curTime);
        this.currentMaterials.forEach((value) => {
            value.boneMat = this.boneMat;
        });
    }

    render: (time: number) => void;

    renderOne(curTime: number) {
        this.currentAnimation.render(this.bones, this.slots, this.boneMat, this, curTime);
        this.material.boneMat = this.boneMat;
    }

    renderNormal(curTime: number) {
        this.graphics.clear();
        this._renerer.draw(this._skeleton, this.graphics, -1, -1);
    }
}
