import { NativeGLTextureContext } from "./NativeGLTextureContext";
import { NativeWebGLEngine } from "./NativeWebGLEngine";

/**
 * 将继承修改为类似 WebGLRenderingContextBase, WebGLRenderingContextOverloads 多继承 ?
 */
export class NativeGL2TextureContext extends NativeGLTextureContext {

    constructor(engine: NativeWebGLEngine, native: any) {
        super(engine, native);
    }
}