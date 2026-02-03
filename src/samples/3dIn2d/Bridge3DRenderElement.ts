import { IBridgeRenderElement } from "./Bridge3DSprite";
import { IRenderStruct2D } from "../../layaAir/laya/RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { IRenderGeometryElement } from "../../layaAir/laya/RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../layaAir/laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SubShader } from "../../layaAir/laya/RenderEngine/RenderShader/SubShader";
import { RenderListQueue } from "../../layaAir/laya/RenderDriver/DriverCommon/RenderListQueue";
import { WebBaseRenderNode } from "../../layaAir/laya/RenderDriver/RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { SingletonList } from "laya/utils/SingletonList";
import { IRenderContext2D } from "laya/RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { ISceneNodeData, ICameraNodeData } from "laya/RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
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

    private _baseRenderList: SingletonList<WebBaseRenderNode> = new SingletonList();

    /**
     * Bridge3D渲染上下文（由Scene3D传递，不持有）
     * @private
     * @remarks
     * 该引用由Bridge3DScene3D在每帧prepareAllBridge3DElements中传递
     * RenderElement不负责创建或销毁context
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
     * 渲染3D内容
     * @param context - 2D渲染上下文
     * @remarks
     * - 由2D渲染管线调用
     * - 使用Bridge3DContext统一管理渲染参数
     * - 先渲染不透明物体,再渲染半透明物体
     * - 新增：检查context有效性
     */
    _render(context: IRenderContext2D): void {

        let context3d = RenderContext3D._instance._contextOBJ;

        // 如果没有任何渲染元素,直接返回
        if (this._opaqueList.elements.length === 0 && this._transparentList.elements.length === 0) {
            return;
        }

        // 检查context是否已设置
        if (!this._bridge3DContext || !this._bridge3DContext.sceneData || !this._bridge3DContext.cameraData) {
            console.warn("Bridge3DRenderElement: context not properly initialized for rendering");
            return;
        }

        // 应用Bridge3D渲染上下文参数到3D渲染上下文
        // 这会设置viewport、scissor、clearData、pipelineMode、invertY等所有必要参数
        this._bridge3DContext.applyToContext(context3d);

        // 渲染不透明物体
        if (this._opaqueList.elements.length > 0) {
            this._opaqueList.renderQueueOnly(context3d);
        }

        // 渲染半透明物体
        if (this._transparentList.elements.length > 0) {
            this._transparentList.renderQueueOnly(context3d);
        }
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
        this.owner = null;
        this.geometry = null;
        this.materialShaderData = null;
        this.value2DShaderData = null;
        this.globalShaderData = null;
        this.subShader = null;
    }
}
