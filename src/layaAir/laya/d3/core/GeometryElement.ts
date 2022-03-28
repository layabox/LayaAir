import { RenderContext3D } from "./render/RenderContext3D"
import { IDestroy } from "../../resource/IDestroy"
import { IRenderGeometryElement } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { BufferState } from "./BufferState";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { SingletonList } from "../component/SingletonList";
import { LayaGL } from "../../layagl/LayaGL";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";

/**
 * <code>GeometryElement</code> 类用于实现几何体元素,该类为抽象类。
 */
export class GeometryElement implements IDestroy, IRenderGeometryElement {
	protected _owner:any;
	/**@internal */
	protected static _typeCounter: number = 0;
	/**@internal */
	protected _destroyed: boolean;

	protected _bufferState: BufferState;
	protected _mode: MeshTopology;
	protected _drawType: number;
	drawParams:SingletonList<number>;
	protected _instanceCount: number;
	protected _indexFormat: IndexFormat;

	/**
	 * VAO OBJ
	 */
	set bufferState(value: BufferState) {
		this._bufferState = value;
	}

	get bufferState(): BufferState {
		return this._bufferState;
	}

	/**
	 * mesh topology type
	 */
	set mode(value: MeshTopology) {
		this._mode = value;
	}

	get mode(): MeshTopology {
		return this._mode;
	}

	/**
	 * draw Type
	 */
	set drawType(value: number) {
		this._drawType = value;
	}

	get drawType(): number {
		return this._drawType;
	}

	setDrawArrayParams(first: number, count: number):void {
		this.drawParams.add(first);
		this.drawParams.add(count);
		
	}

	setDrawElemenParams(count: number, offset: number):void {
		this.drawParams.add(offset);
		this.drawParams.add(count);
	}

	set instanceCount(value: number) {
		this._instanceCount = value;
	}

	get instanceCount(): number {
		return this._instanceCount
	}

	set indexFormat(value: IndexFormat) {
		this._indexFormat = value;
	}

	get indexFormat(): IndexFormat {
		return this._indexFormat;
	}



	/**
	 * 获取是否销毁。
	 * @return 是否销毁。
	 */
	get destroyed(): boolean {
		return this._destroyed;
	}

	/**
	 * 创建一个 <code>GeometryElement</code> 实例。
	 */
	constructor(mode:MeshTopology,drawType:DrawType) {
		this._destroyed = false;
		this.mode = mode;
		this.drawParams = new SingletonList();
		this.drawType = drawType;
	}






	/**
	 * 获取几何体类型。
	 */
	_getType(): number {
		throw "GeometryElement:must override it.";
	}

	/**
	 * @internal
	 * @return  是否需要渲染。
	 */
	_prepareRender(state: RenderContext3D): boolean {
		return true;
	}

	/**
	 * @internal
	 */
	_render(state: RenderContext3D): void {
		// throw "GeometryElement:must override it.";
		LayaGL.renderDrawConatext.drawGeometryElement(this);
	}

	/**
	 * @internal
	 */
	 _updateRenderParams(state: RenderContext3D): void {
		throw "GeometryElement:must override it.";
	}

	/**
	 * 销毁。
	 */
	destroy(): void {
		if (this._destroyed)
			return;
		this._destroyed = true;
	}

	clearRenderParams() {
		this.drawParams.length = 0;
	}
}

