import { WebGLEngine } from "./WebGLEngine";

/**
 * WebglObject 基类
 */
export class GLObject{
    protected _engine:WebGLEngine;
    protected _gl: WebGLRenderingContext | WebGL2RenderingContext;
    protected _id:number;
    protected _destroyed: boolean = false;

    constructor(engine: WebGLEngine){
        this._engine = engine;
        this._gl = this._engine.gl;
        this._id = this._engine._IDCounter++;
    }

    get destroyed():boolean{
        return this._destroyed;
    }

    /**
     * destroy
     * @override
     * @returns 
     */
    destroy():void{
        if (this._destroyed) return;
        this._destroyed = true;
    }

}