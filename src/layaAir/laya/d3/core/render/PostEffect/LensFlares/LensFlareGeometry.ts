import { BufferUsage } from "../../../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../../../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../../../../renders/VertexElement";
import { VertexElementFormat } from "../../../../../renders/VertexElementFormat";
import { BufferState } from "../../../../../webgl/utils/BufferState";
import { Laya3DRender } from "../../../../RenderObjs/Laya3DRender";
import { IndexBuffer3D } from "../../../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../../../graphics/VertexBuffer3D";
import { GeometryElement } from "../../../GeometryElement";
import { RenderContext3D } from "../../RenderContext3D";

export class LensFlareElementGeomtry extends GeometryElement {
    static PositionUV: number = 0;
    static PositionRotationScale: number = 1;
    /**@internal */
    static lensQuadVertices: Float32Array;
    /**@internal */
    static lensQuadIndex: Uint16Array;
    /**@internal */
    static vertexDeclaration: VertexDeclaration;
    /**@internal */
    static instanceVertexDeclaration: VertexDeclaration;
    /**@internal 最大instanceData*/
    static lensFlareElementMax: number = 20;
    /**@internal */
    private _vertexBuffer: VertexBuffer3D;
    /**@internal */
    private _instanceVertexBuffer: VertexBuffer3D;
    /**@internal */
    private _indexBuffer: IndexBuffer3D;
    /**@internal */
    private static _type: number = GeometryElement._typeCounter++;

    /**
     * initData
     */
    static init() {
        let quadSize = 0.1;
        LensFlareElementGeomtry.lensQuadVertices = new Float32Array([
            quadSize, quadSize, 1, 1,
            -quadSize, quadSize, 0, 1,
            -quadSize, -quadSize, 0, 0,
            quadSize, -quadSize, 1, 0]);
        LensFlareElementGeomtry.lensQuadIndex = new Uint16Array([0, 2, 1, 0, 3, 2]);
        //xy:position zw:uv
        LensFlareElementGeomtry.vertexDeclaration = new VertexDeclaration(16, [new VertexElement(0, VertexElementFormat.Vector4, 0)]);
        //x:startPosition  y:angular zw:scale
        LensFlareElementGeomtry.instanceVertexDeclaration = new VertexDeclaration(16, [new VertexElement(0, VertexElementFormat.Vector4, 1)])
    }

    /**
     * instance LensFlaresGeometry
     */
    constructor() {
        super(MeshTopology.Triangles, DrawType.DrawElementInstance);
        this.indexFormat = IndexFormat.UInt16;
        this._createBuffer();
    }

    /**
     * @internal
     */
    private _createBuffer() {
        //VB
        this._vertexBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(LensFlareElementGeomtry.lensQuadVertices.length * 4, BufferUsage.Dynamic, false);
        this._vertexBuffer.vertexDeclaration = LensFlareElementGeomtry.vertexDeclaration;
        this._vertexBuffer.setData(LensFlareElementGeomtry.lensQuadVertices.buffer);
        //instanceVB
        this._instanceVertexBuffer = Laya3DRender.renderOBJCreate.createVertexBuffer3D(LensFlareElementGeomtry.lensFlareElementMax * 4 * 4, BufferUsage.Dynamic, false);
        this._instanceVertexBuffer.instanceBuffer = true;
        this._instanceVertexBuffer.vertexDeclaration = LensFlareElementGeomtry.instanceVertexDeclaration;
        //IB
        this._indexBuffer = Laya3DRender.renderOBJCreate.createIndexBuffer3D(IndexFormat.UInt16, LensFlareElementGeomtry.lensQuadIndex.length, BufferUsage.Static, false);
        this._indexBuffer.setData(LensFlareElementGeomtry.lensQuadIndex);
        //VAO
        this.bufferState = new BufferState();
        this.bufferState.applyState([this._vertexBuffer, this._instanceVertexBuffer], this._indexBuffer);
    }

    /**
     * @internal
     */
    get instanceBuffer() {
        return this._instanceVertexBuffer;
    }

    /**
     *	{@inheritDoc PixelLineFilter._getType}
     *	@override
     *  @internal
     */
    _getType(): number {
        return LensFlareElementGeomtry._type;
    }

    /**
     * @internal
     * @return  是否需要渲染。
     */
    _prepareRender(state: RenderContext3D): boolean {
        return true;
    }

    /**
     * 销毁。
     */
    destroy(): void {
        super.destroy();
        this._vertexBuffer.destroy();
        this._instanceVertexBuffer.destroy();
        this.bufferState.destroy();
        this._indexBuffer.destroy();
    }

    /**
    * @internal
    * UpdateGeometry Data
    */
    _updateRenderParams(state: RenderContext3D): void {
        this.clearRenderParams();
        this.setDrawElemenParams(LensFlareElementGeomtry.lensQuadIndex.length, 0);
    }
}
