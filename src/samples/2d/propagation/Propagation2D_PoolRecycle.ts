import { Main } from "../../Main";
import { Propagation2DPerfBase } from "./Propagation2DPerfBase";

export class Propagation2D_PoolRecycle extends Propagation2DPerfBase {
    constructor(maincls: typeof Main) {
        super(maincls, "poolRecycle", "Pool add/remove", 2000, 8000);
    }

    protected buildScene(nodes: number): void {
        this._buildPoolHosts(nodes);
    }

    protected runFrame(): void {
        const batch = 24;
        for (let i = 0; i < batch; i++) {
            const sp = this._makeTile(this._frame * batch + i);
            sp.pos(this._rng.int(72), this._rng.int(48));
            this._hosts[this._rng.int(this._hosts.length)].addChild(sp);
            this._pool.push(sp);
        }
        while (this._pool.length > batch * 4) {
            const sp = this._pool.shift();
            if (sp) sp.removeSelf();
        }
    }
}
