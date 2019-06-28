import { LayaGL } from "../../../layagl/LayaGL";
import { Resource } from "../../../resource/Resource";
import { Stat } from "../../../utils/Stat";
import { WebGLContext } from "../../../webgl/WebGLContext";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { Color } from "../../math/Color";
import { MathUtils3D } from "../../math/MathUtils3D";
import { Vector3 } from "../../math/Vector3";
import { BufferState } from "../BufferState";
import { Camera } from "../Camera";
import { GeometryElement } from "../GeometryElement";
import { Gradient } from "../Gradient";
import { RenderContext3D } from "../render/RenderContext3D";
import { TextureMode } from "../TextureMode";
import { TrailFilter } from "./TrailFilter";
import { VertexTrail } from "./VertexTrail";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { TrailAlignment } from "./TrailAlignment";
import { Bounds } from "../Bounds";

/**
 * <code>TrailGeometry</code> 类用于创建拖尾渲染单元。
 */
export class TrailGeometry extends GeometryElement {
	/** 轨迹准线_面向摄像机。*/
	static ALIGNMENT_VIEW: number = 0;
	/** 轨迹准线_面向运动方向。*/
	static ALIGNMENT_TRANSFORM_Z: number = 1;

	/**@internal */
	private static _tempVector30: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector31: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector32: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector33: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector34: Vector3 = new Vector3();

	/**@internal */
	private static _tempVector35: Vector3 = new Vector3();
	/**@internal */
	private static _tempVector36: Vector3 = new Vector3();

	/**@internal */
	private static _type: number = GeometryElement._typeCounter++;

	/**@internal */
	private _floatCountPerVertices1: number = 8;
	/**@internal */
	private _floatCountPerVertices2: number = 5;
	/**@internal */
	private _increaseSegementCount: number = 16;
	/**@internal */
	private _activeIndex: number = 0;
	/**@internal */
	private _endIndex: number = 0;
	/**@internal */
	private _needAddFirstVertex: boolean = false;
	/**@internal */
	private _isTempEndVertex: boolean = false;
	/**@internal */
	private _subBirthTime: Float32Array;
	/**@internal */
	private _subDistance: Float64Array;
	/**@internal */
	private _segementCount: number;
	/**@internal */
	private _vertices1: Float32Array = null;
	/**@internal */
	private _vertices2: Float32Array = null;
	/**@internal */
	private _vertexBuffer1: VertexBuffer3D;
	/**@internal */
	private _vertexBuffer2: VertexBuffer3D;
	/**@internal */
	private _lastFixedVertexPosition: Vector3 = new Vector3();
	/**@internal */
	private _owner: TrailFilter;
	/** @internal */
	private _bufferState: BufferState = new BufferState();

	private tmpColor: Color = new Color();
	/** @private */
	private _isHaveDisappear:Boolean = false;

	constructor(owner: TrailFilter) {
		super();
		this._owner = owner;
		//初始化_segementCount
		this._segementCount = this._increaseSegementCount;

		this._resizeData(this._segementCount, this._bufferState);
		TrailGeometry._tempVector35.x = Number.MAX_VALUE;
		TrailGeometry._tempVector35.y = Number.MAX_VALUE;
		TrailGeometry._tempVector35.z = Number.MAX_VALUE;
			
		TrailGeometry._tempVector36.x = -Number.MAX_VALUE;
		TrailGeometry._tempVector36.y = -Number.MAX_VALUE;
		TrailGeometry._tempVector36.z = -Number.MAX_VALUE;

		var bounds:Bounds = this._owner._owner.trailRenderer.bounds;
		bounds.setMin(TrailGeometry._tempVector35);
		bounds.setMax(TrailGeometry._tempVector36);
	}

