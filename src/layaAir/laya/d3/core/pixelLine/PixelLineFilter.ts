import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { BufferState } from "../../../webgl/utils/BufferState";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { Bounds } from "../../math/Bounds";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { GeometryElement } from "../GeometryElement";
import { RenderContext3D } from "../render/RenderContext3D";
import { PixelLineData } from "./PixelLineData";
import { PixelLineRenderer } from "./PixelLineRenderer";
import { PixelLineVertex } from "./PixelLineVertex";

/**
 * @en The `PixelLineFilter` class is used for line filtering.
 * @zh `PixelLineFilter` 类用于线过滤器。
 */
export class PixelLineFilter extends GeometryElement {
	/**@internal */
	private static _type: number = GeometryElement._typeCounter++;

	/** @internal */
	private _floatCountPerVertices: number = 10;


	/** @internal */
	private _vertexBuffer: VertexBuffer3D;
	/** @internal */
	private _vertices: Float32Array;
	/** @internal */
	private _minUpdate: number = Number.MAX_VALUE;
	/** @internal */
	private _maxUpdate: number = Number.MIN_VALUE;
	/** @internal */
	private _floatBound: Float32Array = new Float32Array(6);
	/** @internal */
	private _calculateBound: boolean = true;

	/** @internal */
	_ownerRender: PixelLineRenderer;
	/** @internal */
	_bounds: Bounds;
	/** @internal */
	_maxLineCount: number = 0;
	/** @internal */
	_lineCount: number = 0;

