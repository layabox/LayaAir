import { IndexBuffer } from "../../IndexBuffer";
import { IRenderVertexState } from "../../RenderInterface/IRenderVertexState";
import { VertexBuffer } from "../../VertexBuffer";
import { VertexDeclaration } from "../../VertexDeclaration";
import { WebGLExtension } from "./GLEnum/WebGLExtension";
import { GLObject } from "./GLObject";
import { WebGLEngine } from "./WebGLEngine";


export class GLVertexState extends GLObject implements IRenderVertexState {
    private _angleInstancedArrays:any;
    private _vaoExt: any | null;
    private _vao: WebGLVertexArrayObject | WebGLVertexArrayObjectOES;

    _vertexDeclaration: VertexDeclaration;
    _bindedIndexBuffer: IndexBuffer;
    _vertexBuffers: VertexBuffer[];

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

    applyVertexBuffer(vertexBuffer: VertexBuffer[]): void {
        this._vertexBuffers = vertexBuffer;
        if (this._engine._GLBindVertexArray == this) {
            vertexBuffer.forEach(element => {
                var verDec: VertexDeclaration = element.vertexDeclaration;
                var valueData: any = verDec._shaderValues.getData();
                element.bind();
                for (var k in valueData) {
                    var loc: number = parseInt(k);
                    var attribute: any[] = valueData[k];
                    this._gl.enableVertexAttribArray(loc);
                    this._gl.vertexAttribPointer(loc, attribute[0], attribute[1], !!attribute[2], attribute[3], attribute[4]);
                    if (element._instanceBuffer)
                    this.vertexAttribDivisor(loc,1);
                }
            });
        } else {
            throw "BufferState: must call bind() function first.";
        }

    }

    applyIndexBuffer(indexBuffer: IndexBuffer|null): void {
        //需要强制更新IndexBuffer
        
        if(indexBuffer==null){
            return;
        }
        if (this._engine._GLBindVertexArray == this) {
            if (this._bindedIndexBuffer !== indexBuffer) {
                indexBuffer.bind();//TODO:可和vao合并bind
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