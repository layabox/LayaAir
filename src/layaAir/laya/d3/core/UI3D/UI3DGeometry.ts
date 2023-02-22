import { LayaGL } from "../../../layagl/LayaGL";
import { Vector2 } from "../../../maths/Vector2";
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
import { Utils3D } from "../../utils/Utils3D";
import { GeometryElement } from "../GeometryElement";
import { RenderContext3D } from "../render/RenderContext3D";
import { UI3D } from "./UI3D";

export class UI3DGeometry extends GeometryElement {
    private static tempV0: Vector3 = new Vector3();

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

    /**@internal */
    constructor(owner: UI3D) {
        super(MeshTopology.Triangles, DrawType.DrawElement);
        this._owner = owner;
        //初始化_segementCount
        this.bufferState = new BufferState();
        this._bound = new Bounds();
        this._createBuffer();
        this.indexFormat = IndexFormat.UInt16;
        this._positionArray = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
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
        var halfWidth: number = 1 / 2 * 100;
        this._vertex = new Float32Array([-halfLong, halfWidth, 0, 0, 0, 1, 0, 0,
            halfLong, halfWidth, 0, 0, 0, 1, 1, 0,
        -halfLong, -halfWidth, 0, 0, 0, 1, 0, 1,
            halfLong, -halfWidth, 0, 0, 0, 1, 1, 1]);
        this._index = new Uint16Array([0, 1, 2, 3, 2, 1]);
        //VB
        this._vertexBuffer = LayaGL.renderOBJCreate.createVertexBuffer3D(this._vertex.length * 4, BufferUsage.Dynamic, false);
        this._vertexBuffer.vertexDeclaration = vertexDeclaration;
        this._vertexBuffer.setData(this._vertex.buffer);
        //IB
        this._indexBuffer = LayaGL.renderOBJCreate.createIndexBuffer3D(IndexFormat.UInt16, this._index.length, BufferUsage.Static, false);
        this._indexBuffer.setData(this._index);
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
    _resizeVertexData(size: Vector2, offset: Vector2, cameraDir: Vector3, cameraUp: Vector3, viewMode: boolean,worldPos:Vector3): void {
        var halfwidth = size.x / 2;
        var halfhight = size.y / 2;
        if (viewMode) {
            UI3DGeometry.tempV0.set(-halfwidth + offset.x, halfhight + offset.y, 0.0);
            Utils3D.billboardTrans(UI3DGeometry.tempV0, cameraDir, cameraUp, this._positionArray[0]);
            UI3DGeometry.tempV0.set(halfwidth + offset.x, halfhight + offset.y, 0.0);
            Utils3D.billboardTrans(UI3DGeometry.tempV0, cameraDir, cameraUp, this._positionArray[1]);
            UI3DGeometry.tempV0.set(-halfwidth + offset.x, -halfhight + offset.y, 0.0);
            Utils3D.billboardTrans(UI3DGeometry.tempV0, cameraDir, cameraUp, this._positionArray[2]);
            UI3DGeometry.tempV0.set(halfwidth + offset.x, -halfhight + offset.y, 0.0);
            Utils3D.billboardTrans(UI3DGeometry.tempV0, cameraDir, cameraUp, this._positionArray[3]);
            this._vertex[3] = this._vertex[11] = this._vertex[19] = this._vertex[27] = -cameraDir.x;
            this._vertex[4] = this._vertex[12] = this._vertex[20] = this._vertex[28] = -cameraDir.y;
            this._vertex[5] = this._vertex[13] = this._vertex[21] = this._vertex[29] = -cameraDir.z;
        } else {
            this._positionArray[0].set(-halfwidth + offset.x, halfhight + offset.y, 0.0);
            this._positionArray[1].set(halfwidth + offset.x, halfhight + offset.y, 0.0);
            this._positionArray[2].set(-halfwidth + offset.x, -halfhight + offset.y, 0.0);
            this._positionArray[3].set(halfwidth + offset.x, -halfhight + offset.y, 0.0);
        }
        Vector3.add(this._positionArray[0],worldPos,this._positionArray[0]);
        Vector3.add(this._positionArray[1],worldPos,this._positionArray[1]);
        Vector3.add(this._positionArray[2],worldPos,this._positionArray[2]);
        Vector3.add(this._positionArray[3],worldPos,this._positionArray[3]);
        this._vertex[0] = this._positionArray[0].x;
        this._vertex[1] = this._positionArray[0].y;
        this._vertex[2] = this._positionArray[0].z;
        this._vertex[8] = this._positionArray[1].x;
        this._vertex[9] = this._positionArray[1].y;
        this._vertex[10] = this._positionArray[1].z;
        this._vertex[16] = this._positionArray[2].x;
        this._vertex[17] = this._positionArray[2].y;
        this._vertex[18] = this._positionArray[2].z;
        this._vertex[24] = this._positionArray[3].x;
        this._vertex[25] = this._positionArray[3].y;
        this._vertex[26] = this._positionArray[3].z;
        this._vertexBuffer.setData(this._vertex.buffer, 0, 0, this._vertex.length * 4);
        this._bound.setExtent(new Vector3(size.x / 2, size.y / 2, size.x / 2));
        this._bound.setCenter(new Vector3(offset.x+worldPos.x, offset.y+worldPos.y, 0));
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