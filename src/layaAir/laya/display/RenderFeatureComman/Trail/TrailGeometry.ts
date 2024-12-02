import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Gradient } from "../../../maths/Gradient";
import { Vector3 } from "../../../maths/Vector3";
import { IBufferState } from "../../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IRenderGeometryElement } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { TrailTextureMode } from "./TrailTextureMode";
import { VertexTrail } from "./VertexTrail";


/**
 * @en The `TrailGeometry2` class is used to create trail rendering elements.
 * @zh `TrailGeometry2` 类用于创建拖尾渲染单元。
 */
export class TrailGeometry {
    /**
     * @en Tolerance for single-precision floating-point (float) zero.
     * @zh 单精度浮点(float)零的容差。
     */
    static zeroTolerance: number = 1e-6;

    /**@internal */
    static _tempVector33: Vector3 = new Vector3();
    /**@internal */
    static _tempVector34: Vector3 = new Vector3();
    /**@internal */
    static _tempVector35: Vector3 = new Vector3();
    /**@internal */
    static _tempVector36: Vector3 = new Vector3();

    /**@internal */
    _floatCountPerVertices1: number = 8;
    /**@internal */
    private _floatCountPerVertices2: number = 5;
    /**@internal */
    private _increaseSegementCount: number = 16;

    /**@internal */
    private _needAddFirstVertex: boolean = false;
    /**@internal */
    private _isTempEndVertex: boolean = false;
    /**@internal 顶点出生时间*/
    private _subBirthTime: Float32Array;
    /**@internal 顶点间隔距离*/
    private _subDistance: Float64Array;
    /**@internal */
    private _segementCount: number;
    /**@internal 缓存数据,可以用来计算包围盒 */
    _vertices1: Float32Array = null;
    /**@internal */
    private _vertices2: Float32Array = null;
    /**@internal */
    private _vertexBuffer1: IVertexBuffer;
    /**@internal */
    private _vertexBuffer2: IVertexBuffer;
    /**@internal 上个有效点位置*/
    _lastFixedVertexPosition: Vector3 = new Vector3();

    private tmpColor: Color = new Color();

    /**@internal 顶点开始位置*/
    _activeIndex: number = 0;
    /**@internal 顶点结束位置*/
    _endIndex: number = 0;
    /** @private 是否需要重新计算包围盒*/
    _disappearBoundsMode: Boolean = false;
    /**@internal */
    _geometryElementOBj: IRenderGeometryElement;
    /** @internal */
    _bufferState: IBufferState;

    constructor() {
        this._geometryElementOBj = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.TriangleStrip, DrawType.DrawArray);
        //初始化_segementCount
        this._bufferState = LayaGL.renderDeviceFactory.createBufferState();
        this._geometryElementOBj.bufferState = this._bufferState;
        this._segementCount = this._increaseSegementCount;

