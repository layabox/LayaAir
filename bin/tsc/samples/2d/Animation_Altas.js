import { Laya } from "Laya";
import { Animation } from "laya/display/Animation";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { WebGL } from "laya/webgl/WebGL";
export class Animation_Altas {
    constructor(maincls) {
        this.AniConfPath = "res/fighter/fighter.json";
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        Laya.init(Browser.clientWidth, Browser.clientHeight, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = "showall";
        Laya.stage.bgColor = "#232628";
        Laya.loader.load(this.AniConfPath, Handler.create(this, this.createAnimation), null, Loader.ATLAS);
    }
    createAnimation(_e = null) {
        var ani = new Animation();
        ani.loadAtlas(this.AniConfPath); // 加载图集动画
        ani.interval = 30; // 设置播放间隔（单位：毫秒）
        ani.index = 1; // 当前播放索引
        ani.play(); // 播放图集动画
        // 获取动画的边界信息
        var bounds = ani.getGraphicBounds();
        ani.pivot(bounds.width / 2, bounds.height / 2);
        ani.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        this.Main.box2D.addChild(ani);
    }
    onMouseDown(ani) {
        if (ani.index > ani.count) {
            ani.index = 0;
        }
        else {
            ani.index++;
        }
    }
}
