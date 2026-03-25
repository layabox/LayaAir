
import { LayaEnv } from "../../LayaEnv";
import { BaseCamera } from "../d3/core/BaseCamera";
import { Camera, CameraClearFlags } from "../d3/core/Camera";
import { RenderContext3D } from "../d3/core/render/RenderContext3D";
import { Scene3D } from "../d3/core/scene/Scene3D";
import { LayaGL } from "../layagl/LayaGL";
import { Color } from "../maths/Color";
import { ShaderDataType } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { IBridge3DRenderProcess } from "./render/IBridge3DRenderProcess";
import { RTBridge3DRenderProcess } from "./render/RTBridge3DRenderProcess";
import { WebBridge3DRenderProcess } from "./render/WebBridge3DRenderProcess";

/**
 * Bridge3D专用相机，用于2D场景中3D节点的渲染
 *
 * @remarks
 * 该相机继承自标准Camera类，持有统一的Bridge3D渲染流程（阴影+前向），
 * 与Scene3D的Camera持有IRender3DProcess的架构对称。
 */
export class Bridge3DCamera extends Camera {

    /** @internal Bridge3D clip define */
    static BRIDGE3D_CLIP: ShaderDefine;
    /** @internal */
    static BRIDGE3D_CLIPDIR: number;
    /** @internal */
    static BRIDGE3D_CLIPPOS: number;

    static __init__() {
        // Bridge3D clip
        Bridge3DCamera.BRIDGE3D_CLIP = Shader3D.getDefineByName("BRIDGE3D_CLIP");
        Bridge3DCamera.BRIDGE3D_CLIPDIR = Shader3D.propertyNameToID("u_Bridge3DClipDir");
        Bridge3DCamera.BRIDGE3D_CLIPPOS = Shader3D.propertyNameToID("u_Bridge3DClipPos");

        let camerauniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap(BaseCamera.cameraBlockName);
        camerauniformMap.addShaderUniform(Bridge3DCamera.BRIDGE3D_CLIPDIR, "u_Bridge3DClipDir", ShaderDataType.Vector4);
        camerauniformMap.addShaderUniform(Bridge3DCamera.BRIDGE3D_CLIPPOS, "u_Bridge3DClipPos", ShaderDataType.Vector4);
    }

    /**
     * Bridge3D统一渲染流程（阴影+前向，与Scene3D的Camera持有IRender3DProcess对称）
     * @private
     */
    private _bridge3DRenderProcess: IBridge3DRenderProcess;

    /**
     * 构造函数
     */
    constructor() {
        super();

        // 创建统一渲染流程（平台感知）
        if (LayaEnv.isConch && (window as any).conchConfig.getGraphicsAPI() != 2) {
            this._bridge3DRenderProcess = new RTBridge3DRenderProcess();
        } else {
            this._bridge3DRenderProcess = new WebBridge3DRenderProcess();
        }

        // 配置Bridge3DCamera的默认设置
        this._setupBridge3DCameraDefaults();
    }

    /**
     * 设置Bridge3DCamera的默认配置
     * @private
     */
    private _setupBridge3DCameraDefaults(): void {
        // 清除设置：只清除深度，不清除颜色
        this.clearFlag = CameraClearFlags.DepthOnly;
        this.clearColor = new Color(1, 1, 1, 1);

        // 渲染设置：禁用HDR和MSAA以提高性能
        this.enableHDR = false;
        this.msaa = false;

        // 后期处理：禁用以提高性能
        this.postProcess = null;

        // 启用渲染（虽然不渲染到屏幕，但需要渲染阴影贴图）
        this.enableRender = true;

        // 禁用内置渲染纹理（不需要屏幕输出）
        this.enableBuiltInRenderTexture = false;
    }

    /**
     * 获取Bridge3D渲染流程
     */
    get bridge3DRenderProcess(): IBridge3DRenderProcess {
        return this._bridge3DRenderProcess;
    }

    /**
     * 重写Camera.render()，匹配Scene3D Camera.render()的流程：
     *   1. 上下文设置
     *   2. 相机准备（无条件，保证UBO始终有效）
     *   3. 委托 process.fowardRender（context准备+元素收集+阴影）
     *
     * @param scene 场景对象
     */
    override render(scene: Scene3D): void {
        if (!scene) return;

        // 1. 上下文设置（对标 Camera.render 开头）
        const context = RenderContext3D._instance;
        context.scene = scene;
        context.camera = this;

        // 2. 相机准备（无条件，对标 Camera.render 中的 _prepareCameraToRender + _applyViewProject + _contextApply）
        // Bridge3D 相机不渲染到独立 RT，始终 invertY = false（对标 Camera.render 1378 行）
        // context.invertY = false;
        this._prepareCameraToRender();
        this._applyViewProject(this.viewMatrix, this.projectionMatrix, context.invertY);
        this._contextApply(context);

        // 3. 委托 process 处理完整流程（对标 Camera.render → _Render3DProcess.fowardRender）
        this._bridge3DRenderProcess.fowardRender(context._contextOBJ, this);
    }

    /**
     * 克隆Bridge3DCamera
     * @returns 克隆的相机实例
     */
    override clone(): Bridge3DCamera {
        const clonedCamera = <Bridge3DCamera>super.clone();
        return clonedCamera;
    }

    /**
     * 销毁Bridge3DCamera
     * @param destroyChild 是否销毁子节点
     */
    override destroy(destroyChild: boolean = true): void {
        // 销毁Bridge3D渲染流程
        if (this._bridge3DRenderProcess) {
            this._bridge3DRenderProcess.destroy();
            this._bridge3DRenderProcess = null;
        }

        // 调用父类销毁方法
        super.destroy(destroyChild);
    }
}
