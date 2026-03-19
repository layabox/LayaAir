import { RenderContext3D } from "../d3/core/render/RenderContext3D";
import { LayaGL } from "../layagl/LayaGL";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderStruct2D } from "../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { IBaseRenderNode } from "../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { RenderListQueue } from "../RenderDriver/DriverCommon/RenderListQueue";
import { SubShader } from "../RenderEngine/RenderShader/SubShader";
import { SingletonList } from "../utils/SingletonList";
import { IBridgeRenderElement } from "./Bridge3DSprite";
import { RTBridge3DContext } from "../RenderDriver/OpenGLESDriver/2DRenderPass/RTBridge3DContext";

/**
 * RTBridge3DRenderElement - Native implementation of IBridgeRenderElement
 *
 * Wraps the C++ GLESBridge3DRenderElement2D which handles all rendering logic
 * (projection correction, clip transform, 3D queue rendering) natively.
 */
export class RTBridge3DRenderElement implements IBridgeRenderElement {
    // IRenderElement2D interface properties
    type: number = 0;
    geometry: IRenderGeometryElement = null;
    materialShaderData: ShaderData = null;
    value2DShaderData: ShaderData = null;
    globalShaderData: ShaderData = null;
    subShader: SubShader = null;
    renderStateIsBySprite: boolean = true;
    nodeCommonMap: Array<string> = [];
    _index?: number;

    _nativeObj: any;

    private _owner: IRenderStruct2D = null;
    private _baseRenderList: SingletonList<IBaseRenderNode> = new SingletonList();
    private _bridge3DContext: RTBridge3DContext = null;

    // TS-side queues for tracking (used for getOpaqueList/getTransparentList interface)
    private _opaqueList: RenderListQueue;
    private _transparentList: RenderListQueue;

    constructor() {
        this._nativeObj = new (window as any).conchGLESBridge3DRenderElement2D();
        this._opaqueList = new RenderListQueue(false);
        this._transparentList = new RenderListQueue(true);
    }

    get owner(): IRenderStruct2D {
        return this._owner;
    }

    set owner(value: IRenderStruct2D) {
        this._owner = value;
        this._nativeObj.setOwner(value ? (value as any)._nativeObj : null);
    }

    addBaseRenderNode(node: IBaseRenderNode): void {
        this._baseRenderList.add(node);
    }

    removeBaseRenderNode(node: IBaseRenderNode): void {
        this._baseRenderList.remove(node);
    }

    setBridge3DContext(context: any): void {
        if (context instanceof RTBridge3DContext) {
            this._bridge3DContext = context;
            this._nativeObj.setBridge3DContext(context._nativeObj);
        }
    }

    getOpaqueList(): RenderListQueue {
        return this._opaqueList;
    }

    getTransparentList(): RenderListQueue {
        return this._transparentList;
    }

    /**
     * Update render elements: collect from render nodes, populate C++ queues
     */
    updateRenderElements(): void {
        // Clear C++ queues
        this._nativeObj.clearQueues();
        // Clear TS queues too
        this._opaqueList.clear();
        this._transparentList.clear();

        if (!this._bridge3DContext) {
            return;
        }

        // Update stage render size for C++ projection correction
        this._bridge3DContext.updateStageRenderSize();

        let context3d = RenderContext3D._instance._contextOBJ;

        for (let i = 0, l = this._baseRenderList.length; i < l; i++) {
            let renderNode = this._baseRenderList.elements[i] as any;
            // Call render node update
            renderNode._renderUpdatePre(context3d);

            const elements = renderNode.renderelements;
            if (elements) {
                for (let j = 0; j < elements.length; j++) {
                    const element = elements[j];
                    if (!element || !element.isRender) continue;

                    // Add to appropriate C++ queue via native obj
                    if (element.materialRenderQueue > 2500) {
                        this._nativeObj.addTransparentElement(element._nativeObj);
                        this._transparentList.addRenderElement(element);
                    } else {
                        this._nativeObj.addOpaqueElement(element._nativeObj);
                        this._opaqueList.addRenderElement(element);
                    }
                }
            }
        }

        // Sort both queues
        this._nativeObj.sortQueues();
        this._opaqueList.sort();
        this._transparentList.sort();
    }

    _prepare(context: IRenderContext2D) {
        // no-op on TS side, C++ handles it
    }

    _render(context: IRenderContext2D) {
        // no-op on TS side, C++ handles all rendering
    }

    destroy(): void {
        this._opaqueList?.destroy();
        this._transparentList?.destroy();
        this._opaqueList = null;
        this._transparentList = null;
        this._bridge3DContext = null;
        this._nativeObj?.destroy();
        this._nativeObj = null;
        this._owner = null;
        this.geometry = null;
        this.materialShaderData = null;
        this.value2DShaderData = null;
        this.globalShaderData = null;
        this.subShader = null;
    }
}
