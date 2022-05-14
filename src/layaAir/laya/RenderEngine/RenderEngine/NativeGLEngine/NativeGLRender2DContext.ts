import { IRender2DContext } from "../../RenderInterface/IRender2DContext";
import { NativeGLObject } from "./NativeGLObject";
import { NativeWebGLEngine } from "./NativeWebGLEngine";


export class NativeGLRender2DContext extends NativeGLObject implements IRender2DContext {

    constructor(engine: NativeWebGLEngine) {
        super(engine);
    }

    activeTexture(textureID: number): void {

    }

    bindTexture(target: number, texture: WebGLTexture): void {
    }

    bindUseProgram(webglProgram: any):boolean {
        return true;
    }

}