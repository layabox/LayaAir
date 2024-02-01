import { LayaGL } from "../../../layagl/LayaGL";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Camera } from "../../core/Camera";
import { GeometryElement } from "../../core/GeometryElement";
import { Material } from "../../../resource/Material";
import { BaseRender } from "../../core/render/BaseRender";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { Scene3D } from "../../core/scene/Scene3D";
import { SkyBox } from "./SkyBox";
import { SkyDome } from "./SkyDome";
import { RenderElement } from "../../core/render/RenderElement";
import { ShaderData, ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { Transform3D } from "../../core/Transform3D";
import { IBaseRenderNode } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";

const InvertYScaleMat = new Matrix4x4(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

const ProjectionViewMat = new Matrix4x4();

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

    /** @internal */
    _baseRenderNode: IBaseRenderNode;

    _cameraData: ShaderData;

    private _renderData: BaseRender;
    static SUNLIGHTDIRECTION: number;
    static SUNLIGHTDIRCOLOR: number;
    static __init__() {
        SkyRenderer.SUNLIGHTDIRECTION = Shader3D.propertyNameToID("u_SunLight_direction");
        SkyRenderer.SUNLIGHTDIRCOLOR = Shader3D.propertyNameToID("u_SunLight_color");
        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite3D");
        commandUniform.addShaderUniform(SkyRenderer.SUNLIGHTDIRECTION, "u_SunLight_direction", ShaderDataType.Vector3);
        commandUniform.addShaderUniform(SkyRenderer.SUNLIGHTDIRCOLOR, "u_SunLight_color", ShaderDataType.Color);
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
                //this._renderElement.renderSubShader = this._material._shader.getSubShaderAt(0);
                //this._baseRenderNode.setOneMaterial(0, value);
            }
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
        this._baseRenderNode = Laya3DRender.Render3DModuleDataFactory.createBaseRenderNode();
        this._baseRenderNode.transform = new Transform3D(null);
        this._baseRenderNode.setRenderelements([this._renderElement._renderElementOBJ]);
        this._baseRenderNode.set_renderUpdatePreCall(this, () => {

            const apply = (viewMat: Matrix4x4, projMat: Matrix4x4) => {

                let context = RenderContext3D._instance;

                var scene: Scene3D = context.scene;
                this._renderData._baseRenderNode.shaderData.setColor(SkyRenderer.SUNLIGHTDIRCOLOR, scene._sunColor);
                this._renderData._baseRenderNode.shaderData.setVector3(SkyRenderer.SUNLIGHTDIRECTION, scene._sundir);

                if (context.invertY) {
                    Matrix4x4.multiply(InvertYScaleMat, projMat, projMat);
                }

                let projectView = ProjectionViewMat;
                Matrix4x4.multiply(projMat, viewMat, projectView);
               
                this._cameraData.setMatrix4x4(Camera.VIEWMATRIX, viewMat);
                this._cameraData.setMatrix4x4(Camera.PROJECTMATRIX, projMat);
                this._cameraData.setMatrix4x4(Camera.VIEWPROJECTMATRIX, projectView);
            }

            let camera = RenderContext3D._instance.camera;

            camera._shaderValues.cloneTo(this._cameraData);

            let viewMatrix = SkyRenderer._tempMatrix0;
            let projectionMatrix = SkyRenderer._tempMatrix1;

            camera.viewMatrix.cloneTo(viewMatrix);//视图矩阵逆矩阵的转置矩阵，移除平移和缩放
            viewMatrix.setTranslationVector(Vector3.ZERO);
            if (!camera.orthographic) {
                camera.projectionMatrix.cloneTo(projectionMatrix);

                var epsilon: number = 1e-6;
                var yScale: number = 1.0 / Math.tan(3.1416 * camera.fieldOfView / 180 * 0.5);
                projectionMatrix.elements[0] = yScale / camera.aspectRatio;
                projectionMatrix.elements[5] = yScale;
                projectionMatrix.elements[10] = epsilon - 1.0;
                projectionMatrix.elements[11] = -1.0;
                projectionMatrix.elements[14] = -0;//znear无穷小

            } else {

                var halfWidth: number = 0.2;
                var halfHeight: number = halfWidth;
                Matrix4x4.createOrthoOffCenter(-halfWidth, halfWidth, -halfHeight, halfHeight, camera.nearPlane, camera.farPlane, projectionMatrix);
            }
            if ((camera as any).isWebXR) {
                apply(viewMatrix, camera.projectionMatrix);//TODO:优化 不应设置给Camera直接提交
            } else {
                apply(viewMatrix, projectionMatrix);//TODO:优化 不应设置给Camera直接提交
            }
        });
    }

    /**
     * @internal
     * 是否可用。
     */
    _isAvailable(): boolean {
        return this._material && this._mesh ? true : false;
    }

    renderUpdate(context: RenderContext3D) {
        let geomettry = this.mesh;
        this._renderElement._renderElementOBJ.isRender = geomettry._prepareRender(context);
        geomettry._updateRenderParams(context);
    }

    /**
     * @internal
     */
    _render(context: RenderContext3D): void {
        if (this._material && this._mesh) {
            var camera = context.camera;
            var scene: Scene3D = context.scene;
            var projectionMatrix: Matrix4x4 = SkyRenderer._tempMatrix1;

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
            viewMatrix.setTranslationVector(Vector3.ZERO);
            if (!camera.orthographic) {
                camera.projectionMatrix.cloneTo(projectionMatrix);

                var epsilon: number = 1e-6;
                var yScale: number = 1.0 / Math.tan(3.1416 * camera.fieldOfView / 180 * 0.5);
                projectionMatrix.elements[0] = yScale / camera.aspectRatio;
                projectionMatrix.elements[5] = yScale;
                projectionMatrix.elements[10] = epsilon - 1.0;
                projectionMatrix.elements[11] = -1.0;
                projectionMatrix.elements[14] = -0;//znear无穷小

            } else {

                var halfWidth: number = 0.2;
                var halfHeight: number = halfWidth;
                Matrix4x4.createOrthoOffCenter(-halfWidth, halfWidth, -halfHeight, halfHeight, camera.nearPlane, camera.farPlane, projectionMatrix);
            }
            if ((camera as any).isWebXR) {
                camera._applyViewProject(context, viewMatrix, camera.projectionMatrix);//TODO:优化 不应设置给Camera直接提交
            } else {
                camera._applyViewProject(context, viewMatrix, projectionMatrix);//TODO:优化 不应设置给Camera直接提交
            }
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
        this._cameraData.destroy();
        this._renderElement.destroy();
        this._baseRenderNode.destroy();
    }

}