	/**
	 * @internal
	 */
	private _resizeData(segementCount: number, bufferState: BufferState): void {
		this._subBirthTime = new Float32Array(segementCount);
		this._subDistance = new Float64Array(segementCount);

		var vertexCount: number = segementCount * 2;
		var vertexDeclaration1: VertexDeclaration = VertexTrail.vertexDeclaration1;
		var vertexDeclaration2: VertexDeclaration = VertexTrail.vertexDeclaration2;
		var vertexBuffers: VertexBuffer3D[] = [];
		var vertexbuffer1Size: number = vertexCount * vertexDeclaration1.vertexStride;
		var vertexbuffer2Size: number = vertexCount * vertexDeclaration2.vertexStride;
		var memorySize: number = vertexbuffer1Size + vertexbuffer2Size;
		this._vertices1 = new Float32Array(vertexCount * this._floatCountPerVertices1);
		this._vertices2 = new Float32Array(vertexCount * this._floatCountPerVertices2);
		this._vertexBuffer1 = new VertexBuffer3D(vertexbuffer1Size, WebGLContext.STATIC_DRAW, false);
		this._vertexBuffer1.vertexDeclaration = vertexDeclaration1;
		this._vertexBuffer2 = new VertexBuffer3D(vertexbuffer2Size, WebGLContext.DYNAMIC_DRAW, false);
		this._vertexBuffer2.vertexDeclaration = vertexDeclaration2;

		vertexBuffers.push(this._vertexBuffer1);
		vertexBuffers.push(this._vertexBuffer2);
		bufferState.bind();
		bufferState.applyVertexBuffers(vertexBuffers);
		bufferState.unBind();

		Resource._addMemory(memorySize, memorySize);
	}

	/**
	 * @internal
	 */
	private _resetData(): void {
		var count: number = this._endIndex - this._activeIndex;
		//提前取出旧数据，否则_resizeData会覆盖
		var oldVertices1: Float32Array = new Float32Array(this._vertices1.buffer, this._floatCountPerVertices1 * 2 * this._activeIndex * 4, this._floatCountPerVertices1 * 2 * count);
		var oldVertices2: Float32Array = new Float32Array(this._vertices2.buffer, this._floatCountPerVertices2 * 2 * this._activeIndex * 4, this._floatCountPerVertices2 * 2 * count);
		var oldSubDistance: Float64Array = new Float64Array(this._subDistance.buffer, this._activeIndex * 8, count);//修改距离数据
		var oldSubBirthTime: Float32Array = new Float32Array(this._subBirthTime.buffer, this._activeIndex * 4, count);//修改出生时间数据

		if (count === this._segementCount) {//当前count=_segementCount表示已满,需要扩充
			this._vertexBuffer1.destroy();
			this._vertexBuffer2.destroy();
			this._segementCount += this._increaseSegementCount;
			this._resizeData(this._segementCount, this._bufferState);
		}

		this._vertices1.set(oldVertices1, 0);
		this._vertices2.set(oldVertices2, 0);
		this._subDistance.set(oldSubDistance, 0);
		this._subBirthTime.set(oldSubBirthTime, 0);

		this._endIndex = count;
		this._activeIndex = 0;
		this._vertexBuffer1.setData(this._vertices1, 0, this._floatCountPerVertices1 * 2 * this._activeIndex, this._floatCountPerVertices1 * 2 * count);
		this._vertexBuffer2.setData(this._vertices2, 0, this._floatCountPerVertices2 * 2 * this._activeIndex, this._floatCountPerVertices2 * 2 * count);
	}

	/**
	 * @internal
	 * 更新Trail数据
	 */
	_updateTrail(camera: Camera, lastPosition: Vector3, position: Vector3): void {
		if (!Vector3.equals(lastPosition, position)) {//位置不变不产生分段
			if ((this._endIndex - this._activeIndex) === 0)
				this._addTrailByFirstPosition(camera, position);//当前分段全部消失时,需要添加一个首分段
			else
				this._addTrailByNextPosition(camera, position);
		}
	}

	/**
	 * @internal
	 * 通过起始位置添加TrailRenderElement起始数据
	 */
	private _addTrailByFirstPosition(camera: Camera, position: Vector3): void {
		(this._endIndex === this._segementCount) && (this._resetData());
		this._subDistance[this._endIndex] = 0;
		this._subBirthTime[this._endIndex] = this._owner._curtime;
		this._endIndex++;
		position.cloneTo(this._lastFixedVertexPosition);
		this._needAddFirstVertex = true;
	}

