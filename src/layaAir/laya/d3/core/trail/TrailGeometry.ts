import { Color } from "../../../maths/Color";
import { MathUtils3D } from "../../../maths/MathUtils3D";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { Resource } from "../../../resource/Resource";
import { BufferState } from "../../../webgl/utils/BufferState";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { Bounds } from "../../math/Bounds";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { Camera } from "../Camera";
import { GeometryElement } from "../GeometryElement";
import { Gradient } from "../Gradient";
import { RenderContext3D } from "../render/RenderContext3D";
import { Sprite3D } from "../Sprite3D";
import { TrailTextureMode } from "../TrailTextureMode";
import { TrailAlignment } from "./TrailAlignment";
import { TrailFilter } from "./TrailFilter";
import { VertexTrail } from "./VertexTrail";

/**
 * @en The `TrailGeometry` class is used to create trail rendering elements.
 * @zh `TrailGeometry` 类用于创建拖尾渲染单元。
 */
export class TrailGeometry extends GeometryElement {
	/**
	 * @en Alignment of the trail ti j wq e o face the camera.
	 * @zh 轨迹准线_面向摄像机。
	 */
	static ALIGNMENT_VIEW: number = 0;
	/**
	 * @en Alignment of the trail to face the direction of movement.
	 * @zh 轨迹准线_面向运动方向。
	 */
	static ALIGNMENT_TRANSFORM_Z: number = 1;

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
	protected _owner: TrailFilter;

	/** @private */
	private _disappearBoundsMode: Boolean = false;

	constructor(owner: TrailFilter) {
		super(MeshTopology.TriangleStrip, DrawType.DrawArray);
		this._owner = owner;
		//初始化_segementCount
		this.bufferState = new BufferState();
		this._segementCount = this._increaseSegementCount;

		this._resizeData(this._segementCount, this.bufferState);
		// var bounds: Bounds = this._owner._owner.trailRenderer.bounds;
		// var sprite3dPosition: Vector3 = this._owner._owner.transform.position;
		// bounds.setMin(sprite3dPosition);
		// bounds.setMax(sprite3dPosition);
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
		this._vertexBuffer1 = Laya3DRender.renderOBJCreate.createVertexBuffer3D(vertexbuffer1Size, BufferUsage.Dynamic, false);
		this._vertexBuffer1.vertexDeclaration = vertexDeclaration1;
		this._vertexBuffer2 = Laya3DRender.renderOBJCreate.createVertexBuffer3D(vertexbuffer2Size, BufferUsage.Dynamic, false);
		this._vertexBuffer2.vertexDeclaration = vertexDeclaration2;

		vertexBuffers.push(this._vertexBuffer1);
		vertexBuffers.push(this._vertexBuffer2);
		// bufferState.bind();
		// bufferState.applyVertexBuffers(vertexBuffers);
		// bufferState.unBind();
		bufferState.applyState(vertexBuffers, null);
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
			var memorySize: number = this._vertexBuffer1._byteLength + this._vertexBuffer2._byteLength;
			Resource._addMemory(-memorySize, -memorySize);
			this._vertexBuffer1.destroy();
			this._vertexBuffer2.destroy();
			this._segementCount += this._increaseSegementCount;
			this._resizeData(this._segementCount, this.bufferState);
		}

		this._vertices1.set(oldVertices1, 0);
		this._vertices2.set(oldVertices2, 0);
		this._subDistance.set(oldSubDistance, 0);
		this._subBirthTime.set(oldSubBirthTime, 0);

