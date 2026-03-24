
import { BaseCamera } from "../../d3/core/BaseCamera";
import { RenderContext3D } from "../../d3/core/render/RenderContext3D";
import { Color } from "../../maths/Color";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector4 } from "../../maths/Vector4";
import { Viewport } from "../../maths/Viewport";
import { RenderListQueue } from "../../RenderDriver/DriverCommon/RenderListQueue";
import { IRenderContext2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IRenderStruct2D } from "../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { WebBaseRenderNode } from "../../RenderDriver/RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import type { WebRenderStruct2D } from "../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRenderStruct2D";
import { RenderClearFlag } from "../../RenderEngine/RenderEnum/RenderClearFlag";
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { SingletonList } from "../../utils/SingletonList";
import { RenderState2D } from "../../webgl/utils/RenderState2D";
import { ShaderDefines2D } from "../../webgl/shader/d2/ShaderDefines2D";
import { IBridgeRenderElement } from "../Bridge3DSprite";
import { Bridge3DCamera } from "../Bridge3DCamera";
import { Bridge3DContext } from "./Bridge3DContext";

/**
 * Bridge3DRenderElement是Bridge3DSprite的渲染元素,负责将3D内容集成到2D渲染管线
 *
 * @class Bridge3DRenderElement
 */
export class Bridge3DRenderElement implements IBridgeRenderElement {
    // IRenderElement2D 接口必需属性
    type: number = 0;
    geometry: IRenderGeometryElement = null;
    materialShaderData: ShaderData = null;
    value2DShaderData: ShaderData = null;
    globalShaderData: ShaderData = null;
    subShader: SubShader = null;
    renderStateIsBySprite: boolean = true;
    nodeCommonMap: Array<string> = [];
    owner: IRenderStruct2D = null;
    _index?: number;
    _baseRenderList: SingletonList<WebBaseRenderNode> = new SingletonList();

    /**
     * Bridge3D渲染上下文（由Scene3D传递，不持有）
     * @private
     */
    private _bridge3DContext: Bridge3DContext = null;

    /**
     * 不透明渲染元素队列
     * @private
     */
    private _opaqueList: RenderListQueue;

    /**
     * 半透明渲染元素队列
     * @private
     */
    private _transparentList: RenderListQueue;

    /**
     * 临时viewport用于RT渲染
     * @private
     */
    private static _tempViewport: Viewport = new Viewport(0, 0, 0, 0);

    /**
     * 临时scissor用于RT渲染
     * @private
     */
    private static _tempScissor: Vector4 = new Vector4(0, 0, 0, 0);

    /**
     * 保存原始投影矩阵
     * @private
     */
    private static _savedProjMatrix: Matrix4x4 = new Matrix4x4();

    /**
     * 保存原始投影视图矩阵
     * @private
     */
    private static _savedProjViewMatrix: Matrix4x4 = new Matrix4x4();


    private _cachedPassData: ShaderData = null;

    /** clip 变换结果缓存：以 info._updateFrame + rtH + passData 为失效依据，避免逐分量比较 */
    private _cachedRtClipDir: Vector4 = new Vector4();
    private _cachedRtClipPos: Vector4 = new Vector4();
    private _cachedRtH = -1;
    private _cachedClipUpdateFrame = -1;
    private _clipCacheValid = false;

    /**
     * 创建Bridge3DRenderElement实例
     */
    constructor() {
        this._opaqueList = new RenderListQueue(false);
        this._transparentList = new RenderListQueue(true);
    }

    addBaseRenderNode(node: WebBaseRenderNode): void {
        this._baseRenderList.add(node);
    }

    removeBaseRenderNode(node: WebBaseRenderNode): void {
        this._baseRenderList.remove(node);
    }

    setBridge3DContext(context: Bridge3DContext): void {
        this._bridge3DContext = context;
    }

    getOpaqueList(): RenderListQueue {
        return this._opaqueList;
    }

    getTransparentList(): RenderListQueue {
        return this._transparentList;
    }

    /**
     * 是否在渲染前清空深度缓冲
     * @default true
     * @remarks
     * - true: 实现独立深度隔离,不同Bridge3D的3D内容不互相遮挡
     * - false: 共享深度缓冲,可能导致跨Bridge3D的深度冲突
     */
    get clearDepthBeforeRender(): boolean {
        return this._bridge3DContext?.clearDepthBeforeRender ?? true;
    }

    set clearDepthBeforeRender(value: boolean) {
        if (this._bridge3DContext) {
            this._bridge3DContext.clearDepthBeforeRender = value;
        }
    }

    /**
     * 获取Bridge3D渲染上下文（只读）
     */
    get bridge3DContext(): Bridge3DContext {
        return this._bridge3DContext;
    }

