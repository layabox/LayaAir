import { BaseRender } from "./BaseRender"
import { GeometryElement } from "../GeometryElement"
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader"
import { Laya3DRender } from "../../RenderObjs/Laya3DRender"
import { IRenderElement3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { Material } from "../../../resource/Material";
import { Transform3D } from "../Transform3D";

/**
 * @en RenderElement class is used to implement rendering elements.
 * @zh RenderElement 类用于实现渲染元素。
 */
export class RenderElement {
    /**
     * @en Can submit underlying rendering nodes
     * @zh 可提交底层的渲染节点
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

    /**
     * @internal
     * @en The transform of the render element.
     * @zh 渲染元素的变换。
     */
    get transform(): Transform3D {
        return this._renderElementOBJ.transform;
    }
    set transform(value: Transform3D) {
        this._transform = value;
        this._renderElementOBJ.transform = value;
    }


    /**
     * @en The material of the render element.
     * @zh 渲染元素的材质。
     */
    get material(): Material {
        return this._material;
    }
    set material(value: Material) {
        if (value) {
            this._material = value;
            this._renderElementOBJ.materialShaderData = value.shaderData;
            this._renderElementOBJ.materialRenderQueue = value.renderQueue;
            this._renderElementOBJ.subShader = this._subShader = value.shader.getSubShaderAt(0);
            this._renderElementOBJ.materialId = value.id;
            value.ownerELement = this;
        }
        else {
            this._material = null;
            this._renderElementOBJ.materialShaderData = null;
            this._renderElementOBJ.materialRenderQueue = 0;
            this._renderElementOBJ.subShader = this._subShader = null;
            this._renderElementOBJ.materialId = -1;
        }
    }


    /**
     * @en The SubShader of the render element.
     * @zh 渲染元素的 SubShader。
     */
    get renderSubShader(): SubShader {
        return this._subShader;
    }
    set renderSubShader(value: SubShader) {
        this._subShader = value;
        this._renderElementOBJ.subShader = value;
    }

    /**
     * @en The SubShader index of the render element.
     * @zh 渲染元素的 SubShader 索引。
     */
    get subShaderIndex() {
        return this._subShaderIndex;
    }
    set subShaderIndex(value: number) {
        this._subShaderIndex = value;
    }

    /**
     * @internal
     * @en The BaseRender of the render element.
     * @zh 渲染元素的 BaseRender。
     */
    get render(): BaseRender {
        return this._baseRender;
    }
    set render(value: BaseRender) {
        this._baseRender = value;
        this._renderElementOBJ.renderShaderData = value._baseRenderNode.shaderData;
    }

    /**@ignore */
    constructor() {
        this._createRenderElementOBJ();
    }

    protected _createRenderElementOBJ() {
        this._renderElementOBJ = Laya3DRender.Render3DPassFactory.createRenderElement3D();
    }

    /**
     * @en Set the transform of the render element.
     * @param transform The transform to set.
     * @zh 设置渲染元素的位置变换。
     * @param transform 要设置的变换。
     */
    setTransform(transform: Transform3D): void {
        this.transform = transform;
        this._renderElementOBJ.transform = transform;
    }

    /**
     * @en Set the geometry information of the render element.
     * @param geometry The geometry to set.
     * @zh 设置渲染元素的几何信息。
     * @param geometry 要设置的几何信息。
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