		this._endIndex = count;
		this._activeIndex = 0;
		this._vertexBuffer1.setData(this._vertices1.buffer, 0, this._floatCountPerVertices1 * 2 * this._activeIndex * 4, this._floatCountPerVertices1 * 2 * count * 4);
		this._vertexBuffer2.setData(this._vertices2.buffer, 0, this._floatCountPerVertices2 * 2 * this._activeIndex * 4, this._floatCountPerVertices2 * 2 * count * 4);
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
		var delVector3: Vector3 = _tempVector30;
		var pointAtoBVector3: Vector3 = _tempVector31;
		switch (this._owner.alignment) {
			case TrailAlignment.View:
				var cameraMatrix: Matrix4x4 = camera.viewMatrix;
				Vector3.transformCoordinate(position, cameraMatrix, _tempVector33);
				Vector3.transformCoordinate(this._lastFixedVertexPosition, cameraMatrix, _tempVector34);
				Vector3.subtract(_tempVector33, _tempVector34, delVector3);
				Vector3.cross(_tempVector33, delVector3, pointAtoBVector3);
				break;
			case TrailAlignment.TransformZ:
				Vector3.subtract(position, this._lastFixedVertexPosition, delVector3);
				var forward: Vector3 = _tempVector32;
				(this._owner._ownerRender.owner as Sprite3D).transform.getForward(forward);
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
		var bounds: Bounds = this._owner._ownerRender.bounds;
		var min: Vector3 = bounds.getMin();
		var max: Vector3 = bounds.getMax();
		var up: Vector3 = _tempVector35;
		var down: Vector3 = _tempVector36;
		var out: Vector3 = _tempVector32;
		Vector3.add(position, pointAtoBVector3, up);
		Vector3.subtract(position, pointAtoBVector3, down);

		Vector3.min(down, up, out);
		Vector3.min(min, out, min);
		bounds.setMin(min);

		Vector3.max(up, down, out);
		Vector3.max(max, out, max);
		bounds.setMax(max);


		var floatCount: number = this._floatCountPerVertices1 * 2;
		this._vertexBuffer1.setData(this._vertices1.buffer, vertexOffset * 4, vertexOffset * 4, floatCount * 4);
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
		var bounds: Bounds;
		var min: Vector3, max: Vector3;
		if (this._disappearBoundsMode) {//如果有顶点消失时候，需要重新计算包围盒
			bounds = this._owner._ownerRender.bounds;
			var sprite3dPosition: Vector3 = (this._owner._ownerRender.owner as Sprite3D).transform.position;
			bounds.setMin(sprite3dPosition);
			bounds.setMax(sprite3dPosition);
			min = bounds.getMin();
			max = bounds.getMax();
		}
		var vertexCount: number = this._endIndex;
		var curLength: number = 0;

		var gradient: Gradient = this._owner.colorGradient;
		var startAlphaIndex: number = gradient.colorAlphaKeysCount - 1;
		var startColorIndex: number = gradient.colorRGBKeysCount - 1;

		var totalLength: number = this._owner._totalLength;
		var stride: number = this._floatCountPerVertices2 * 2;
		for (var i: number = this._activeIndex; i < vertexCount; i++) {
			(i !== this._activeIndex) && (curLength += this._subDistance[i]);
			var uvX: number;
			var lerpFactor: number;
			if (this._owner.textureMode == TrailTextureMode.Stretch) {
				uvX = 1.0 - curLength / totalLength;
				lerpFactor = uvX;
			} else {
				lerpFactor = 1.0 - curLength / totalLength;
				uvX = 1.0 - (totalLength - curLength);
			}

			startColorIndex = gradient.evaluateColorRGB(lerpFactor, tmpColor, startColorIndex, true);
			startAlphaIndex = gradient.evaluateColorAlpha(lerpFactor, tmpColor, startAlphaIndex, true);

			var index: number = i * stride;
			this._vertices2[index + 0] = uvX;
			this._vertices2[index + 1] = tmpColor.r;
			this._vertices2[index + 2] = tmpColor.g;
			this._vertices2[index + 3] = tmpColor.b;
			this._vertices2[index + 4] = tmpColor.a;

			this._vertices2[index + 5] = uvX;
			this._vertices2[index + 6] = tmpColor.r;
			this._vertices2[index + 7] = tmpColor.g;
			this._vertices2[index + 8] = tmpColor.b;
			this._vertices2[index + 9] = tmpColor.a;

			if (this._disappearBoundsMode) {
				var posOffset = this._floatCountPerVertices1 * 2 * i;
				var pos: Vector3 = _tempVector32;
				var up: Vector3 = _tempVector33;
				var side: Vector3 = _tempVector34;

				pos.setValue(this._vertices1[posOffset + 0], this._vertices1[posOffset + 1], this._vertices1[posOffset + 2]);
				up.setValue(this._vertices1[posOffset + 3], this._vertices1[posOffset + 4], this._vertices1[posOffset + 5]);

				Vector3.add(pos, up, side);
				Vector3.min(side, min, min);
				Vector3.max(side, max, max);
				Vector3.subtract(pos, up, side);
				Vector3.min(side, min, min);
				Vector3.max(side, max, max);
			}
		}
		if (this._disappearBoundsMode) {
			bounds.setMin(min);
			bounds.setMax(max);
			this._disappearBoundsMode = false;
		}
		var offset: number = this._activeIndex * stride;
		this._vertexBuffer2.setData(this._vertices2.buffer, offset * 4, offset * 4, (vertexCount * stride - offset) * 4);
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
					var fixedPos: Vector3 = this._lastFixedVertexPosition;
					fixedPos.x = this._vertices1[0];
					fixedPos.y = this._vertices1[1];
					fixedPos.z = this._vertices1[2];
					this._isTempEndVertex = false;
				}
				this._activeIndex++;
				this._disappearBoundsMode = true;
			} else {
				break;
			}
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Get the type.
	 * @zh 获取类型。
	 */
	_getType(): number {
		return TrailGeometry._type;
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_prepareRender(state: RenderContext3D): boolean {
		return this._endIndex - this._activeIndex > 1;//当前分段为0或1时不渲染
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_updateRenderParams(state: RenderContext3D): void {
		this.clearRenderParams();
		var start: number = this._activeIndex * 2;
		var count: number = this._endIndex * 2 - start;
		this.setDrawArrayParams(start, count);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Destroys the instance and releases resources.
	 * @zh 销毁实例并释放资源。
	 */
	destroy(): void {
		super.destroy();
		var memorySize: number = this._vertexBuffer1._byteLength + this._vertexBuffer2._byteLength;
		Resource._addMemory(-memorySize, -memorySize);
		this.bufferState.destroy();
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
		this._disappearBoundsMode = false;
	}

	/**
	 * @en Clear.
	 * @zh 清除。
	 */
	clear(): void {
		this._activeIndex = 0;
		this._endIndex = 0;
		this._disappearBoundsMode = false;
		this._subBirthTime.fill(0);
		this._subDistance.fill(0);
		this._segementCount = 0;
		this._isTempEndVertex = false;
		this._needAddFirstVertex = false;
		this._lastFixedVertexPosition.setValue(0, 0, 0);
	}
}

const _tempVector30: Vector3 = new Vector3();
const _tempVector31: Vector3 = new Vector3();
const _tempVector32: Vector3 = new Vector3();
const _tempVector33: Vector3 = new Vector3();
const _tempVector34: Vector3 = new Vector3();
const _tempVector35: Vector3 = new Vector3();
const _tempVector36: Vector3 = new Vector3();
const tmpColor: Color = new Color();