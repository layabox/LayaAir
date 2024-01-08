import { BaseRender } from "./BaseRender"
import { GeometryElement } from "../GeometryElement"
import { Transform3D } from "../Transform3D"
import { Material } from "../../../resource/Material"
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement"
import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas"
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader"
import { Laya3DRender } from "../../RenderObjs/Laya3DRender"

/**
 * <code>RenderElement</code> 类用于实现渲染元素。
 */
export class RenderElement {


    /** @internal */
    static _compileDefine: DefineDatas = new DefineDatas();

    /**
     * 可提交底层的渲染节点
     */
    _renderElementOBJ: IRenderElement;
    /** @internal */
    _geometry: GeometryElement;
    /** @internal */
    _material: Material;//可能为空
    /** @internal */
    _baseRender: BaseRender;
    /**@internal */
    _subShader: SubShader;
    /**@internal */
    _subShaderIndex: number = 0;
    _transform: Transform3D;

    /** @internal */
    set transform(value: Transform3D) {
        this._transform = value;
        this._renderElementOBJ._transform = value;
    }

    /**@internal */
    get transform(): Transform3D {
        return this._renderElementOBJ._transform;
    }

    /**
     * set RenderElement Material/Shaderdata
     */
    set material(value: Material) {
        // todo debug 临时
        if (value) {
            this._material = value;
            this._renderElementOBJ._materialShaderData = value.shaderData;
        }
    }

    /**@internal */
    get material(): Material {
        return this._material;
    }

    /**
     * 设置 SubShader
     */
    set renderSubShader(value: SubShader) {
        this._subShader = value;
    }

    get renderSubShader(): SubShader {
        return this._subShader;
    }

    set subShaderIndex(value: number) {
        this._subShaderIndex = value;
    }

    get subShaderIndex() {
        return this._subShaderIndex;
    }
    /**@internal */
    set render(value: BaseRender) {
        this._baseRender = value;
        this._renderElementOBJ._renderShaderData = value._baseRenderNode.shaderData;
    }

    get render(): BaseRender {
        return this._baseRender;
    }
    /**
     * 创建一个 <code>RenderElement</code> 实例。
     */
    constructor() {
        this._createRenderElementOBJ();
    }

    protected _createRenderElementOBJ() {
        this._renderElementOBJ = Laya3DRender.renderOBJCreate.createRenderElement();
    }

    /**
     * 设置位置
     */
    setTransform(transform: Transform3D): void {
        this.transform = transform;
    }

    /**
     * 设置渲染几何信息
     */
    setGeometry(geometry: GeometryElement): void {
        this._geometry = geometry;
        this._renderElementOBJ._geometry = geometry._geometryElementOBj;
    }

    // /**
    //  * pre update data
    //  * @param context 
    //  */
    // _renderUpdatePre(context: RenderContext3D) {
    //     var sceneMark: number = ILaya3D.Scene3D._updateMark;
    //     var transform: Transform3D = this.transform;
    //     context.renderElement = this;
    //     //model local
    //     var modelDataRender: boolean = (!!this._baseRender) ? (sceneMark !== this._baseRender._sceneUpdateMark || this.renderType !== this._baseRender._updateRenderType) : false;
    //     if (modelDataRender) {
    //         this._baseRender._renderUpdate(context, transform);
    //         this._baseRender._sceneUpdateMark = sceneMark;
    //     }
    //     //camera
    //     var updateMark: number = Camera._updateMark;
    //     var updateRender: boolean = (!!this._baseRender) ? (updateMark !== this._baseRender._updateMark || this.renderType !== this._baseRender._updateRenderType) : false;
    //     if (updateRender) {//此处处理更新为裁剪和合并后的，可避免浪费
    //         this._baseRender._renderUpdateWithCamera(context, transform);
    //         this._baseRender._updateMark = updateMark;
    //         this._baseRender._updateRenderType = this.renderType;
    //     }

    //     const subUbo = (!!this._baseRender) ? this._baseRender._subUniformBufferData : false;
    //     if (subUbo) {
    //         subUbo._needUpdate && BaseRender._transLargeUbO.updateSubData(subUbo);
    //     }
    //     //context.shader = this._renderElementOBJ._subShader;
    //     this._renderElementOBJ._isRender = this._geometry._prepareRender(context);
    //     this._geometry._updateRenderParams(context);



    //     this.compileShader(context._contextOBJ);
    //     this._renderElementOBJ._invertFront = this.getInvertFront();
    // }

    // /**
    //  * @internal
    //  */
    // _render(context: IRenderContext3D): void {
    //     this._renderElementOBJ._render(context);
    // }

    /**
     * @internal
     */
    destroy(): void {
        this._renderElementOBJ = null;
        this._renderElementOBJ = null;
        this._geometry = null;
        this._baseRender = null;
        this._material = null
        this._baseRender = null;
        this._subShader = null;
    }
}

