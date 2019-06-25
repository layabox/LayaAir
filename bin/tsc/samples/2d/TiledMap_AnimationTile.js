import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { TiledMap } from "laya/map/TiledMap";
import { Rectangle } from "laya/maths/Rectangle";
import { Resource } from "laya/resource/Resource";
import { Handler } from "laya/utils/Handler";
export class TiledMap_AnimationTile {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        //			Laya.init(1100, 800, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        //			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.createMap();
    }
    createMap() {
        this.tiledMap = new TiledMap();
        this.tiledMap.createMap("res/tiledMap/orthogonal-test-movelayer.json", new Rectangle(0, 0, Laya.stage.width, Laya.stage.height), Handler.create(this, this.onLoaded));
    }
    onLoaded() {
        this.tiledMap.mapSprite().removeSelf();
        this.Main.box2D.addChild(this.tiledMap.mapSprite());
    }
    dispose() {
        if (this.tiledMap) {
            this.tiledMap.mapSprite().removeChildren();
            this.tiledMap.destroy();
            Resource.destroyUnusedResources();
        }
    }
}
