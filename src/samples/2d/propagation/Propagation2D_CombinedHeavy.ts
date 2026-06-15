import { Sprite } from "laya/display/Sprite";
import { Main } from "../../Main";
import { Propagation2DPerfBase } from "./Propagation2DPerfBase";

export class Propagation2D_CombinedHeavy extends Propagation2DPerfBase {
    declare private _flat: Sprite[];
    declare private _deepRoot: Sprite;
    declare private _clipHost: Sprite;
    declare private _poolHosts: Sprite[];

    constructor(maincls: typeof Main) {
        super(maincls, "combinedHeavy", "Combined heavy propagation load", 14000, 40000);
    }

    protected buildScene(nodes: number): void {
        this._flat = [];
        this._poolHosts = [];

        const flatCount = Math.max(2000, Math.floor(nodes * 0.55));
        const deepCount = Math.max(1023, Math.min(4095, Math.floor(nodes * 0.2)));
        const clipCount = Math.max(1024, Math.floor(nodes * 0.2));
        const poolHostCount = Math.max(16, Math.min(96, Math.floor(nodes * 0.005)));

        this._buildFlatBlock(flatCount);
        this._buildDeepBlock(deepCount);
        this._buildClipBlock(clipCount);
        this._buildPoolBlock(poolHostCount);
    }

    protected runFrame(): void {
        const f = this._frame;

        for (let i = 0; i < this._flat.length; i++) {
            const sp = this._flat[i];
            sp.x = ((f * 3 + i * 5) % 1180) - 40;
            sp.y = ((f * 2 + i * 7) % 640) - 40;
        }

        this._root.x = 40 + Math.sin(f * 0.05) * 36;
        this._root.y = 40 + Math.cos(f * 0.04) * 28;

        this._deepRoot.x = 760 + Math.sin(f * 0.045) * 54;
        this._deepRoot.y = 110 + Math.cos(f * 0.035) * 42;

        this._clipHost.x = 70 + Math.sin(f * 0.055) * 64;
        this._clipHost.y = 410 + Math.cos(f * 0.05) * 45;
        if ((f & 31) === 0) {
            this._clipRect.x = (f & 63) * 0.5;
            this._clipHost.scrollRect = this._clipRect;
        }

        for (let i = 0; i < 220 && this._sprites.length > 0; i++) {
            const sp = this._sprites[(i * 67 + f * 11) % this._sprites.length];
            sp.alpha = 0.5 + ((f + i) % 30) / 70;
        }

        this._runPoolBurst();
    }

    private _buildFlatBlock(count: number): void {
        const cols = Math.ceil(Math.sqrt(count));
        for (let i = 0; i < count; i++) {
            const sp = this._makeTile(i);
            sp.pos((i % cols) * 8, Math.floor(i / cols) * 8);
            this._root.addChild(sp);
            this._flat.push(sp);
            this._sprites.push(sp);
        }
    }

    private _buildDeepBlock(target: number): void {
        this._deepRoot = new Sprite();
        this._deepRoot.pos(760, 110);
        this._root.addChild(this._deepRoot);

        const queue: Sprite[] = [this._deepRoot];
        let made = 1;
        while (queue.length > 0 && made < target) {
            const parent = queue.shift();
            for (let i = 0; i < 2 && made < target; i++) {
                const sp = this._makeTile(made + 100000);
                sp.pos(12 + i * 10, 7);
                parent.addChild(sp);
                this._sprites.push(sp);
                queue.push(sp);
                made++;
            }
        }
    }

    private _buildClipBlock(count: number): void {
        this._clipHost = new Sprite();
        this._clipHost.scrollRect = this._clipRect.clone();
        this._clipHost.graphics.drawRect(0, 0, 300, 220, null, "#66ccff", 2);
        this._clipHost.pos(70, 410);
        this._root.addChild(this._clipHost);

        const cols = Math.ceil(Math.sqrt(count));
        for (let i = 0; i < count; i++) {
            const sp = this._makeTile(i + 200000);
            sp.pos((i % cols) * 9 - 40, Math.floor(i / cols) * 9 - 30);
            this._clipHost.addChild(sp);
            this._sprites.push(sp);
        }
    }

    private _buildPoolBlock(hostCount: number): void {
        const poolRoot = new Sprite();
        poolRoot.pos(880, 430);
        this._root.addChild(poolRoot);
        for (let i = 0; i < hostCount; i++) {
            const host = new Sprite();
            host.pos((i % 12) * 44, Math.floor(i / 12) * 38);
            host.graphics.drawRect(0, 0, 32, 24, null, "#78828f", 1);
            poolRoot.addChild(host);
            this._poolHosts.push(host);
        }
    }

    private _runPoolBurst(): void {
        const batch = 36;
        for (let i = 0; i < batch; i++) {
            const sp = this._makeTile(this._frame * batch + i + 300000);
            sp.pos(this._rng.int(48), this._rng.int(34));
            this._poolHosts[this._rng.int(this._poolHosts.length)].addChild(sp);
            this._pool.push(sp);
        }
        while (this._pool.length > batch * 5) {
            const sp = this._pool.shift();
            if (sp) sp.removeSelf();
        }
    }
}
