import { SkyMesh } from "./SkyMesh";
import { BufferState } from "../../core/BufferState";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexPositionTexture0 } from "../../graphics/Vertex/VertexPositionTexture0";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
/**
 * <code>SkyDome</code> 类用于创建天空盒。
 */
export class SkyDome extends SkyMesh {
    /**
     * 创建一个 <code>SkyDome</code> 实例。
     * @param stacks 堆数。
     * @param slices 层数。
     */
    constructor(stacks = 48, slices = 48) {
        super();
        this._stacks = stacks;
        this._slices = slices;
        var vertexDeclaration = VertexPositionTexture0.vertexDeclaration;
        var vertexFloatCount = vertexDeclaration.vertexStride / 4;
        var numberVertices = (this._stacks + 1) * (this._slices + 1);
        var numberIndices = (3 * this._stacks * (this._slices + 1)) * 2;
        var vertices = new Float32Array(numberVertices * vertexFloatCount);
        var indices = new Uint16Array(numberIndices);
        var stackAngle = Math.PI / this._stacks;
        var sliceAngle = (Math.PI * 2.0) / this._slices;
        // Generate the group of Stacks for the sphere  
        var vertexIndex = 0;
        var vertexCount = 0;
        var indexCount = 0;
        for (var stack = 0; stack < (this._stacks + 1); stack++) {
            var r = Math.sin(stack * stackAngle);
            var y = Math.cos(stack * stackAngle);
            // Generate the group of segments for the current Stack  
            for (var slice = 0; slice < (this._slices + 1); slice++) {
                var x = r * Math.sin(slice * sliceAngle);
                var z = r * Math.cos(slice * sliceAngle);
                vertices[vertexCount + 0] = x * SkyDome._radius;
                vertices[vertexCount + 1] = y * SkyDome._radius;
                vertices[vertexCount + 2] = z * SkyDome._radius;
                vertices[vertexCount + 3] = -(slice / this._slices) + 0.75; //gzk 改成我喜欢的坐标系 原来是 slice/_slices
                vertices[vertexCount + 4] = stack / this._stacks;
                vertexCount += vertexFloatCount;
                if (stack != (this._stacks - 1)) {
                    // First Face
                    indices[indexCount++] = vertexIndex + 1;
                    indices[indexCount++] = vertexIndex;
                    indices[indexCount++] = vertexIndex + (this._slices + 1);
                    // Second 
                    indices[indexCount++] = vertexIndex + (this._slices + 1);
                    indices[indexCount++] = vertexIndex;
                    indices[indexCount++] = vertexIndex + (this._slices);
                    vertexIndex++;
                }
            }
        }
        this._vertexBuffer = new VertexBuffer3D(vertices.length * 4, WebGL2RenderingContext.STATIC_DRAW, false);
        this._vertexBuffer.vertexDeclaration = vertexDeclaration;
        this._indexBuffer = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, indices.length, WebGL2RenderingContext.STATIC_DRAW, false);
        this._vertexBuffer.setData(vertices.buffer);
        this._indexBuffer.setData(indices);
        var bufferState = new BufferState();
        bufferState.bind();
        bufferState.applyVertexBuffer(this._vertexBuffer);
        bufferState.applyIndexBuffer(this._indexBuffer);
        bufferState.unBind();
        this._bufferState = bufferState;
    }
    /**
     * @internal
     */
    static __init__() {
        SkyDome.instance = new SkyDome(); //TODO:移植为标准Mesh后需要加锁
    }
    /**
     * 获取堆数。
     */
    get stacks() {
        return this._stacks;
    }
    /**
     * 获取层数。
     */
    get slices() {
        return this._slices;
    }
    /*override*/ _render(state) {
        var indexCount = this._indexBuffer.indexCount;
        LayaGL.instance.drawElements(WebGL2RenderingContext.TRIANGLES, indexCount, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        Stat.trianglesFaces += indexCount / 3;
        Stat.renderBatches++;
    }
}
/**@internal */
SkyDome._radius = 1;