	/**
	 * @internal
	 * 通过位置更新TrailRenderElement数据
	 */
	private _addTrailByNextPosition(camera: Camera, position: Vector3): void {
		var cameraMatrix: Matrix4x4 = camera.viewMatrix;
		Vector3.transformCoordinate(position, cameraMatrix, TrailGeometry._tempVector33);
		var delVector3: Vector3 = TrailGeometry._tempVector30;
		var pointAtoBVector3: Vector3 = TrailGeometry._tempVector31;
		Vector3.transformCoordinate(this._lastFixedVertexPosition, cameraMatrix, TrailGeometry._tempVector34);
		Vector3.subtract(TrailGeometry._tempVector33, TrailGeometry._tempVector34, delVector3);

		this._owner.alignment = TrailAlignment.View;
		switch (this._owner.alignment) {
			case TrailAlignment.View:
				Vector3.cross(TrailGeometry._tempVector33, delVector3, pointAtoBVector3);
				break;
			case TrailAlignment.TransformZ:
				var forward: Vector3 = TrailGeometry._tempVector32;
				this._owner._owner.transform.getForward(forward);
				Vector3.cross(delVector3, forward, pointAtoBVector3);//实时更新模式需要和view一样根据当前forward重新计算
				break;
		}

		Vector3.normalize(pointAtoBVector3, pointAtoBVector3);
		Vector3.scale(pointAtoBVector3, this._owner.widthMultiplier / 2, pointAtoBVector3);

		var delLength: number = Vector3.scalarLength(delVector3);
		var tempEndIndex: number;
		var offset: number;

		if (this._needAddFirstVertex) {
			this._updateVerticesByPositionData(position, pointAtoBVector3, this._endIndex - 1);//延迟更新首分段数据
			this._needAddFirstVertex = false;
		}

		if (delLength - this._owner.minVertexDistance >= MathUtils3D.zeroTolerance) {//大于最小距离产生新分段
			if (this._isTempEndVertex) {
				tempEndIndex = this._endIndex - 1;
				offset = delLength - this._subDistance[tempEndIndex];
				this._updateVerticesByPosition(position, pointAtoBVector3, delLength, tempEndIndex);
				this._owner._totalLength += offset;//不产生新分段要通过差值更新总距离
			} else {
				(this._endIndex === this._segementCount) && (this._resetData());
				this._updateVerticesByPosition(position, pointAtoBVector3, delLength, this._endIndex);
				this._owner._totalLength += delLength;
				this._endIndex++;
			}
			position.cloneTo(this._lastFixedVertexPosition);
			this._isTempEndVertex = false;
		} else {
			if (this._isTempEndVertex) {
				tempEndIndex = this._endIndex - 1;
				offset = delLength - this._subDistance[tempEndIndex];
				this._updateVerticesByPosition(position, pointAtoBVector3, delLength, tempEndIndex);
				this._owner._totalLength += offset;//不产生新分段要通过差值更新总距离
			} else {
				(this._endIndex === this._segementCount) && (this._resetData());
				this._updateVerticesByPosition(position, pointAtoBVector3, delLength, this._endIndex);
				this._owner._totalLength += delLength;
				this._endIndex++;
			}
			this._isTempEndVertex = true;
		}
	}

