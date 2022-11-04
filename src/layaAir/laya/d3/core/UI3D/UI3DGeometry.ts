import { LayaGL } from "../../../layagl/LayaGL";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { Bounds } from "../../math/Bounds";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { BufferState } from "../BufferState";
import { GeometryElement } from "../GeometryElement";
import { RenderContext3D } from "../render/RenderContext3D";
import { UI3D } from "./UI3D";

export class UI3DGeometry extends GeometryElement {
    /**@internal */
    private static _type: number = GeometryElement._typeCounter++;

    private _vertexBuffer: VertexBuffer3D;
    private _vertex: Float32Array;
    private _indexBuffer: IndexBuffer3D;
    private _index: Uint16Array;
    private _scale: Vector2;
    private _offset: Vector2;
    private _bound: Bounds;
    constructor(owner: UI3D) {
        super(MeshTopology.TriangleStrip, DrawType.DrawArray);
        this._owner = owner;
        //初始化_segementCount
        this.bufferState = new BufferState();
        this._createBuffer();
        this._scale = new Vector2(1, 1);
        this._offset = new Vector2(0, 0);
        this._bound = new Bounds();
    }

    /**
     * @internal
     */
    set scale(value: Vector2) {
        value && value.cloneTo(this._scale);
        this._resizeVertexData();
    }

    /**
     *  @internal
     */
    get scale(): Vector2 {
        return this._scale;
    }

    /**
     * @internal
     */
    set offset(value: Vector2) {
        value && value.cloneTo(this._offset);
        this._resizeVertexData();
    }

    /**
     *  @internal
     */
    get offset(): Vector2 {
        return this._offset;
    }

    /**@internal */
    get bounds() {
        return this._bound;
    }

    /**
     * @internal
     */
    private _createBuffer() {
        var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
        var halfLong: number = 1 / 2;
        var halfWidth: number = 1 / 2;
        this._vertex = new Float32Array([-halfLong, halfWidth, 0, 0, 0, 1, 0, 0, halfLong, halfWidth, 0, 0, 0, 1, 1, 0, -halfLong, -halfWidth, 0, 0, 0, 1, 0, 1, halfLong, -halfWidth, 0, 0, 0, 1, 1, 1]);
        this._index = new Uint16Array([0, 1, 2, 3, 2, 1]);
        //VB
        this._vertexBuffer = LayaGL.renderOBJCreate.createVertexBuffer3D(this._vertex.length * 4, BufferUsage.Dynamic, false);
        this._vertexBuffer.vertexDeclaration = vertexDeclaration;
        this._vertexBuffer.setData(this._vertex.buffer);
        //IB
        var indexBuffer: IndexBuffer3D = LayaGL.renderOBJCreate.createIndexBuffer3D(IndexFormat.UInt16, this._index.length, BufferUsage.Static, false);
        indexBuffer.setData(this._index);
        //VAO
        this.bufferState = new BufferState();
        this.bufferState.applyState([this._vertexBuffer], this._indexBuffer);
        this._bound.setExtent(new Vector3(0.5, 0.5, 0.05));
        this._bound.setCenter(new Vector3(0, 0, 0));
    }

    /**
     * @internal
     * reset vertex data
     */
    private _resizeVertexData(): void {
        var halfLong = this._scale.x / 2 + this._offset.x;
        var halfWidth = this._scale.y / 2 + this._offset.y;
        this._vertex[0] = -halfLong;
        this._vertex[1] = halfWidth;
        this._vertex[8] = halfLong;
        this._vertex[9] = halfWidth;
        this._vertex[16] = -halfLong;
        this._vertex[17] = -halfWidth;
        this._vertex[24] = halfLong;
        this._vertex[25] = -halfWidth;
        this._vertexBuffer.setData(this._vertex.buffer, 0, 0, this._vertex.length * 4);
        this._bound.setExtent(new Vector3(this._scale.x / 2, this._scale.y / 2, 0.05));
        this._bound.setCenter(new Vector3(this._offset.x, this._offset.y, 0));
    }

    /**
     * @inheritDoc
     * @internal
     * @override
     */
    _updateRenderParams(state: RenderContext3D): void {
        //this._bufferState.bind();
        this.clearRenderParams();
        var count: number = 6;
        this.setDrawArrayParams(0, count);
        // LayaGL.renderDrawConatext.drawArrays(MeshTopology.TriangleStrip,start,count);
        // Stat.trianglesFaces += count - 2;
    }
    /**
     * @inheritDoc
     * @override
     */
    destroy() {
        super.destroy();
        this.bufferState.destroy();
        this._vertexBuffer.destroy();
        this._indexBuffer.destroy();
        this.bufferState = null;
        this._vertexBuffer = null;
        this._indexBuffer = null;
        delete this._vertex;
        delete this._index;
    }
}