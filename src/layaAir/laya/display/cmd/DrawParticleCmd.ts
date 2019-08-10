import { Context } from "../../resource/Context"
import { Pool } from "../../utils/Pool"

/**
 * 绘制粒子
 * @private
 */
export class DrawParticleCmd {
    static ID: string = "DrawParticleCmd";

    private _templ: any;

    /**@private */
    static create(_temp: any): DrawParticleCmd {
        var cmd: DrawParticleCmd = Pool.getItemByClass("DrawParticleCmd", DrawParticleCmd);
        cmd._templ = _temp;
        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this._templ = null;
        Pool.recover("DrawParticleCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        //这个只有webgl在用
        context.drawParticle(gx, gy, this._templ);
    }

    /**@private */
    get cmdID(): string {
        return DrawParticleCmd.ID;
    }
}