	/**
	 * @internal
	 * 通过位置更新顶点数据
	 */
	private _updateVerticesByPositionData(position: Vector3, pointAtoBVector3: Vector3, index: number): void {

		var vertexOffset: number = this._floatCountPerVertices1 * 2 * index;
		var curtime: number = this._owner._curtime;
		this._vertices1[vertexOffset] = position.x;
		this._vertices1[vertexOffset + 1] = position.y;
		this._vertices1[vertexOffset + 2] = position.z;
		this._vertices1[vertexOffset + 3] = -pointAtoBVector3.x;
		this._vertices1[vertexOffset + 4] = -pointAtoBVector3.y;
		this._vertices1[vertexOffset + 5] = -pointAtoBVector3.z;
		this._vertices1[vertexOffset + 6] = curtime;
		this._vertices1[vertexOffset + 7] = 1.0;

		this._vertices1[vertexOffset + 8] = position.x;
		this._vertices1[vertexOffset + 9] = position.y;
		this._vertices1[vertexOffset + 10] = position.z;
		this._vertices1[vertexOffset + 11] = pointAtoBVector3.x;
		this._vertices1[vertexOffset + 12] = pointAtoBVector3.y;
		this._vertices1[vertexOffset + 13] = pointAtoBVector3.z;
		this._vertices1[vertexOffset + 14] = curtime;
		this._vertices1[vertexOffset + 15] = 0.0;

		//添加新的顶点时，需要更新包围盒
		var bounds:Bounds = this._owner._owner.trailRenderer.bounds;
		var max:Vector3 = bounds.getMax();
		var min:Vector3 = bounds.getMin();
		Vector3.add(position, pointAtoBVector3, TrailGeometry._tempVector35);
		Vector3.subtract(position, pointAtoBVector3, TrailGeometry._tempVector36);
			
		Vector3.min(TrailGeometry._tempVector36, TrailGeometry._tempVector35, TrailGeometry._tempVector32);
		Vector3.min(min, TrailGeometry._tempVector32, TrailGeometry._tempVector32);
		bounds.setMin(TrailGeometry._tempVector32);
			
		Vector3.max(TrailGeometry._tempVector35, TrailGeometry._tempVector36, TrailGeometry._tempVector32);
		Vector3.max(max, TrailGeometry._tempVector32, TrailGeometry._tempVector32);
		bounds.setMax(TrailGeometry._tempVector32);

		var floatCount: number = this._floatCountPerVertices1 * 2;
		this._vertexBuffer1.setData(this._vertices1, vertexOffset, vertexOffset, floatCount);
			
	}

	/**
	 * @internal
	 * 通过位置更新顶点数据、距离、出生时间
	 */
	private _updateVerticesByPosition(position: Vector3, pointAtoBVector3: Vector3, delDistance: number, index: number): void {
		this._updateVerticesByPositionData(position, pointAtoBVector3, index);
		this._subDistance[index] = delDistance;
		this._subBirthTime[index] = this._owner._curtime;
	}

	/**
	 * @internal
	 * 更新VertexBuffer2数据
	 */
	_updateVertexBufferUV(): void {
		var bounds:Bounds;
		if (this._isHaveDisappear){//如果有顶点消失时候，需要重新计算包围盒
			bounds = this._owner._owner.trailRenderer.bounds;
			TrailGeometry._tempVector30.x = Number.MAX_VALUE;//min
			TrailGeometry._tempVector30.y = Number.MAX_VALUE;
			TrailGeometry._tempVector30.z = Number.MAX_VALUE;
			TrailGeometry._tempVector31.x = -Number.MAX_VALUE;//max
			TrailGeometry._tempVector31.y = -Number.MAX_VALUE;
			TrailGeometry._tempVector31.z = -Number.MAX_VALUE;
		}
		var vertexCount: number = this._endIndex;
		var curLength: number = 0;

		var gradient: Gradient = this._owner.colorGradient;
		var startAlphaIndex: number = gradient.colorAlphaKeysCount - 1;
		var startColorIndex: number = gradient.colorRGBKeysCount - 1;

		var totalLength: number = this._owner._totalLength;
		for (var i: number = this._activeIndex; i < vertexCount; i++) {
			(i !== this._activeIndex) && (curLength += this._subDistance[i]);
			var uvX: number;
			var lerpFactor: number;
			if (this._owner.textureMode == TextureMode.Stretch) {
				uvX = 1.0 - curLength / totalLength;
				lerpFactor = uvX;
			} else {
				lerpFactor = 1.0 - curLength / totalLength;
				uvX = 1.0 - (totalLength - curLength);
			}

			startColorIndex = gradient.evaluateColorRGB(lerpFactor, this.tmpColor, startColorIndex, true);
			startAlphaIndex = gradient.evaluateColorAlpha(lerpFactor, this.tmpColor, startAlphaIndex, true);

			var stride: number = this._floatCountPerVertices2 * 2;
			var index: number = i * stride;
			this._vertices2[index + 0] = uvX;
			this._vertices2[index + 1] = this.tmpColor.r;
			this._vertices2[index + 2] = this.tmpColor.g;
			this._vertices2[index + 3] = this.tmpColor.b;
			this._vertices2[index + 4] = this.tmpColor.a;

			this._vertices2[index + 5] = uvX;
			this._vertices2[index + 6] = this.tmpColor.r;
			this._vertices2[index + 7] = this.tmpColor.g;
			this._vertices2[index + 8] = this.tmpColor.b;
			this._vertices2[index + 9] = this.tmpColor.a;

			if(this._isHaveDisappear){
				var stride2 = this._floatCountPerVertices1 * 2;
				var offset2 = stride2 * i;
				TrailGeometry._tempVector32.x = this._vertices1[offset2 + 0];
				TrailGeometry._tempVector32.y = this._vertices1[offset2 + 1];
				TrailGeometry._tempVector32.z = this._vertices1[offset2 + 2];
				TrailGeometry._tempVector33.x = this._vertices1[offset2 + 3];
				TrailGeometry._tempVector33.y = this._vertices1[offset2 + 4];
				TrailGeometry._tempVector33.z = this._vertices1[offset2 + 5];

				Vector3.add(TrailGeometry._tempVector32, TrailGeometry._tempVector33, TrailGeometry._tempVector34);
				Vector3.min(TrailGeometry._tempVector34, TrailGeometry._tempVector30, TrailGeometry._tempVector30);	
				Vector3.max(TrailGeometry._tempVector34, TrailGeometry._tempVector31, TrailGeometry._tempVector31);
				Vector3.subtract(TrailGeometry._tempVector32, TrailGeometry._tempVector33, TrailGeometry._tempVector34);
				Vector3.min(TrailGeometry._tempVector34, TrailGeometry._tempVector30,TrailGeometry. _tempVector30);
				Vector3.max(TrailGeometry._tempVector34, TrailGeometry._tempVector31, TrailGeometry._tempVector31);
			}
		}
		if(this._isHaveDisappear){
			bounds.setMin(TrailGeometry._tempVector30);
			bounds.setMax(TrailGeometry._tempVector31);
			this._isHaveDisappear = false;
		}
		var offset: number = this._activeIndex * stride;
		this._vertexBuffer2.setData(this._vertices2, offset, offset, vertexCount * stride - offset);
	}

