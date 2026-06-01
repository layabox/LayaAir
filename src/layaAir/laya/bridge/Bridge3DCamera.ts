
import { LayaEnv } from "../../LayaEnv";
import { BaseCamera } from "../d3/core/BaseCamera";
import { Camera, CameraClearFlags } from "../d3/core/Camera";
import { RenderContext3D } from "../d3/core/render/RenderContext3D";
import { Scene3D } from "../d3/core/scene/Scene3D";
import { LayaGL } from "../layagl/LayaGL";
import { Color } from "../maths/Color";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { ShaderDataType } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { IBridge3DRenderProcess } from "./render/IBridge3DRenderProcess";
import { RTBridge3DRenderProcess } from "./render/RTBridge3DRenderProcess";
import { WebBridge3DRenderProcess } from "./render/WebBridge3DRenderProcess";

import { LayaXBridge3DRenderProcess } from "./render/LayaXBridge3DRenderProcess";

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
     * Scene → stage 的 4x4 偏移矩阵。
     * 由 Bridge3DSceneInternal 监听 Scene2D 的 TRANSFORM_CHANGED 事件后推送进来。
     * render() 时会左乘到 viewMatrix，从而把 sceneLocal 模型坐标补偿成 stage 像素坐标。
     * 未设置时使用单位矩阵（行为等价于 sceneLocal == globalTrans 的情况，即 Scene 在 stage 原点）。
     * @private
     */
    private _sceneOffsetMatrix: Matrix4x4 = new Matrix4x4();

    /**
     * sceneOffsetMatrix 是否为单位矩阵的标志。单位时 render() 可跳过额外矩阵乘法。
     * @private
     */
    private _sceneOffsetIsIdentity: boolean = true;

    /**
     * Called when projection parameters that affect Bridge3D camera placement change.
     * @private
     */
    private _projectionChangeHandler: (() => void) = null;

    /**
     * 构造函数
     */
    constructor() {
        super();

        // 创建统一渲染流程 (3-way 平台感知):
        // LayaX 原生 (wgpu) / Conch GLES 原生 / Web (浏览器或 conch graphicsAPI=2 的 WebGL 回退)
        if (LayaEnv.isLayaX) {
            this._bridge3DRenderProcess = new LayaXBridge3DRenderProcess();
        } else if (LayaEnv.isConch && (window as any).conchConfig.getGraphicsAPI() != 2) {
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
     * @internal
     */
    setProjectionChangeHandler(handler: () => void): void {
        this._projectionChangeHandler = handler;
    }

    override get fieldOfView(): number {
        return super.fieldOfView;
    }

    override set fieldOfView(value: number) {
        super.fieldOfView = value;
        if (this._projectionChangeHandler) {
            this._projectionChangeHandler();
        }
    }

    /**
     * 设置 Scene → stage 的偏移矩阵。
     *
     * 矩阵推导（设 Scene 2D 全局矩阵为 (a, b, c, d, tx, ty)，stage 高度为 H）：
     * ```
     * | a   -c   0   c*H + tx        |
     * | -b   d   0   H*(1-d) - ty    |
     * | 0    0   1   0               |
     * | 0    0   0   1               |
     * ```
     * 注意：H 来自 RenderState2D.height，stage resize 时也需要重算。
     *
     * @param a/b/c/d/tx/ty Scene 2D 全局矩阵分量
     * @param renderHeight 当前渲染高度（用于最终 stage/canvas Y-up 空间）
     * @param sceneHeight Scene 逻辑高度（用于 sceneLocal 自身的 Y 翻转）
     */
    setSceneOffsetFrom2DMatrix(a: number, b: number, c: number, d: number, tx: number, ty: number, renderHeight: number, sceneHeight: number = renderHeight): void {
        const e = this._sceneOffsetMatrix.elements;
        // 列 0: X 基向量
        e[0] = a;
        e[1] = -b;
        e[2] = 0;
        e[3] = 0;
        // 列 1: Y 基向量（注意 c 取负，d 不变；2D Y-down → 3D Y-up 翻转）
        e[4] = -c;
        e[5] = d;
        e[6] = 0;
        e[7] = 0;
        // 列 2: Z 基向量
        e[8] = 0;
        e[9] = 0;
        e[10] = 1;
        e[11] = 0;
        // 列 3: 平移
        e[12] = c * sceneHeight + tx;
        e[13] = renderHeight - d * sceneHeight - ty;
        e[14] = 0;
        e[15] = 1;

        // 标记是否为单位矩阵（Scene 在 stage 原点且无缩放/旋转时）
        this._sceneOffsetIsIdentity =
            a === 1 && b === 0 && c === 0 && d === 1 && tx === 0 && ty === 0;
    }

    /**
     * 读取当前的 Scene→stage 偏移矩阵（只读引用，不要在外部修改）。
     * 用于把 sceneLocal 3D 世界坐标映射回 stage 像素空间，或反向。
     */
    get sceneOffsetMatrix(): Matrix4x4 {
        return this._sceneOffsetMatrix;
    }

    /**
     * 偏移矩阵是否为单位矩阵（Scene 位于 stage 原点且无缩放/旋转）。
     */
    get sceneOffsetIsIdentity(): boolean {
        return this._sceneOffsetIsIdentity;
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
        context.invertY = LayaEnv.isLayaX;
        this._prepareCameraToRender();

        let viewMat = this.viewMatrix;
        this._applyViewProject(viewMat, this.projectionMatrix, context.invertY);
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