	/**
	 * @ignore
	 * @en initialize pixeLineFilter instance.
	 * @param owner The rendering sprite node.
	 * @param maxLineCount The maximum line count.
	 * @zh 初始化pixeLineFilter实例。
	 * @param owner 渲染精灵节点。
	 * @param maxLineCount 最大线段数量。
	 */
	constructor(owner: PixelLineRenderer, maxLineCount: number) {
		super(MeshTopology.Lines, DrawType.DrawArray);
		var pointCount: number = maxLineCount * 2;
		this._ownerRender = owner;
		this._maxLineCount = maxLineCount;
		this._vertices = new Float32Array(pointCount * this._floatCountPerVertices);
		this._vertexBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(PixelLineVertex.vertexDeclaration.vertexStride * pointCount, BufferUsage.Static, false);
		this._vertexBuffer.vertexDeclaration = PixelLineVertex.vertexDeclaration;

		var bufferState = new BufferState();
		this.bufferState = bufferState;
		this.bufferState.applyState([this._vertexBuffer], null);

		var min: Vector3 = _tempVector0;
		var max: Vector3 = _tempVector1;
		min.setValue(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
		max.setValue(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
		this._bounds = new Bounds(min, max);
	}

	/**
	 *	{@inheritDoc PixelLineFilter._getType}
	 *	@override
	 *  @internal
	 */
	_getType(): number {
		return PixelLineFilter._type;
	}

	/**
	 * @internal
	 */
	_resizeLineData(maxCount: number): void {
		var pointCount: number = maxCount * 2;
		var lastVertices: Float32Array = this._vertices;

		this._vertexBuffer.destroy();
		this._maxLineCount = maxCount;

		var vertexCount: number = pointCount * this._floatCountPerVertices;
		this._vertices = new Float32Array(vertexCount);
		this._vertexBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(PixelLineVertex.vertexDeclaration.vertexStride * pointCount, BufferUsage.Static, false);
		this._vertexBuffer.vertexDeclaration = PixelLineVertex.vertexDeclaration;

		if (vertexCount < lastVertices.length) {//取最小长度,拷贝旧数据
			this._vertices.set(new Float32Array(lastVertices.buffer, 0, vertexCount));
			this._vertexBuffer.setData(this._vertices.buffer, 0, 0, vertexCount * 4);
		} else {
			this._vertices.set(lastVertices);
			this._vertexBuffer.setData(this._vertices.buffer, 0, 0, lastVertices.length * 4);
		}

		this.bufferState.applyState([this._vertexBuffer], null);

		this._minUpdate = Number.MAX_VALUE;
		this._maxUpdate = Number.MIN_VALUE;
	}

	/**
	 * @internal
	 */
	private _updateLineVertices(offset: number, startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color, startNormal: Vector3 = null, endNormal: Vector3 = null): void {
		if (startPosition) {
			this._vertices[offset + 0] = startPosition.x;
			this._vertices[offset + 1] = startPosition.y;
			this._vertices[offset + 2] = startPosition.z;
		}

		if (startColor) {
			this._vertices[offset + 3] = startColor.r;
			this._vertices[offset + 4] = startColor.g;
			this._vertices[offset + 5] = startColor.b;
			this._vertices[offset + 6] = startColor.a;
		}

		if (startNormal) {
			this._vertices[offset + 7] = startNormal.x;
			this._vertices[offset + 8] = startNormal.y;
			this._vertices[offset + 9] = startNormal.z;
		}

		if (endPosition) {
			this._vertices[offset + 10] = endPosition.x;
			this._vertices[offset + 11] = endPosition.y;
			this._vertices[offset + 12] = endPosition.z;
		}

		if (endColor) {
			this._vertices[offset + 13] = endColor.r;
			this._vertices[offset + 14] = endColor.g;
			this._vertices[offset + 15] = endColor.b;
			this._vertices[offset + 16] = endColor.a;
		}

		if (endNormal) {
			this._vertices[offset + 17] = endNormal.x;
			this._vertices[offset + 18] = endNormal.y;
			this._vertices[offset + 19] = endNormal.z;
		}

		this._minUpdate = Math.min(this._minUpdate, offset);
		this._maxUpdate = Math.max(this._maxUpdate, offset + this._floatCountPerVertices * 2);

		//expand bound
		var bounds: Bounds = this._bounds;
		var floatBound: Float32Array = this._floatBound;
		var min: Vector3 = bounds.getMin(), max: Vector3 = bounds.getMax();
		Vector3.min(min, startPosition, min);
		Vector3.min(min, endPosition, min);
		Vector3.max(max, startPosition, max);
		Vector3.max(max, endPosition, max);
		bounds.setMin(min);
		bounds.setMax(max);
		floatBound[0] = min.x, floatBound[1] = min.y, floatBound[2] = min.z;
		floatBound[3] = max.x, floatBound[4] = max.y, floatBound[5] = max.z;
		this._ownerRender.boundsChange = true;
	}


	/**
	 * @internal
	 */
	_reCalculateBound(): void {
		if (this._calculateBound) {
			var vertices: Float32Array = this._vertices;
			var min: Vector3 = _tempVector0;
			var max: Vector3 = _tempVector1;
			min.setValue(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
			max.setValue(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
			for (var i: number = 0; i < this._lineCount * 2; ++i) {
				var offset: number = this._floatCountPerVertices * i;
				var x: number = vertices[offset + 0], y: number = vertices[offset + 1], z: number = vertices[offset + 2];
				min.x = Math.min(x, min.x);
				min.y = Math.min(y, min.y);
				min.z = Math.min(z, min.z);
				max.x = Math.max(x, max.x);
				max.y = Math.max(y, max.y);
				max.z = Math.max(z, max.z);
			}
			this._bounds.setMin(min);
			this._bounds.setMax(max);
			var floatBound: Float32Array = this._floatBound;
			floatBound[0] = min.x, floatBound[1] = min.y, floatBound[2] = min.z;
			floatBound[3] = max.x, floatBound[4] = max.y, floatBound[5] = max.z;
			this._calculateBound = false;
		}
	}

	/**
	 * @internal
	 */
	_removeLineData(index: number): void {
		var floatCount: number = this._floatCountPerVertices * 2;
		var nextIndex: number = index + 1;
		var offset: number = index * floatCount;

		var vertices: Float32Array = this._vertices;
		var rightPartVertices: Float32Array = new Float32Array(vertices.buffer, nextIndex * floatCount * 4, (this._lineCount - nextIndex) * floatCount);
		vertices.set(rightPartVertices, offset);
		this._minUpdate = Math.min(this._minUpdate, offset);
		this._maxUpdate = Math.max(this._maxUpdate, offset + rightPartVertices.length);
		this._lineCount--;

		var floatBound: Float32Array = this._floatBound;
		var startX: number = vertices[offset], startY: number = vertices[offset + 1], startZ: number = vertices[offset + 2];
		var endX: number = vertices[offset + 7], endY: number = vertices[offset + 8], endZ: number = vertices[offset + 9];
		var minX: number = floatBound[0], minY: number = floatBound[1], minZ: number = floatBound[2];
		var maxX: number = floatBound[3], maxY: number = floatBound[4], maxZ: number = floatBound[5];

		if ((startX === minX) || (startX === maxX) || (startY === minY) || (startY === maxY) || (startZ === minZ) || (startZ === maxZ) ||
			(endX === minX) || (endX === maxX) || (endY === minY) || (endY === maxY) || (endZ === minZ) || (endZ === maxZ))
			this._calculateBound = true;
	}

	/**
	 * @internal
	 */
	_updateLineData(index: number, startPosition: Vector3, endPosition: Vector3, startColor: Color, endColor: Color, startNormal: Vector3 = null, endNormal: Vector3 = null): void {
		var floatCount: number = this._floatCountPerVertices * 2;
		this._updateLineVertices(index * floatCount, startPosition, endPosition, startColor, endColor, startNormal, endNormal);
		this._calculateBound = true;
	}

	/**
	 * @internal
	 */
	_updateLineDatas(index: number, data: PixelLineData[]): void {
		var floatCount: number = this._floatCountPerVertices * 2;
		var count: number = data.length;
		for (var i: number = 0; i < count; i++) {
			var line: PixelLineData = data[i];
			this._updateLineVertices((index + i) * floatCount, line.startPosition, line.endPosition, line.startColor, line.endColor, line.startNormal, line.endNormal);
		}
		this._calculateBound = data.length > 0;
	}


	/**
	 * @en Get the line segment data.
	 * @param index The index of the line segment.
	 * @param out The output PixelLineData object.
	 * @zh 获取线段数据。
	 * @param index 线段的索引。
	 * @param out 输出的PixelLineData对象。
	 */
	_getLineData(index: number, out: PixelLineData): void {
		var startPosition: Vector3 = out.startPosition;
		var startColor: Color = out.startColor;
		var endPosition: Vector3 = out.endPosition;
		var endColor: Color = out.endColor;

		var startNormal: Vector3 = out.startNormal;
		var endNormal: Vector3 = out.endNormal;

		var vertices: Float32Array = this._vertices;
		var offset: number = index * this._floatCountPerVertices * 2;

		startPosition.x = vertices[offset + 0];
		startPosition.y = vertices[offset + 1];
		startPosition.z = vertices[offset + 2];
		startColor.r = vertices[offset + 3];
		startColor.g = vertices[offset + 4];
		startColor.b = vertices[offset + 5];
		startColor.a = vertices[offset + 6];
		startNormal.x = vertices[offset + 7];
		startNormal.y = vertices[offset + 8];
		startNormal.z = vertices[offset + 9];

		endPosition.x = vertices[offset + 10];
		endPosition.y = vertices[offset + 11];
		endPosition.z = vertices[offset + 12];
		endColor.r = vertices[offset + 13];
		endColor.g = vertices[offset + 14];
		endColor.b = vertices[offset + 15];
		endColor.a = vertices[offset + 16];
		endNormal.x = vertices[offset + 17];
		endNormal.y = vertices[offset + 18];
		endNormal.z = vertices[offset + 19];
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_prepareRender(state: RenderContext3D): boolean {
		return true;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_updateRenderParams(state: RenderContext3D): void {
		this.clearRenderParams();
		if (this._minUpdate !== Number.MAX_VALUE && this._maxUpdate !== Number.MIN_VALUE) {
			this._vertexBuffer.setData(this._vertices.buffer, this._minUpdate * 4, this._minUpdate * 4, (this._maxUpdate - this._minUpdate) * 4);
			this._minUpdate = Number.MAX_VALUE;
			this._maxUpdate = Number.MIN_VALUE;
		}
		if (this._lineCount > 0) {
			this.setDrawArrayParams(0, this._lineCount * 2);
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Destroy the PixelLineFilter instance.
	 * @zh 销毁PixelLineFilter实例。
	 */
	destroy(): void {
		if (this._destroyed)
			return;
		super.destroy();
		this.bufferState.destroy();
		this._vertexBuffer.destroy();
		this._bufferState = null;
		this._vertexBuffer = null;
		this._vertices = null;
	}
}

const _tempVector0: Vector3 = new Vector3();
const _tempVector1: Vector3 = new Vector3();