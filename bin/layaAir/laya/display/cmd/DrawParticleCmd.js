import { Pool } from "../../utils/Pool";
/**
 * 绘制粒子
 * @private
 */
export class DrawParticleCmd {
    /**@private */
    static create(_temp) {
        var cmd = Pool.getItemByClass("DrawParticleCmd", DrawParticleCmd);
        cmd._templ = _temp;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this._templ = null;
        Pool.recover("DrawParticleCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        //这个只有webgl在用
        context.drawParticle(gx, gy, this._templ);
    }
    /**@private */
    get cmdID() {
        return DrawParticleCmd.ID;
    }
}
DrawParticleCmd.ID = "DrawParticleCmd";
