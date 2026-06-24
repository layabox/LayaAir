import { Sprite } from "laya/display/Sprite";
import { Rectangle } from "laya/maths/Rectangle";
import { Main } from "../../Main";
import { Propagation2DPerfBase } from "./Propagation2DPerfBase";

export class Propagation2D_NestedClip extends Propagation2DPerfBase {
    private _clipHosts: Sprite[];
    private _rects: Rectangle[];

    constructor(maincls: typeof Main) {
        super(maincls, "nestedClip", "Nested scrollRect chain + moving clips", 4096, 12000);
    }

    protected buildScene(nodes: number): void {
        this._clipHosts = [];
        this._rects = [];
        let parent = this._root;
        const depth = 12;
        for (let i = 0; i < depth; i++) {
            const host = new Sprite();
            const rect = new Rectangle(0, 0, 520 - i * 20, 360 - i * 12);
            host.scrollRect = rect.clone();
            host.graphics.drawRect(0, 0, rect.width, rect.height, null, "#66ccff", 1);
            host.pos(18 + i * 4, 12 + i * 3);
            parent.addChild(host);
            this._clipHosts.push(host);
            this._rects.push(rect);
            parent = host;
        }

        const cols = Math.ceil(Math.sqrt(nodes));
        for (let i = 0; i < nodes; i++) {
            const sp = this._makeTile(i);
            sp.pos((i % cols) * 9 - 60, Math.floor(i / cols) * 9 - 40);
            parent.addChild(sp);
            this._sprites.push(sp);
        }
    }

    protected runFrame(): void {
        const f = this._frame;
        for (let i = 0, n = this._clipHosts.length; i < n; i++) {
            const host = this._clipHosts[i];
            host.x = 18 + i * 4 + Math.sin(f * 0.04 + i) * 8;
            host.y = 12 + i * 3 + Math.cos(f * 0.035 + i) * 6;
            if (((f + i) & 15) === 0) {
                const rect = this._rects[i];
                rect.x = ((f + i * 3) & 31) * 0.5;
                rect.y = ((f + i * 5) & 31) * 0.5;
                host.scrollRect = rect;
            }
        }
    }
}