        this._resizeData(this._segementCount);
    }

    /**
     * @internal
     */
    private _resizeData(segementCount: number): void {
        this._subBirthTime = new Float32Array(segementCount);
        this._subDistance = new Float64Array(segementCount);

        var vertexCount: number = segementCount * 2;
        var vertexDeclaration1: VertexDeclaration = VertexTrail.vertexDeclaration1;
        var vertexDeclaration2: VertexDeclaration = VertexTrail.vertexDeclaration2;

        var vertexBuffers: IVertexBuffer[] = [];

        var vertexbuffer1Size: number = vertexCount * vertexDeclaration1.vertexStride;
        var vertexbuffer2Size: number = vertexCount * vertexDeclaration2.vertexStride;

        this._vertices1 = new Float32Array(vertexCount * this._floatCountPerVertices1);
        this._vertices2 = new Float32Array(vertexCount * this._floatCountPerVertices2);
        this._vertexBuffer1 = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        this._vertexBuffer1.vertexDeclaration = vertexDeclaration1;
        this._vertexBuffer1.setDataLength(vertexbuffer1Size);

        this._vertexBuffer2 = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        this._vertexBuffer2.vertexDeclaration = vertexDeclaration2;
        this._vertexBuffer2.setDataLength(vertexbuffer2Size);

        vertexBuffers.push(this._vertexBuffer1);
        vertexBuffers.push(this._vertexBuffer2);
        this._bufferState.applyState(vertexBuffers, null);
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
            this._resizeData(this._segementCount);
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

    // /**
    //  * @internal
    //  * 更新Trail数据
    //  */
    // _updateTrail(camera: Camera, lastPosition: Vector3, position: Vector3): void {
    //     if (!Vector3.equals(lastPosition, position)) {//位置不变不产生分段
    //         if ((this._endIndex - this._activeIndex) === 0)
    //             this._addTrailByFirstPosition(camera, position);//当前分段全部消失时,需要添加一个首分段
    //         else
    //             this._addTrailByNextPosition(camera, position);
    //     }
    // }

    /**
     * @internal
     * 通过起始位置添加TrailRenderElement起始数据
     */
    _addTrailByFirstPosition(position: Vector3, curtime: number): void {
        (this._endIndex === this._segementCount) && (this._resetData());
        this._subDistance[this._endIndex] = 0;
        this._subBirthTime[this._endIndex] = curtime;
        this._endIndex++;
        position.cloneTo(this._lastFixedVertexPosition);
        this._needAddFirstVertex = true;
    }

    /**
     * @internal
     * @param position 当前的位置 
     * @param curtime 当前时间
     * @param minVertexDistance 顶点最小距离
     * @param pointAtoBVector3 顶点扩张方向和长度
     * @param delLength 和上一个顶点的距离
     */
    _addTrailByNextPosition(position: Vector3, curtime: number, minVertexDistance: number, pointAtoBVector3: Vector3, delLength: number): void {
        // var delVector3: Vector3 = TrailGeometry2._tempVector30;
        // var pointAtoBVector3: Vector3 = TrailGeometry2._tempVector31;
        // switch (this._owner.alignment) {
        //     case TrailAlignment.View:
        //         var cameraMatrix: Matrix4x4 = camera.viewMatrix;
        //         Vector3.transformCoordinate(position, cameraMatrix, TrailGeometry2._tempVector33);
        //         Vector3.transformCoordinate(this._lastFixedVertexPosition, cameraMatrix, TrailGeometry2._tempVector34);
        //         Vector3.subtract(TrailGeometry2._tempVector33, TrailGeometry2._tempVector34, delVector3);
        //         Vector3.cross(TrailGeometry2._tempVector33, delVector3, pointAtoBVector3);
        //         break;
        //     case TrailAlignment.TransformZ:
        //         Vector3.subtract(position, this._lastFixedVertexPosition, delVector3);
        //         var forward: Vector3 = TrailGeometry2._tempVector32;
        //         (this._owner._ownerRender.owner as Sprite3D).transform.getForward(forward);
        //         Vector3.cross(delVector3, forward, pointAtoBVector3);//实时更新模式需要和view一样根据当前forward重新计算
        //         break;
        // }

        // Vector3.normalize(pointAtoBVector3, pointAtoBVector3);
        // Vector3.scale(pointAtoBVector3, this._owner.widthMultiplier / 2, pointAtoBVector3);

        //var delLength: number = Vector3.scalarLength(delVector3);
        var tempEndIndex: number;
        var offset: number;

        if (this._needAddFirstVertex) {
            this._updateVerticesByPositionData(position, pointAtoBVector3, this._endIndex - 1, curtime);//延迟更新首分段数据
            this._needAddFirstVertex = false;
        }

        if (delLength - minVertexDistance >= TrailGeometry.zeroTolerance) {//大于最小距离产生新分段
            if (this._isTempEndVertex) {
                tempEndIndex = this._endIndex - 1;
                offset = delLength - this._subDistance[tempEndIndex];
                this._updateVerticesByPosition(position, pointAtoBVector3, delLength, tempEndIndex, curtime);
                this._totalLength += offset;//不产生新分段要通过差值更新总距离
            } else {
                (this._endIndex === this._segementCount) && (this._resetData());
                this._updateVerticesByPosition(position, pointAtoBVector3, delLength, this._endIndex, curtime);
                this._totalLength += delLength;
                this._endIndex++;
            }
            position.cloneTo(this._lastFixedVertexPosition);
            this._isTempEndVertex = false;
        } else {
            if (this._isTempEndVertex) {
                tempEndIndex = this._endIndex - 1;
                offset = delLength - this._subDistance[tempEndIndex];
                this._updateVerticesByPosition(position, pointAtoBVector3, delLength, tempEndIndex, curtime);
                this._totalLength += offset;//不产生新分段要通过差值更新总距离
            } else {
                (this._endIndex === this._segementCount) && (this._resetData());
                this._updateVerticesByPosition(position, pointAtoBVector3, delLength, this._endIndex, curtime);
                this._totalLength += delLength;
                this._endIndex++;
            }
            this._isTempEndVertex = true;
        }
    }

    /**
     * @internal
     * 通过位置更新顶点数据
     */
    private _updateVerticesByPositionData(position: Vector3, pointAtoBVector3: Vector3, index: number, curtime: number): void {
        var vertexOffset: number = this._floatCountPerVertices1 * 2 * index;
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

        // //添加新的顶点时，需要更新包围盒
        // var bounds: Bounds = this._owner._ownerRender.bounds;
        // var min: Vector3 = bounds.getMin();
        // var max: Vector3 = bounds.getMax();
        // var up: Vector3 = TrailGeometry2._tempVector35;
        // var down: Vector3 = TrailGeometry2._tempVector36;
        // var out: Vector3 = TrailGeometry2._tempVector32;
        // Vector3.add(position, pointAtoBVector3, up);
        // Vector3.subtract(position, pointAtoBVector3, down);

        // Vector3.min(down, up, out);
        // Vector3.min(min, out, min);
        // bounds.setMin(min);

        // Vector3.max(up, down, out);
        // Vector3.max(max, out, max);
        // bounds.setMax(max);
        this._disappearBoundsMode = true;

        var floatCount: number = this._floatCountPerVertices1 * 2;
        this._vertexBuffer1.setData(this._vertices1.buffer, vertexOffset * 4, vertexOffset * 4, floatCount * 4);
    }

    /**
     * @internal
     * 通过位置更新顶点数据、距离、出生时间
     */
    private _updateVerticesByPosition(position: Vector3, pointAtoBVector3: Vector3, delDistance: number, index: number, curtime: number): void {
        this._updateVerticesByPositionData(position, pointAtoBVector3, index, curtime);
        this._subDistance[index] = delDistance;
        this._subBirthTime[index] = curtime;
    }

    /**
     * @internal
     * 更新VertexBuffer2数据
     */
    _updateVertexBufferUV(colorGradient: Gradient, textureMode: TrailTextureMode,): void {
        //var bounds: Bounds;
        //var min: Vector3, max: Vector3;
        // if (this._disappearBoundsMode) {//如果有顶点消失时候，需要重新计算包围盒
        //     bounds = this._owner._ownerRender.bounds;
        //     var sprite3dPosition: Vector3 = (this._owner._ownerRender.owner as Sprite3D).transform.position;
        //     bounds.setMin(sprite3dPosition);
        //     bounds.setMax(sprite3dPosition);
        //     min = bounds.getMin();
        //     max = bounds.getMax();
        // }
        var vertexCount: number = this._endIndex;
        var curLength: number = 0;

        var gradient: Gradient = colorGradient;
        var startAlphaIndex: number = gradient.colorAlphaKeysCount - 1;
        var startColorIndex: number = gradient.colorRGBKeysCount - 1;

        var totalLength: number = this._totalLength;
        var stride: number = this._floatCountPerVertices2 * 2;
        for (var i: number = this._activeIndex; i < vertexCount; i++) {
            (i !== this._activeIndex) && (curLength += this._subDistance[i]);
            var uvX: number;
            var lerpFactor: number;
            if (textureMode == TrailTextureMode.Stretch) {
                uvX = 1.0 - curLength / totalLength;
                lerpFactor = uvX;
            } else {
                lerpFactor = 1.0 - curLength / totalLength;
                uvX = 1.0 - (totalLength - curLength);
            }

            startColorIndex = gradient.evaluateColorRGB(lerpFactor, this.tmpColor, startColorIndex, true);
            startAlphaIndex = gradient.evaluateColorAlpha(lerpFactor, this.tmpColor, startAlphaIndex, true);

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

            // if (this._disappearBoundsMode) {
            //     var posOffset = this._floatCountPerVertices1 * 2 * i;
            //     var pos: Vector3 = TrailGeometry2._tempVector32;
            //     var up: Vector3 = TrailGeometry2._tempVector33;
            //     var side: Vector3 = TrailGeometry2._tempVector34;

            //     pos.setValue(this._vertices1[posOffset + 0], this._vertices1[posOffset + 1], this._vertices1[posOffset + 2]);
            //     up.setValue(this._vertices1[posOffset + 3], this._vertices1[posOffset + 4], this._vertices1[posOffset + 5]);

            //     Vector3.add(pos, up, side);
            //     Vector3.min(side, min, min);
            //     Vector3.max(side, max, max);
            //     Vector3.subtract(pos, up, side);
            //     Vector3.min(side, min, min);
            //     Vector3.max(side, max, max);
            // }
        }
        // if (this._disappearBoundsMode) {
        //     bounds.setMin(min);
        //     bounds.setMax(max);
        //     this._disappearBoundsMode = false;
        // }
        var offset: number = this._activeIndex * stride;
        this._vertexBuffer2.setData(this._vertices2.buffer, offset * 4, offset * 4, (vertexCount * stride - offset) * 4);
    }


    /**@internal 拖尾长度 */
    _totalLength: number = 0;

    /**
     * @internal
     */
    _updateDisappear(curtime: number, lifetime: number): void {
        var count: number = this._endIndex;
        for (var i: number = this._activeIndex; i < count; i++) {
            if (curtime - this._subBirthTime[i] >= lifetime + TrailGeometry.zeroTolerance) {
                var nextIndex: number = i + 1;
                if (nextIndex !== count)
                    this._totalLength -= this._subDistance[nextIndex];//移除分段要减去下一分段到当前分段的距离

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

    // /**
    //  * @inheritDoc
    //  * @internal
    //  * @override
    //  */
    // _prepareRender(): boolean {
    //     return this._endIndex - this._activeIndex > 1;//当前分段为0或1时不渲染
    // }

    /**
     * @inheritDoc
     * @internal
     * @override
     */
    _updateRenderParams(): void {
        this._geometryElementOBj.clearRenderParams();
        var start: number = this._activeIndex * 2;
        var count: number = this._endIndex * 2 - start;
        this._geometryElementOBj.setDrawArrayParams(start, count);
    }

    /**
     * @inheritDoc
     * @override
     * @en Destroys the instance and releases resources.
     * @zh 销毁实例并释放资源。
     */
    destroy(): void {
        this._geometryElementOBj.destroy();
        this._vertexBuffer1.destroy();
        this._vertexBuffer2.destroy();
        this._bufferState.destroy();

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

