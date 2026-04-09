import { RenderListQueue } from "../../RenderDriver/DriverCommon/RenderListQueue";
import { IRenderContext2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IRenderStruct2D } from "../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { IBaseRenderNode } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { SingletonList } from "../../utils/SingletonList";
import { IBridgeRenderElement } from "../Bridge3DSprite";
import { IBridge3DRenderProcess } from "./IBridge3DRenderProcess";
import { LayaXBridge3DContext } from "./LayaXBridge3DContext";


/**
 * LayaXBridge3DRenderElement - LayaX (wgpu) native implementation of IBridgeRenderElement
 *
 * Wraps the C++ LayaXBridge3DRenderElement2D_JS which handles all rendering logic
 * (projection correction, clip transform, 3D queue rendering) via Rust FFI.
 */
export class LayaXBridge3DRenderElement implements IBridgeRenderElement {
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

	/**
	 * 渲染流程引用（由Bridge3DCamera持有，通过setRenderProcess传入）
	 * @internal
	 */
	_renderProcess: IBridge3DRenderProcess = null;

	_nativeObj: any;

	private _owner: IRenderStruct2D = null;
	private _baseRenderList: SingletonList<IBaseRenderNode> = new SingletonList();
	private _bridge3DContext: LayaXBridge3DContext = null;

	// TS-side queues for tracking (used for getOpaqueList/getTransparentList interface)
	private _opaqueList: RenderListQueue;
	private _transparentList: RenderListQueue;

	constructor() {
		this._nativeObj = new (window as any).conchLayaXBridge3DElement2D();
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
		// Sync to C++ node list for collectFromNodes
		this._nativeObj.addBaseRenderNode((node as any)._nativeObj);
	}

	removeBaseRenderNode(node: IBaseRenderNode): void {
		this._baseRenderList.remove(node);
		this._nativeObj.removeBaseRenderNode((node as any)._nativeObj);
	}

	setBridge3DContext(context: any): void {
		if (context instanceof LayaXBridge3DContext) {
			if (this._bridge3DContext !== context) {
				this._bridge3DContext = context;
				this._nativeObj.setBridge3DContext(context._nativeObj);
			}
		}
	}

	setRenderProcess(process: IBridge3DRenderProcess): void {
		this._renderProcess = process;
		this._nativeObj.setRenderProcess(process ? (process as any)._nativeObj : null);
	}

	getBaseRenderList(): SingletonList<IBaseRenderNode> {
		return this._baseRenderList;
	}

	getOpaqueList(): RenderListQueue {
		return this._opaqueList;
	}

	getTransparentList(): RenderListQueue {
		return this._transparentList;
	}

	/**
	 * 获取Bridge3D渲染上下文
	 */
	get bridge3DContext(): LayaXBridge3DContext {
		return this._bridge3DContext;
	}

	collectElements(context3d: any): number {
		return this._nativeObj.collectFromNodes((context3d as any)._nativeObj);
	}

	_prepare(context: IRenderContext2D) {
		// no-op on TS side, C++ handles it
	}

	/**
	 * 渲染3D内容到2D当前RT
	 * C++端 LayaXBridge3DRenderElement2D_JS 负责完整流程:
	 *   collectFromNodes → renderProcess->render (三阶段)
	 */
	_render(context: IRenderContext2D) {
		// no-op: C++ _render handles collect + render process delegation
	}

	destroy(): void {
		this._opaqueList?.destroy();
		this._transparentList?.destroy();
		this._opaqueList = null;
		this._transparentList = null;
		this._bridge3DContext = null;
		this._renderProcess = null; // 只清理引用，不销毁（由Bridge3DCamera管理）
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
