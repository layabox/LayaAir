import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Particle2D } from "laya/particle/Particle2D";
import { ParticleTemplate2D } from "laya/particle/ParticleTemplate2D";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { WebGL } from "laya/webgl/WebGL";
import { Main } from "./../Main";

export class Particle_T3 {
    private sp: Particle2D;

    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;

        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);

        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;

        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";

        Stat.show();

        Laya.loader.load("res/particles/particleNew.part").then((template: ParticleTemplate2D) => {
            this.sp = new Particle2D();
            this.sp.template = template;
            this.sp.emitter.start();
            this.sp.play();
            this.Main.box2D.addChild(this.sp);

            this.sp.x = Laya.stage.width / 2;
            this.sp.y = Laya.stage.height / 2;
        });
    }

    dispose(): void {
        if (this.sp) {
            this.sp.emitter.stop();
            this.sp.destroy();
        }
    }
}


