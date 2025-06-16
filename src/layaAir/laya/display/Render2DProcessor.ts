import { LayaGL } from "../layagl/LayaGL";
import { IRenderContext2D } from "../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRender2DPass, IRender2DPassManager } from "../RenderDriver/RenderModuleData/Design/2D/IRender2DPass";
import { GraphicsRunner } from "./Scene2DSpecial/GraphicsRunner";

export class Render2DProcessor {

    static rendercontext2D: IRenderContext2D;
    static runner:GraphicsRunner = null;
    
    static __init__() {
        Render2DProcessor.runner = new GraphicsRunner();
        Render2DProcessor.rendercontext2D = LayaGL.render2DRenderPassFactory.createRenderContext2D();
    }

    private _manager: IRender2DPassManager;
    
    get basePass(): IRender2DPass {
        return this._basePass;
    }

    private _basePass: IRender2DPass

    constructor() {
        this._basePass = LayaGL.render2DRenderPassFactory.createRender2DPass();
        this._manager = LayaGL.render2DRenderPassFactory.createRender2DPassManager();
        this._basePass.doClearColor = false;
        this._basePass.priority = 0;
        this.addPass(this._basePass);
    }

    /**
     * 添加一个渲染 Pass
     * @param pass IRender2DPass 实例
     */
    addPass(pass: IRender2DPass): void {
        this._manager.addPass(pass);
    }

    /**
     * 移除一个渲染 Pass
     * @param pass IRender2DPass 实例
     */
    removePass(pass: IRender2DPass): void {
        this._manager.removePass(pass);
    }

    /**
     * 渲染所有 Pass
     * @param context2D 2D 渲染上下文
     */
    apply(context2D: IRenderContext2D): void {
        this._manager.apply(context2D);
    }

    
    /**
     * 清空所有 Pass
     */
    clear(): void {
        this._manager.clear();
    }
}