	/**
	 * @internal
	 */
	_updateDisappear(): void {
		var count: number = this._endIndex;
		for (var i: number = this._activeIndex; i < count; i++) {
			if (this._owner._curtime - this._subBirthTime[i] >= this._owner.time + MathUtils3D.zeroTolerance) {
				var nextIndex: number = i + 1;
				if (nextIndex !== count)
					this._owner._totalLength -= this._subDistance[nextIndex];//移除分段要减去下一分段到当前分段的距离

				if (this._isTempEndVertex && (nextIndex === count - 1)) {//如果只剩最后一分段要将其转化为固定分段
					var offset: number = this._floatCountPerVertices1 * i * 2;
					var fixedPos: Vector3 = this._lastFixedVertexPosition;
					fixedPos.x = this._vertices1[0];
					fixedPos.y = this._vertices1[1];
					fixedPos.z = this._vertices1[2];
					this._isTempEndVertex = false;
				}
				this._activeIndex++;
				this._isHaveDisappear = true;
			} else {
				break;
			}
		}
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _getType(): number {
		return TrailGeometry._type;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _prepareRender(state: RenderContext3D): boolean {
		return this._endIndex - this._activeIndex > 1;//当前分段为0或1时不渲染
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _render(state: RenderContext3D): void {
		this._bufferState.bind();
		var start: number = this._activeIndex * 2;
		var count: number = this._endIndex * 2 - start;
		LayaGL.instance.drawArrays(WebGLContext.TRIANGLE_STRIP, start, count);
		Stat.renderBatches++;
		Stat.trianglesFaces += count - 2;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  destroy(): void {
		super.destroy();
		var memorySize: number = this._vertexBuffer1._byteLength + this._vertexBuffer2._byteLength;
		Resource._addMemory(-memorySize, -memorySize);

		this._bufferState.destroy();
		this._vertexBuffer1.destroy();
		this._vertexBuffer2.destroy();

		this._bufferState = null;
		this._vertices1 = null;
		this._vertexBuffer1 = null;
		this._vertices2 = null;
		this._vertexBuffer2 = null;
		this._subBirthTime = null;
		this._subDistance = null;
		this._lastFixedVertexPosition = null;
		this._isHaveDisappear = false;
	}

}

