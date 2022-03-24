import { NativeWebGLEngine } from "./NativeWebGLEngine";

/**
 * WebglObject 基类
 */
export class NativeGLObject{
    protected _engine:NativeWebGLEngine;
    protected _gl: WebGLRenderingContext | WebGL2RenderingContext;
    protected _id:number;
    protected _destroyed: boolean = false;

    constructor(engine: NativeWebGLEngine){
        this._engine = engine;
        this._gl = this._engine.gl;
        this._id = this._engine._IDCounter++;
    }

    get destroyed():boolean{
        return this._destroyed;
    }


    /**
     * @override
     */
    setResourceManager():void{
    };

    destroy():void{
        if (this._destroyed) return;
        this._destroyed = true;
    }

}