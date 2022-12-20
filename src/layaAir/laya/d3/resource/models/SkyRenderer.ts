import { ILaya3D } from "../../../../ILaya3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { CompareFunction } from "../../../RenderEngine/RenderEnum/CompareFunction";
import { CullMode } from "../../../RenderEngine/RenderEnum/CullMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Camera } from "../../core/Camera";
import { GeometryElement } from "../../core/GeometryElement";
import { Material } from "../../core/material/Material";
import { BaseRender } from "../../core/render/BaseRender";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { RenderElement } from "../../core/render/RenderElement";
import { Scene3D } from "../../core/scene/Scene3D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { SkyBox } from "./SkyBox";
import { SkyDome } from "./SkyDome";

/**
 * <code>SkyRenderer</code> 类用于实现天空渲染器。
 */
export class SkyRenderer {
    /** @internal */
    private static _tempMatrix0: Matrix4x4 = new Matrix4x4();
    /** @internal */
    private static _tempMatrix1: Matrix4x4 = new Matrix4x4();

    /** @internal */
    private _material: Material;
    /** @internal */
    private _mesh: GeometryElement;
    /**@internal */
    private _renderElement: RenderElement;

    private _renderData: BaseRender;
    static SUNLIGHTDIRECTION: number;
    static SUNLIGHTDIRCOLOR: number;
    static __init__() {
        SkyRenderer.SUNLIGHTDIRECTION = Shader3D.propertyNameToID("u_SunLight_direction");
        SkyRenderer.SUNLIGHTDIRCOLOR = Shader3D.propertyNameToID("u_SunLight_color");
        const commandUniform = LayaGL.renderOBJCreate.createGlobalUniformMap("Sprite3D");
        commandUniform.addShaderUniform(SkyRenderer.SUNLIGHTDIRECTION, "u_SunLight_direction");
        commandUniform.addShaderUniform(SkyRenderer.SUNLIGHTDIRCOLOR, "u_SunLight_color");
    }

    /**
     * 材质。
     */
    get material(): Material {
        return this._material;
    }

    set material(value: Material) {
        if (this._material !== value) {
            (this._material) && (this._material._removeReference());
            this._material = value;
            this._renderElement.material = value;
            if (value) {
                value._addReference();
                value.cull = CullMode.Off;
                value.depthTest = CompareFunction.LessEqual;
                value.depthWrite = false;
                value.stencilWrite = false;
                this._renderElement.renderSubShader = this._material._shader.getSubShaderAt(0);
            }
            else
                this._renderElement.renderSubShader = null;
        }
    }

    /**
     * 网格。
     */
    get mesh(): GeometryElement {
        return this._mesh;
    }

    set mesh(value: GeometryElement) {

        if (this._mesh !== value) {
            this._mesh = value;
            this._renderElement.setGeometry(this._mesh);
        }
    }

    //@internal
    private get meshType(): "box" | "dome" | "" {
        return this.mesh == SkyBox.instance ? "box" : (this.mesh == SkyDome.instance ? "dome" : "");
    }

    //@internal
    private set meshType(value: "box" | "dome" | "") {
        if (value == "dome")
            this.mesh = SkyDome.instance;
        else
            this.mesh = SkyBox.instance;
    }

    /**
     * 创建一个新的 <code>SkyRenderer</code> 实例。
     */
    constructor() {
        this._renderElement = new RenderElement();
        this.mesh = SkyDome.instance;
        this._renderData = new BaseRender();
        this._renderElement.render = this._renderData;
    }

    /**
     * @internal
     * 是否可用。
     */
    _isAvailable(): boolean {
        return this._material && this._mesh ? true : false;
    }

    /**
     * @internal
     */
    _render(context: RenderContext3D): void {
        if (this._material && this._mesh) {
            var camera= context.camera;
            var scene: Scene3D = context.scene;
            var projectionMatrix: Matrix4x4 = SkyRenderer._tempMatrix1;
            if (camera.orthographic)
                Matrix4x4.createPerspective(camera.fieldOfView, camera.aspectRatio, camera.nearPlane, camera.farPlane, projectionMatrix);
            this._renderData._shaderValues.setColor(SkyRenderer.SUNLIGHTDIRCOLOR, scene._sunColor);
            this._renderData._shaderValues.setVector3(SkyRenderer.SUNLIGHTDIRECTION, scene._sundir);
            //无穷投影矩阵算法,DirectX右手坐标系推导
            //http://terathon.com/gdc07_lengyel.pdf

            //xScale  0     0                          0
            //0     yScale  0                          0
            //0       0    	-zfar /(zfar-znear)        -1.0
            //0       0     -znear*zfar /(zfar-znear)  0

            //xScale  0     0       0        mul   [x,y,z,0] =[xScale*x,yScale*y,-z,-z]
            //0     yScale  0       0		
            //0       0    	-1      -1.0	
            //0       0     -0      0

            //[xScale*x,yScale*y,-z,-z]=>[-xScale*x/z,-yScale*y/z,1]

            //xScale  0     0       0      
            //0     yScale  0       0		
            //0       0    	-1+e    -1.0	
            //0       0     -0  0
            var viewMatrix: Matrix4x4 = SkyRenderer._tempMatrix0;

            camera.viewMatrix.cloneTo(viewMatrix);//视图矩阵逆矩阵的转置矩阵，移除平移和缩放
            camera.projectionMatrix.cloneTo(projectionMatrix);
            viewMatrix.setTranslationVector(Vector3.ZERO);
            var epsilon: number = 1e-6;
            var yScale: number = 1.0 / Math.tan(3.1416 * camera.fieldOfView / 180 * 0.5);
            projectionMatrix.elements[0] = yScale / camera.aspectRatio;
            projectionMatrix.elements[5] = yScale;
            projectionMatrix.elements[10] = epsilon - 1.0;
            projectionMatrix.elements[11] = -1.0;
            projectionMatrix.elements[14] = -0;//znear无穷小
            if ((camera as any).isWebXR) {
                camera._applyViewProject(context, viewMatrix, camera.projectionMatrix);//TODO:优化 不应设置给Camera直接提交
            } else {
                camera._applyViewProject(context, viewMatrix, projectionMatrix);//TODO:优化 不应设置给Camera直接提交
            }

            context._contextOBJ.applyContext(Camera._updateMark);
            context.drawRenderElement(this._renderElement);
            camera._applyViewProject(context, camera.viewMatrix, camera.projectionMatrix);
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
        //@ts-ignore
        this._renderData._onDestroy();
        this._renderElement.destroy();


    }

}


