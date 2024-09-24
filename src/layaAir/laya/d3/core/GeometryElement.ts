import { RenderContext3D } from "./render/RenderContext3D"
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { BufferState } from "../../webgl/utils/BufferState";
import { Laya3DRender } from "../RenderObjs/Laya3DRender";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { LayaGL } from "../../layagl/LayaGL";

/**
 * @en The `GeometryElement` class is used to implement geometric elements. This class is abstract.
 * @zh `GeometryElement` 类用于实现几何体元素，该类为抽象类。
 */
export class GeometryElement {
	/** @internal */
	private static _uniqueIDCounter: number = 0;
	protected _owner: any;
	static _typeCounter: number = 0;
	/**@internal */
	protected _destroyed: boolean;
	_geometryElementOBj: IRenderGeometryElement;
	/** @internal */
	_id: number;
	protected _bufferState:BufferState;
    /**
     * @en VAO (Vertex Array Object) instance
     * @zh VAO (顶点数组对象) 实例
     */
	set bufferState(value: BufferState) {
		this._geometryElementOBj.bufferState = value._deviceBufferState;
		this._bufferState = value;
	}

	get bufferState(): BufferState {
		return this._bufferState;
	}

    /**
     * @en Mesh topology type
     * @zh 网格拓扑类型
     */
	set mode(value: MeshTopology) {
		this._geometryElementOBj.mode = value;
	}

	get mode(): MeshTopology {
		return this._geometryElementOBj.mode;
	}

    /**
     * @en Draw type
     * @zh 绘制类型
     */
	set drawType(value: number) {
		this._geometryElementOBj.drawType = value;
	}

	get drawType(): number {
		return this._geometryElementOBj.drawType;
	}

    /**
     * @en Set parameters for drawing arrays
     * @param first The starting index in the array
     * @param count The number of indices to be rendered
     * @zh 设置绘制数组的参数。
	 * @param first 数组起始索引。
	 * @param count 要渲染的索引数量。
     */
	setDrawArrayParams(first: number, count: number): void {
		this._geometryElementOBj.setDrawArrayParams(first, count);

	}

    /**
     * @en Set parameters for drawing elements
     * @param count The number of elements to be rendered
     * @param offset The starting offset in the element array
	 * @zh 设置绘制元素的参数。
	 * @param count 要渲染的元素数量。
	 * @param offset 元素数组的起始偏移。
     */
	setDrawElemenParams(count: number, offset: number): void {
		this._geometryElementOBj.setDrawElemenParams(count, offset);
	}

    /**
     * @en Number of instances to draw
     * @zh 要绘制的实例数量
     */
	set instanceCount(value: number) {
		this._geometryElementOBj.instanceCount = value;
	}

	get instanceCount(): number {
		return this._geometryElementOBj.instanceCount;
	}

    /**
     * @en Index buffer format
     * @zh 索引缓冲区格式
     */
	set indexFormat(value: IndexFormat) {
		this._geometryElementOBj.indexFormat = value;
	}

	get indexFormat(): IndexFormat {
		return this._geometryElementOBj.indexFormat;
	}



    /**
     * @en Get whether the object is destroyed
     * @zh 获取是否已销毁
     */
	get destroyed(): boolean {
		return this._destroyed;
	}

	/**
	 * @ignore
	 * @en Creates an instance of GeometryElement.
	 * @param mode The topology used by the mesh.
 	 * @param drawType The draw type used for rendering.
	 * @zh 创建一个 GeometryElement 的实例。
	 * @param mode 网格使用的拓扑结构。
	 * @param drawType 用于渲染的绘制类型。
	 */
	constructor(mode: MeshTopology, drawType: DrawType) {
		this._destroyed = false;
		this._geometryElementOBj = LayaGL.renderDeviceFactory.createRenderGeometryElement(mode, drawType);
		this._id = ++GeometryElement._uniqueIDCounter;
	}

    /**
     * @en Get the geometry type
     * @zh 获取几何体类型
     */
	_getType(): number {
		throw "GeometryElement:must override it.";
	}

    /**
     * @internal
     * @en Whether rendering is needed
     * @param state The render context
     * @returns Whether rendering is needed
     * @zh 是否需要渲染。
	 * @param state 渲染上下文。
	 * @return 是否需要渲染。
     */
	_prepareRender(state: RenderContext3D): boolean {
		return true;
	}

    /**
     * @internal
     * @en Update geometry data
     * @param state The render context
     * @zh 更新几何体数据
	 * @param state 渲染上下文。
     */
	_updateRenderParams(state: RenderContext3D): void {
		throw "GeometryElement:must override it.";
	}

    /**
     * @en Destroy the object
     * @zh 销毁对象
     */
	destroy(): void {
		if (this._destroyed)
			return;
		this._destroyed = true;
		this._geometryElementOBj.destroy();
	}

    /**
     * @en Clear render parameters
     * @zh 清除渲染参数
     */
	clearRenderParams() {
		this._geometryElementOBj.clearRenderParams();
	}
}