    /**
     * 准备渲染元素
     * @remarks
     * - 从容器Sprite3D递归收集渲染节点
     * - 收集不透明与半透明的RenderElement
     * - 对渲染队列进行排序
     * - 新增：检查context有效性
     */
    updateRenderElements(): void {
        this._opaqueList.clear();
        this._transparentList.clear();

        // 检查context是否已设置
        if (!this._bridge3DContext || !this._bridge3DContext.sceneData || !this._bridge3DContext.cameraData) {
            console.warn("Bridge3DRenderElement: context not properly initialized");
            return;
        }

        let context3d = RenderContext3D._instance._contextOBJ;

        for (let i = 0, l = this._baseRenderList.length; i < l; i++) {
            let renderNode = this._baseRenderList.elements[i];
            // 调用渲染节点的更新前准备
            renderNode._renderUpdatePre(context3d);

            const elements = renderNode.renderelements;
            if (elements) {
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    if (!element || !element.isRender) continue;

                    // 根据渲染队列值分类 (> 2500 为透明队列)
                    if (element.materialRenderQueue > 2500) {
                        this._transparentList.addRenderElement(element);
                    } else {
                        this._opaqueList.addRenderElement(element);
                    }
                }
            }
        }
        // 对渲染队列进行排序
        this._opaqueList.sort();
        this._transparentList.sort();
    }

    _prepare(context: IRenderContext2D) {

    }

    /**
     * 渲染3D内容到2D当前RT
     * @param context - 2D渲染上下文
     * @remarks
     * 由2D渲染管线调用，实现：
     * 1. 获取2D当前RT并设置到3D context
     * 2. 计算投影校正矩阵M_corr（逆矩阵影响3D投影）
     * 3. Fragment shader clip（ClipRect含旋转影响3D渲染）
     * 4. 渲染3D内容
     * 5. 恢复2D状态
     */
    _render(context: IRenderContext2D): void {
        // window.startCapture();
        let context3d = RenderContext3D._instance._contextOBJ;

        // 如果没有任何渲染元素,直接返回
        if (this._opaqueList.elements.length === 0 && this._transparentList.elements.length === 0) {
            return;
        }

        // 检查context是否已设置
        if (!this._bridge3DContext || !this._bridge3DContext.sceneData || !this._bridge3DContext.cameraData) {
            return;
        }

        // ===== 1. 获取2D当前RT =====
        const rt2d = context.getRenderTarget();
        const cachedInvertY = context.invertY;

        // 获取RT尺寸和viewport尺寸
        let rtW: number, rtH: number;
        const vpW = RenderState2D.width;
        const vpH = RenderState2D.height;

        if (rt2d) {
            rtW = rt2d._textures[0].width;
            rtH = rt2d._textures[0].height;
        } else {
            rtW = vpW;
            rtH = vpH;
        }

        // ===== 2. 获取逆矩阵 =====
        let hasInvertMatrix = false;
        let invA = 1, invB = 0, invC = 0, invD = 1, invTx = 0, invTy = 0;

        if (rt2d) {
            const passData = context.passData;
            if (passData) {
                const mat0 = passData.getVector3(ShaderDefines2D.UNIFORM_INVERTMAT_0);
                const mat1 = passData.getVector3(ShaderDefines2D.UNIFORM_INVERTMAT_1);
                if (mat0 && mat1) {
                    invA = mat0.x;   // a
                    invC = mat0.y;   // c
                    invTx = mat0.z;  // tx
                    invB = mat1.x;   // b
                    invD = mat1.y;   // d
                    invTy = mat1.z;  // ty
                    hasInvertMatrix = true;
                }
            }
        }

        
        // ===== 3. 应用Bridge3D基础上下文参数 =====
        this._bridge3DContext.applyToContext(context3d);


        // ===== 4. 设置3D渲染目标为2D当前RT =====
        const clearFlag = this._bridge3DContext.clearDepthBeforeRender
            ? RenderClearFlag.Depth | RenderClearFlag.Stencil
            : RenderClearFlag.Nothing;
        context3d.setRenderTarget(rt2d, clearFlag);

        context3d.pipelineMode = context.pipelineMode;

        // ===== 5. 设置viewport和scissor为RT尺寸 =====
        if (rt2d) {
            const tempVP = Bridge3DRenderElement._tempViewport;
            tempVP.x = 0;
            tempVP.y = 0;
            tempVP.width = rtW;
            tempVP.height = rtH;
            context3d.setViewPort(tempVP);

            const tempSC = Bridge3DRenderElement._tempScissor;
            tempSC.setValue(0, 0, rtW, rtH);
            context3d.setScissor(tempSC);
        }

        // ===== 6. 投影校正（逆矩阵影响3D投影）=====
        let projCorrected = false;
        if (hasInvertMatrix) {
            const cameraData = this._bridge3DContext.cameraData;

            // 保存原始投影矩阵
            const origProj = cameraData.getMatrix4x4(BaseCamera.PROJECTMATRIX);
            const origProjView = cameraData.getMatrix4x4(BaseCamera.VIEWPROJECTMATRIX);

            if (origProj && origProjView) {
                origProj.cloneTo(Bridge3DRenderElement._savedProjMatrix);
                origProjView.cloneTo(Bridge3DRenderElement._savedProjViewMatrix);

                // 设置逆矩阵到context并计算校正矩阵
                this._bridge3DContext.setInvertMatrix(invA, invB, invC, invD, invTx, invTy);
                const corrMat = Bridge3DContext._correctionMatrix;
                this._bridge3DContext.computeCorrectionMatrix(vpW, vpH, rtW, rtH, corrMat);

                // correctedProj = M_corr × projectionMatrix
                const correctedProj = Bridge3DContext._tempCorrectedProj;
                Matrix4x4.multiply(corrMat, origProj, correctedProj);

                // correctedProjView = M_corr × projectionViewMatrix
                const correctedProjView = Bridge3DContext._tempCorrectedProjView;
                Matrix4x4.multiply(corrMat, origProjView, correctedProjView);

                // 临时修改camera shader data
                cameraData.setMatrix4x4(BaseCamera.PROJECTMATRIX, correctedProj);
                cameraData.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, correctedProjView);

                projCorrected = true;
            }
        }

        // ===== 7. Fragment shader clip（从 struct.getClipInfo() 读取，以 _updateFrame 判定缓存失效）=====
        let hasShaderClip = false;
        const ownerStruct = this.owner as WebRenderStruct2D;
        if (ownerStruct && typeof ownerStruct.getClipInfo === 'function') {
            if (ownerStruct.hasClip()) {
                const info = ownerStruct.getClipInfo();
                const clipReuse =
                    this._clipCacheValid &&
                    this._cachedClipUpdateFrame === info._updateFrame &&
                    this._cachedRtH === rtH &&
                    this._cachedPassData === context.passData;

                if (!clipReuse) {
                    const clipDir = info.clipMatDir;
                    const clipPos = info.clipMatPos;
                    this._cachedRtClipPos.x = invA * clipPos.x + invC * clipPos.y + invTx;
                    this._cachedRtClipPos.y = invB * clipPos.x + invD * clipPos.y + invTy;
                    this._cachedRtClipPos.z = rtH;
                    this._cachedRtClipPos.w = 0;
                    this._cachedRtClipDir.x = invA * clipDir.x + invC * clipDir.y;
                    this._cachedRtClipDir.y = invB * clipDir.x + invD * clipDir.y;
                    this._cachedRtClipDir.z = invA * clipDir.z + invC * clipDir.w;
                    this._cachedRtClipDir.w = invB * clipDir.z + invD * clipDir.w;
                    this._cachedClipUpdateFrame = info._updateFrame;
                    this._cachedRtH = rtH;
                    this._cachedPassData = context.passData;
                    this._clipCacheValid = true;
                }

                const cameraData = this._bridge3DContext.cameraData;
                cameraData.addDefine(Bridge3DCamera.BRIDGE3D_CLIP);
                cameraData.setVector(Bridge3DCamera.BRIDGE3D_CLIPDIR, this._cachedRtClipDir);
                cameraData.setVector(Bridge3DCamera.BRIDGE3D_CLIPPOS, this._cachedRtClipPos);
                hasShaderClip = true;
            } else {
                this._clipCacheValid = false;
            }
        } else {
            this._clipCacheValid = false;
        }

        // ===== 8. 渲染3D内容 =====
        // 渲染不透明物体
        if (this._opaqueList.elements.length > 0) {
            this._opaqueList.renderQueueOnly(context3d);
        }

        // 渲染半透明物体
        if (this._transparentList.elements.length > 0) {
            this._transparentList.renderQueueOnly(context3d);
        }

        // ===== 9. 恢复状态 =====
        // 恢复shader clip
        if (hasShaderClip) {
            const cameraData = this._bridge3DContext.cameraData;
            cameraData.removeDefine(Bridge3DCamera.BRIDGE3D_CLIP);
        }

        // 恢复投影矩阵
        if (projCorrected) {
            const cameraData = this._bridge3DContext.cameraData;
            cameraData.setMatrix4x4(BaseCamera.PROJECTMATRIX, Bridge3DRenderElement._savedProjMatrix);
            cameraData.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, Bridge3DRenderElement._savedProjViewMatrix);
        }

        // 恢复2D RT和invertY
        context.setRenderTarget(rt2d, false, Color.BLACK);
        context.invertY = cachedInvertY;

        // window.stopCapture();
    }

    /**
     * 销毁渲染元素
     */
    destroy(): void {
        this._opaqueList?.destroy();
        this._transparentList?.destroy();
        this._opaqueList = null;
        this._transparentList = null;
        this._bridge3DContext = null; // 只清理引用，不销毁（由Scene3D管理）
        this._cachedPassData = null;
        this._clipCacheValid = false;
        this.owner = null;
        this.geometry = null;
        this.materialShaderData = null;
        this.value2DShaderData = null;
        this.globalShaderData = null;
        this.subShader = null;
    }
}
