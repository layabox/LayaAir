
import { WebGLExtension } from "./GLEnum/WebGLExtension";
import { GLObject } from "./GLObject";
import { WebGLEngine } from "./WebGLEngine";

export class GLVertexArray extends GLObject{
    _engine: WebGLEngine;
    _gl: WebGLRenderingContext | WebGL2RenderingContext;
    private _vaoExt:any|null;
    private _vao: WebGLVertexArrayObject|WebGLVertexArrayObjectOES;

    constructor(engine: WebGLEngine) {
        super(engine);
        if (!engine.isWebGL2)
            this._vaoExt = engine._supportCapatable.getExtension(WebGLExtension.OES_vertex_array_object);
        this._vao = this.createVertexArray();
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
    unbindVertexArray():void{
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