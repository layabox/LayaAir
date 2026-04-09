
import { RenderContext3D } from "../../d3/core/render/RenderContext3D";
import { Vector4 } from "../../maths/Vector4";
import { RenderListQueue } from "../../RenderDriver/DriverCommon/RenderListQueue";
import { IRenderContext2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IRenderStruct2D } from "../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { WebBaseRenderNode } from "../../RenderDriver/RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { SingletonList } from "../../utils/SingletonList";
import { IBridgeRenderElement } from "../Bridge3DSprite";
import { Bridge3DContext } from "./Bridge3DContext";
import { IBridge3DRenderProcess } from "./IBridge3DRenderProcess";

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
     * 渲染流程引用（由Bridge3DCamera持有，通过setRenderProcess传入）
     * @internal
     */
    _renderProcess: IBridge3DRenderProcess = null;

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

    /** @internal */ _cachedPassData: ShaderData = null;

    /** clip 变换结果缓存：以 info._updateFrame + rtH + passData 为失效依据，避免逐分量比较 */
    /** @internal */ _cachedRtClipDir: Vector4 = new Vector4();
    /** @internal */ _cachedRtClipPos: Vector4 = new Vector4();
    /** @internal */ _cachedRtH = -1;
    /** @internal */ _cachedClipUpdateFrame = -1;
    /** @internal */ _clipCacheValid = false;

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

    setRenderProcess(process: IBridge3DRenderProcess): void {
        this._renderProcess = process;
    }

    getBaseRenderList(): SingletonList<WebBaseRenderNode> {
        return this._baseRenderList;
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

    collectElements(context3d: any): number {
        this._opaqueList.clear();
        this._transparentList.clear();

        for (let i = 0, l = this._baseRenderList.length; i < l; i++) {
            let renderNode = this._baseRenderList.elements[i] as WebBaseRenderNode;
            renderNode._renderUpdatePre(context3d);

            const elements = renderNode.renderelements;
            if (elements) {
                for (let j = 0; j < elements.length; j++) {
                    const el = elements[j];
                    if (!el || !el.isRender) continue;
                    if (el.materialRenderQueue > 2500) {
                        this._transparentList.addRenderElement(el);
                    } else {
                        this._opaqueList.addRenderElement(el);
                    }
                }
            }
        }
        this._opaqueList.sort();
        this._transparentList.sort();
        return -1;
    }

    _prepare(context: IRenderContext2D) {

    }

    /**
     * 渲染3D内容到2D当前RT
     * @param context - 2D渲染上下文
     * @remarks
     * 委托给 WebBridge3DRenderProcess 的三阶段流程:
     *   initBridge3DRenderPass → prepareProjectionCorrection → renderBridge3DForward
     */
    _render(context: IRenderContext2D): void {
        // 检查context和process是否已设置
        if (!this._renderProcess || !this._bridge3DContext || !this._bridge3DContext.sceneData || !this._bridge3DContext.cameraData) {
            return;
        }

        // collectElements 移入 _renderProcess.render() 中，在 initBridge3DRenderPass (applyToContext) 之后执行，
        // 确保 context3d.sceneData 已正确设置
        let context3d = RenderContext3D._instance._contextOBJ;
        this._renderProcess.render(this, context, context3d);
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
        this._renderProcess = null; // 只清理引用，不销毁（由Bridge3DCamera管理）
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
