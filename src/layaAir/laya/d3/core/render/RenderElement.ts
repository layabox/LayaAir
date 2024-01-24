import { BaseRender } from "./BaseRender"
import { GeometryElement } from "../GeometryElement"
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader"
import { Laya3DRender } from "../../RenderObjs/Laya3DRender"
import { IRenderElement3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { Material } from "../../../resource/Material";
import { Transform3D } from "../Transform3D";

/**
 * <code>RenderElement</code> 类用于实现渲染元素。
 */
export class RenderElement {
    /**
     * 可提交底层的渲染节点
     */
    _renderElementOBJ: IRenderElement3D;
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
    /**@internal */
    _transform: Transform3D;

    /** @internal */
    set transform(value: Transform3D) {
        this._transform = value;
        this._renderElementOBJ.transform = value;
    }

    /**@internal */
    get transform(): Transform3D {
        return this._renderElementOBJ.transform;
    }

    /**
     * set RenderElement Material/Shaderdata
     */
    set material(value: Material) {
        if (value) {
            this._material = value;
            this._renderElementOBJ.materialShaderData = value.shaderData;
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
        this._renderElementOBJ.subShader = value;
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
        this._renderElementOBJ.renderShaderData = value._baseRenderNode.shaderData;
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
        this._renderElementOBJ = Laya3DRender.Render3DPassFactory.createRenderElement3D();
    }

    /**
     * 设置位置
     */
    setTransform(transform: Transform3D): void {
        this.transform = transform;
        this._renderElementOBJ.transform = transform;
    }

    /**
     * 设置渲染几何信息
     */
    setGeometry(geometry: GeometryElement): void {
        this._geometry = geometry;
        this._renderElementOBJ.geometry = geometry._geometryElementOBj;
    }

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

