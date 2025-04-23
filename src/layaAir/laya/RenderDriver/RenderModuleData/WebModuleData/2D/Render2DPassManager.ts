import { LayaGL } from "../../../../layagl/LayaGL";
import { Context } from "../../../../renders/Context";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRender2DPass } from "../../Design/2D/IRender2DPass";

export class Render2DPassManager {

    get basePass(): IRender2DPass {
        return this._basePass;
    }

    private _basePass:IRender2DPass

    private _modefy: boolean = false;

    modefy(){
        this._modefy = true;
    }

    constructor() {
        this._basePass = LayaGL.render2DRenderPassFactory.createRender2DPass();
        this._basePass.priority = 0;
        this.addPass(this._basePass);
    }

    private _passes: IRender2DPass[] = [];

    /**
     * 添加一个渲染 Pass
     * @param pass IRender2DPass 实例
     */
    addPass(pass: IRender2DPass): void {
        this._passes.push(pass);
        this.modefy();
    }

    /**
     * 移除一个渲染 Pass
     * @param pass IRender2DPass 实例
     */
    removePass(pass: IRender2DPass): void {
        const index = this._passes.indexOf(pass);
        if (index !== -1) {
            this._passes.splice(index, 1);
        }
    }

    /**
     * 按照 priority 对 Pass 进行排序
     */
    private _sortPassesByPriority(): void {
        this._passes.sort((a, b) => b.priority - a.priority); // 按 priority 从大到小排序
    }

    /**
     * 渲染所有 Pass
     * @param context2D 2D 渲染上下文
     */
    apply( context2D: IRenderContext2D): void {
        if (this._modefy) {
            this._modefy = false;
            this._sortPassesByPriority();
        }

        for (const pass of this._passes) {
            if (pass.repaint || this._needsUpdate(pass)) {
                pass.render(context2D);
            }
        }
    }

    /**
     * 判断是否需要更新渲染
     * @param pass IRender2DPass 实例
     * @returns 是否需要更新
     */
    private _needsUpdate(pass: IRender2DPass): boolean {
        return true;
    }

    /**
     * 清空所有 Pass
     */
    clear(): void {
        this._passes.length = 0;
    }
}