import { Vector3 } from "../../../maths/Vector3";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { BufferState } from "../../../webgl/utils/BufferState";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { Bounds } from "../../math/Bounds";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { GeometryElement } from "../GeometryElement";
import { RenderContext3D } from "../render/RenderContext3D";
import { UI3D } from "./UI3D";

/**
 * @en UI3DGeometry class is used to create and manage the geometry structure of 3D UI elements.
 * @zh UI3DGeometry 类用于创建和管理 3D UI元素的几何结构的类。
 */
export class UI3DGeometry extends GeometryElement {
    /**@internal */
    private static _type: number = GeometryElement._typeCounter++;
    /* @internal 顶点buffer*/
    private _vertexBuffer: VertexBuffer3D;
    /* @internal 顶点数据*/
    private _vertex: Float32Array;
    /**@internal indexbuffer */
    private _indexBuffer: IndexBuffer3D;
    /**@internal index数据 */
    private _index: Uint16Array;
    /**@internal */
    private _bound: Bounds;
    /**@internal */
    _positionArray: Vector3[];

    /**
     * @internal
     * @en Constructor method.
     * @zh 构造方法。
     */
    constructor(owner: UI3D) {
        super(MeshTopology.Triangles, DrawType.DrawElement);
        this._owner = owner;
        //初始化_segementCount
        this.bufferState = new BufferState();
        this._bound = new Bounds();
        this._createBuffer();
        this.indexFormat = IndexFormat.UInt16;
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
        this._vertex = new Float32Array([-halfLong, halfWidth, 0, 0, 0, 1, 0, 0,
            halfLong, halfWidth, 0, 0, 0, 1, 1, 0,
        -halfLong, -halfWidth, 0, 0, 0, 1, 0, 1,
            halfLong, -halfWidth, 0, 0, 0, 1, 1, 1]);
        this._index = new Uint16Array([0, 1, 2, 3, 2, 1]);
        //VB
        this._vertexBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(this._vertex.length * 4, BufferUsage.Dynamic, false);
        this._vertexBuffer.vertexDeclaration = vertexDeclaration;
        this._vertexBuffer.setData(this._vertex.buffer);
        //IB
        this._indexBuffer = Laya3DRender.renderOBJCreate.createIndexBuffer3D(IndexFormat.UInt16, this._index.length, BufferUsage.Static, false);
        this._indexBuffer.setData(this._index);
        //VAO
        this.bufferState = new BufferState();
        this.bufferState.applyState([this._vertexBuffer], this._indexBuffer);
        this._bound.setExtent(new Vector3(halfLong, halfWidth, halfLong));
        this._bound.setCenter(new Vector3(0, 0, 0));
        this._positionArray = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
        this._positionArray[0].set(-halfWidth, halfLong, 0.0);
        this._positionArray[1].set(halfWidth, halfLong, 0.0);
        this._positionArray[2].set(-halfWidth, -halfLong, 0.0);
        this._positionArray[3].set(halfWidth, -halfLong, 0.0);
    }

    /**
     * @inheritDoc
     * @internal
     * @override
     */
    _updateRenderParams(state: RenderContext3D): void {
        this.clearRenderParams();
        this.setDrawElemenParams(6, 0);
    }

    /**
     * @inheritDoc
     * @override
     * @en Destroys the instance and releases resources.
     * @zh 销毁实例并释放资源。
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

const tempV0: Vector3 = new Vector3();