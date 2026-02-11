
import { BaseCamera } from "../d3/core/BaseCamera";
import { Camera, CameraClearFlags } from "../d3/core/Camera";
import { RenderContext3D } from "../d3/core/render/RenderContext3D";
import { Scene3D } from "../d3/core/scene/Scene3D";
import { LayaGL } from "../layagl/LayaGL";
import { Color } from "../maths/Color";
import { RenderListQueue } from "../RenderDriver/DriverCommon/RenderListQueue";
import { ShaderDataType } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { FastSinglelist } from "../utils/SingletonList";
import { WebShadowOnlyProcess } from "./WebShadowOnlyRP/WebShadowOnlyProcess";

/**
 * Bridge3D专用相机，用于2D场景中3D节点的阴影渲染
 *
 * @remarks
 * 该相机继承自标准Camera类，但专注于阴影生成，不进行屏幕渲染。
 * 主要特性：
 * - 阴影专用渲染：只渲染阴影贴图，不输出到屏幕
 * - Bridge3D集成：专门处理Bridge3DRenderElement对象
 * - 轻量级设计：移除不必要的渲染通道，优化性能
 * - 独立管理：由Bridge3DManager或Bridge3DScene3D管理，与Scene3D解耦
 */
export class Bridge3DCamera extends Camera {
    
    /** @internal Bridge3D clip define */
    static BRIDGE3D_CLIP: ShaderDefine;
    /** @internal */
    static BRIDGE3D_CLIPDIR: number;
    /** @internal */
    static BRIDGE3D_CLIPPOS: number;
    /** @internal */
    static BRIDGE3D_CLIPRTH: number;

    static __init__() {
        // Bridge3D clip
        Bridge3DCamera.BRIDGE3D_CLIP = Shader3D.getDefineByName("BRIDGE3D_CLIP");
        Bridge3DCamera.BRIDGE3D_CLIPDIR = Shader3D.propertyNameToID("u_Bridge3DClipDir");
        Bridge3DCamera.BRIDGE3D_CLIPPOS = Shader3D.propertyNameToID("u_Bridge3DClipPos");
        Bridge3DCamera.BRIDGE3D_CLIPRTH = Shader3D.propertyNameToID("u_Bridge3DClipRTH");

        let camerauniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap(BaseCamera.cameraBlockName);
        camerauniformMap.addShaderUniform(Bridge3DCamera.BRIDGE3D_CLIPDIR, "u_Bridge3DClipDir", ShaderDataType.Vector4);
        camerauniformMap.addShaderUniform(Bridge3DCamera.BRIDGE3D_CLIPPOS, "u_Bridge3DClipPos", ShaderDataType.Vector4);
        camerauniformMap.addShaderUniform(Bridge3DCamera.BRIDGE3D_CLIPRTH, "u_Bridge3DClipRTH", ShaderDataType.Float);
    }

    /**
     * 阴影专用渲染流程
     * @private
     */
    private _shadowOnlyProcess: WebShadowOnlyProcess;

    /**
     * 收集到的不透明渲染队列列表
     * @private
     */
    private _opaqueListQueues: FastSinglelist<RenderListQueue> = new FastSinglelist;

    /**
     * 构造函数
     */
    constructor() {
        super();

        // 创建阴影专用渲染流程
        this._shadowOnlyProcess = new WebShadowOnlyProcess();

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
     * 设置不透明渲染队列列表
     * @param opaqueQueues 不透明渲染队列列表
     */
    setOpaqueListQueues(opaqueQueues: FastSinglelist<RenderListQueue>): void {
        this._opaqueListQueues = opaqueQueues;
    }

    /**
     * 获取不透明渲染队列列表
     * @returns 不透明渲染队列列表
     */
    getOpaqueListQueues(): FastSinglelist<RenderListQueue> {
        return this._opaqueListQueues;
    }

    /**
     * 渲染阴影贴图（重写父类方法）
     *
     * @remarks
     * 该方法使用 WebShadowOnlyProcess 执行阴影专用渲染，跳过所有几何体/精灵的屏幕渲染。
     *
     * 关键步骤：
     * 1. 准备相机着色器值（u_CameraPos, u_View, u_Projection, u_ViewProjection等）
     * 2. 设置渲染上下文矩阵
     * 3. 执行阴影渲染
     *
     * @param scene 场景对象（用于获取灯光信息和场景渲染管理器）
     */
    override render(scene: Scene3D): void {
        // 1. 验证输入
        if (!scene || !this._opaqueListQueues || this._opaqueListQueues.length === 0) {
            return;
        }

        // 2. 设置渲染上下文
        const context = RenderContext3D._instance;
        context.scene = scene;
        context.camera = this;

        // 3. 准备相机着色器值（设置相机位置、方向、视口、投影参数等）
        this._prepareCameraToRender();
        this._applyViewProject(this.viewMatrix, this.projectionMatrix, context.invertY);
        this._contextApply(context);

        // 4. 设置场景的剔除相机（用于阴影剔除）
        scene._setCullCamera(this);

        // 5. 设置阴影专用流程的渲染管理器
        this._shadowOnlyProcess.render3DManager = scene.sceneRenderableManager._sceneManagerOBJ;

        // 6. 执行阴影专用渲染
        // 注意：这里不需要创建内部渲染纹理，因为我们不渲染到屏幕
        this._shadowOnlyProcess.fowardRender(context._contextOBJ, this);

        // 7. 恢复场景的剔除相机
        scene.recaculateCullCamera();

    }

    /**
     * 克隆Bridge3DCamera
     * @returns 克隆的相机实例
     */
    override clone(): Bridge3DCamera {
        const clonedCamera = <Bridge3DCamera>super.clone();
        // 注意：克隆的相机会在构造函数中创建新的 _shadowOnlyProcess
        return clonedCamera;
    }

    /**
     * 销毁Bridge3DCamera
     * @param destroyChild 是否销毁子节点
     */
    override destroy(destroyChild: boolean = true): void {
        // 销毁阴影专用渲染流程
        if (this._shadowOnlyProcess) {
            this._shadowOnlyProcess.destroy();
            this._shadowOnlyProcess = null;
        }

        // 清理渲染队列引用
        this._opaqueListQueues = null;

        // 调用父类销毁方法
        super.destroy(destroyChild);
    }
}
