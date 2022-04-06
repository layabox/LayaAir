import { RenderContext3D } from "./render/RenderContext3D"
import { IDestroy } from "../../resource/IDestroy"
import { IRenderGeometryElement } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { BufferState } from "./BufferState";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { LayaGL } from "../../layagl/LayaGL";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { RenderGeometryElementOBJ } from "../../RenderEngine/RenderObj/RenderGeometryElementOBJ";

/**
 * <code>GeometryElement</code> 类用于实现几何体元素,该类为抽象类。
 */
export class GeometryElement implements IDestroy{
	protected _owner:any;
	/**@internal */
	protected static _typeCounter: number = 0;
	/**@internal */
	protected _destroyed: boolean;
	_geometryElementOBj:IRenderGeometryElement;

	

	/**
	 * VAO OBJ
	 */
	set bufferState(value: BufferState) {
		this._geometryElementOBj.bufferState = value;
	}

	get bufferState(): BufferState {
		return this._geometryElementOBj.bufferState;
	}

	/**
	 * mesh topology type
	 */
	set mode(value: MeshTopology) {
		this._geometryElementOBj.mode = value;
	}

	get mode(): MeshTopology {
		return this._geometryElementOBj.mode;
	}

	/**
	 * draw Type
	 */
	set drawType(value: number) {
		this._geometryElementOBj.drawType = value;
	}

	get drawType(): number {
		return this._geometryElementOBj.drawType;
	}

	setDrawArrayParams(first: number, count: number):void {
		this._geometryElementOBj.setDrawArrayParams(first,count);
		
	}

	setDrawElemenParams(count: number, offset: number):void {
		this._geometryElementOBj.setDrawElemenParams(count,offset);
		
	}

	set instanceCount(value: number) {
		this._geometryElementOBj.instanceCount = value;
	}

	get instanceCount(): number {
		return this._geometryElementOBj.instanceCount;
	}

	set indexFormat(value: IndexFormat) {
		this._geometryElementOBj.indexFormat = value;
	}

	get indexFormat(): IndexFormat {
		return this._geometryElementOBj.indexFormat;
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
		this._geometryElementOBj = new RenderGeometryElementOBJ(mode,drawType);
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
		LayaGL.renderDrawConatext.drawGeometryElement(this._geometryElementOBj);
	}

	/**
	 * @internal
	 * UpdateGeometry Data
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
		this._geometryElementOBj.clearRenderParams();
	}
}

