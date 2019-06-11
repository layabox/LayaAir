/**
 * * <code>PostProcessRenderContext</code> 类用于创建后期处理渲染上下文。
 */
export class PostProcessRenderContext {
    constructor() {
        /** 源纹理。*/
        this.source = null;
        /** 输出纹理。*/
        this.destination = null;
        /** 渲染相机。*/
        this.camera = null;
        /** 合成着色器数据。*/
        this.compositeShaderData = null;
        /** 后期处理指令流。*/
        this.command = null;
        /** 临时纹理数组。*/
        this.deferredReleaseTextures = [];
    }
}
