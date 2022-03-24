import { IRender2DContext } from "../../RenderInterface/IRender2DContext";
import { NativeGLObject } from "./NativeGLObject";
import { NativeGLShaderInstance } from "./NativeGLShaderInstance";
import { NativeWebGLEngine } from "./NativeWebGLEngine";


export class NativeGLRender2DContext extends NativeGLObject implements IRender2DContext {
    private shaderInstance:NativeGLShaderInstance;
    private cacheShaderProgram:any;

    constructor(engine: NativeWebGLEngine) {
        super(engine);
        //this.shaderInstance = new GLShaderInstance(engine, null, null, null);
    }

    activeTexture(textureID: number): void {
        if (this._engine._activedTextureID !== textureID) {
            this._gl.activeTexture(textureID);
            this._engine._activedTextureID = textureID;
        }
    }

    bindTexture(target: number, texture: WebGLTexture): void {
        this._engine._bindTexture(target, texture);
    }

    bindUseProgram(webglProgram: any):boolean {
        if(this.cacheShaderProgram==webglProgram)
            return false;
        this._gl.useProgram(webglProgram);
        this._engine._glUseProgram = null;;
        return true;
    }

}