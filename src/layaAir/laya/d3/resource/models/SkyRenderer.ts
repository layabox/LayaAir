import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IBaseRenderNode } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { Material } from "../../../resource/Material";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { GeometryElement } from "../../core/GeometryElement";
import { Transform3D } from "../../core/Transform3D";
import { BaseRender } from "../../core/render/BaseRender";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { SkyRenderElement } from "../../core/render/SkyRenderElement";
import { SkyBox } from "./SkyBox";
import { SkyDome } from "./SkyDome";

/**
 * @en SkyRenderer class used to implement sky rendering.
 * @zh SkyRenderer 类用于实现天空渲染器。
 */
export class SkyRenderer {
    /**@internal */
    static SUNLIGHTDIRECTION: number;
    /**@internal */
    static SUNLIGHTDIRCOLOR: number;
    /**@internal */
    static SKYVIEWMATRIX: number;
    /**@internal */
    static SKYPROJECTIONMATRIX: number;
    /**@internal */
    static SKYPROJECTIONVIEWMATRIX: number;

    /**
     * @internal
     */
    static __init__() {
        SkyRenderer.SUNLIGHTDIRECTION = Shader3D.propertyNameToID("u_SunLight_direction");
        SkyRenderer.SUNLIGHTDIRCOLOR = Shader3D.propertyNameToID("u_SunLight_color");
        SkyRenderer.SKYVIEWMATRIX = Shader3D.propertyNameToID("u_SkyViewMat");
        SkyRenderer.SKYPROJECTIONMATRIX = Shader3D.propertyNameToID("u_SkyProjectionMat");
        SkyRenderer.SKYPROJECTIONVIEWMATRIX = Shader3D.propertyNameToID("u_SkyProjectionViewMat");
        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("SkyRenderer");
        commandUniform.addShaderUniform(SkyRenderer.SUNLIGHTDIRECTION, "u_SunLight_direction", ShaderDataType.Vector3);
        commandUniform.addShaderUniform(SkyRenderer.SUNLIGHTDIRCOLOR, "u_SunLight_color", ShaderDataType.Color);
        commandUniform.addShaderUniform(SkyRenderer.SKYVIEWMATRIX, "u_SkyViewMat", ShaderDataType.Matrix4x4);
        commandUniform.addShaderUniform(SkyRenderer.SKYPROJECTIONMATRIX, "u_SkyProjectionMat", ShaderDataType.Matrix4x4);
        commandUniform.addShaderUniform(SkyRenderer.SKYPROJECTIONVIEWMATRIX, "u_SkyProjectionViewMat", ShaderDataType.Matrix4x4);
    }

    /** @internal */
    private _material: Material;
    /** @internal */
    private _mesh: GeometryElement;

    /** @internal */
    _baseRenderNode: IBaseRenderNode;

    private _renderData: BaseRender;

    private _renderGeometry: boolean;

    private _cacheRenderElement: SkyRenderElement;

    /**
     * @en The material.
     * @zh 材质。
     */
    get material(): Material {
        return this._material;
    }

    set material(value: Material) {
        if (this._material !== value) {
            (this._material) && (this._material._removeReference());
            this._material = value;
            this._cacheRenderElement && (this._cacheRenderElement.material = value);
            if (value) {
                value._addReference();
                //this._renderElement.renderSubShader = this._material._shader.getSubShaderAt(0);
                //this._baseRenderNode.setOneMaterial(0, value);
            }
        }
    }

    /**
     * @en The mesh of the renderer.
     * @zh 渲染器网格。
     */
    get mesh(): GeometryElement {
        return this._mesh;
    }

    set mesh(value: GeometryElement) {
        if (this._mesh !== value) {
            this._mesh = value;
            this._cacheRenderElement && this._cacheRenderElement.setGeometry(this.mesh);
        }
    }

    /** @internal */
    private get meshType(): "box" | "dome" | "" {
        return this.mesh == SkyBox.instance ? "box" : (this.mesh == SkyDome.instance ? "dome" : "");
    }

    /** @internal */
    private set meshType(value: "box" | "dome" | "") {
        if (value == "dome")
            this.mesh = SkyDome.instance;
        else
            this.mesh = SkyBox.instance;
    }

    /**
     * @ignore
     * @en Creates an instance of SkyRenderer.
     * @zh 创建一个 SkyRenderer 的实例。
     */
    constructor() {
        this.mesh = SkyDome.instance;
        this._renderData = new BaseRender();
        this._baseRenderNode = Laya3DRender.Render3DModuleDataFactory.createBaseRenderNode();
        this._baseRenderNode.transform = new Transform3D(null);
    }

    /**
     * @internal
     * 是否可用。
     */
    _isAvailable(): boolean {
        return this._material && this._mesh ? true : false;
    }

    /** @internal */
    renderUpdate(context: RenderContext3D) {
        let geomettry = this.mesh;
        this._renderGeometry = geomettry._prepareRender(context);
        geomettry._updateRenderParams(context);
    }

    /**
     * @en Sets the render element for the sky.
     * @param skyRenderElement The render element to set.
     * @zh 设置天空的渲染元素。
     * @param skyRenderElement 要设置的渲染元素。
     */
    setRenderElement(skyRenderElement: SkyRenderElement) {
        if (this._cacheRenderElement != skyRenderElement) {
            skyRenderElement.setGeometry(this.mesh);
            skyRenderElement.material = this._material;
            skyRenderElement.render = this._renderData;
            skyRenderElement._renderElementOBJ.isRender = this._renderGeometry;
            this._baseRenderNode.setRenderelements([skyRenderElement._renderElementOBJ]);
            this._baseRenderNode.setCommonUniformMap([
                "Sprite3D",
                "SkyRenderer"
            ]);
            this._cacheRenderElement = skyRenderElement;
        }
    }

    /**
     * @internal
     */
    destroy(): void {

        if (this._material) {
            this._material._removeReference();
            this._material = null;
        }
        this._renderData.destroy();
        this._cacheRenderElement = null;
        // this._renderElement.destroy();
        // skyRenderElement 由 camera 设置, camera 负责 destroy
        this._baseRenderNode.setRenderelements([]);
        this._baseRenderNode.destroy();
    }
}


