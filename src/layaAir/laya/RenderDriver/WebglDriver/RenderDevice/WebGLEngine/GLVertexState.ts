import { VertexDeclaration } from "../../../../RenderEngine/VertexDeclaration";
import { WebGLEngine } from "../WebGLEngine";
import { WebGLIndexBuffer } from "../WebGLIndexBuffer";
import { WebGLVertexBuffer } from "../WebGLVertexBuffer";
import { WebGLExtension } from "./GLEnum/WebGLExtension";
import { GLObject } from "./GLObject";



export class GLVertexState extends GLObject{
    private _angleInstancedArrays: any;
    private _vaoExt: any | null;
    private _vao: WebGLVertexArrayObject | WebGLVertexArrayObjectOES;

    _vertexDeclaration: VertexDeclaration[] = [];
    _bindedIndexBuffer: WebGLIndexBuffer;
    _vertexBuffers: WebGLVertexBuffer[];

    constructor(engine: WebGLEngine) {
        super(engine);
        if (!engine.isWebGL2)
            this._vaoExt = engine._supportCapatable.getExtension(WebGLExtension.OES_vertex_array_object);
        this._vao = this.createVertexArray();
        this._angleInstancedArrays = this._engine._supportCapatable.getExtension(WebGLExtension.ANGLE_instanced_arrays);
    }

    /**
     * @internal
     */
    private createVertexArray(): any {
        if (this._engine.isWebGL2)
            return (<WebGL2RenderingContext>this._gl).createVertexArray();
        else
            return this._vaoExt.createVertexArrayOES();
    }

    /**
     * @internal
     */
    private deleteVertexArray(): void {
        if (this._engine.isWebGL2)
            (<WebGL2RenderingContext>this._gl).deleteVertexArray(this._vao);
        else
            this._vaoExt.deleteVertexArrayOES(this._vao);
    }

    /**
     * @internal
     */
    bindVertexArray(): void {
        if (this._engine._GLBindVertexArray == this)
            return;
        if (this._engine.isWebGL2)
            (<WebGL2RenderingContext>this._gl).bindVertexArray(this._vao);
        else
            this._vaoExt.bindVertexArrayOES(this._vao);
        this._engine._GLBindVertexArray = this;
    }

    /**
     * @internal
     */
    unbindVertexArray(): void {
        if (this._engine.isWebGL2)
            (<WebGL2RenderingContext>this._gl).bindVertexArray(null);
        else
            this._vaoExt.bindVertexArrayOES(null);
        this._engine._GLBindVertexArray = null;
    }

    /**
     * @internal
     */
    isVertexArray(): void {
        if (this._engine.isWebGL2)
            (<WebGL2RenderingContext>this._gl).isVertexArray(this._vao);
        else
            this._vaoExt.isVertexArrayOES(this._vao);
    }

    applyVertexBuffer(vertexBuffer: WebGLVertexBuffer[]): void {
        //Clear front VAO
        this.clearVAO();
        this._vertexBuffers = vertexBuffer;
        if (this._engine._GLBindVertexArray == this) {
            this._vertexDeclaration.length = vertexBuffer.length;
            var i = 0;
            vertexBuffer.forEach(element => {
                var verDec: VertexDeclaration = element.vertexDeclaration;
                this._vertexDeclaration[i++] = element.vertexDeclaration;
                var valueData: any = verDec._shaderValues;
                element.bind();
                for (var k in valueData) {
                    var loc: number = parseInt(k);
                    var attribute: any[] = valueData[k];
                    this._gl.enableVertexAttribArray(loc);
                    this._gl.vertexAttribPointer(loc, attribute[0], attribute[1], !!attribute[2], attribute[3], attribute[4]);
                    if (element.instanceBuffer)
                        this.vertexAttribDivisor(loc, 1);
                }
            });
        } else {
            throw "BufferState: must call bind() function first.";
        }

    }

    //绑定之前需要先处理了前面的
    clearVAO(){
        for(let i = 0,n=this._vertexDeclaration.length;i<n;i++){
            var verDec: VertexDeclaration = this._vertexDeclaration[i];
            var valueData: any = verDec._shaderValues;
            for (var k in valueData) {
                var loc: number = parseInt(k);
                this._gl.disableVertexAttribArray(loc);
            }
        }
    }

    applyIndexBuffer(indexBuffer: WebGLIndexBuffer | null): void {
        //需要强制更新IndexBuffer

        if (indexBuffer == null) {
            return;
        }
        if (this._engine._GLBindVertexArray == this) {
            if (this._bindedIndexBuffer !== indexBuffer) {
                indexBuffer._glBuffer.bindBuffer();//TODO:可和vao合并bind
                this._bindedIndexBuffer = indexBuffer;
            }
        } else {
            throw "BufferState: must call bind() function first.";
        }
    }

    /**
         * @internal
         */
    vertexAttribDivisor(index: number, divisor: number): void {
        if (this._engine.isWebGL2)
            (<WebGL2RenderingContext>this._gl).vertexAttribDivisor(index, divisor);
        else
            this._angleInstancedArrays.vertexAttribDivisorANGLE(index, divisor);
    }


    /**
     * @internal
     */
    destroy() {
        super.destroy();
        const gl = this._gl;
        this.deleteVertexArray();
        this._gl = null;
        this._engine = null;
    }
} 