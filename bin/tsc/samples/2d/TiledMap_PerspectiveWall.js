import { ILaya } from "ILaya";
import { Laya } from "Laya";
import { TiledMap } from "laya/map/TiledMap";
import { Rectangle } from "laya/maths/Rectangle";
import { Handler } from "laya/utils/Handler";
export class TiledMap_PerspectiveWall {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        //			Laya.init(700, 500, WebGL);
        Laya.stage.alignV = ILaya.Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = ILaya.Stage.ALIGN_CENTER;
        Laya.stage.bgColor = "#232628";
        this.createMap();
    }
    createMap() {
        this.tiledMap = new TiledMap();
        this.tiledMap.createMap("res/tiledMap/perspective_walls.json", new Rectangle(0, 0, Laya.stage.width, Laya.stage.height), Handler.create(this, this.onLoaded));
    }
    onLoaded() {
        this.tiledMap.mapSprite().removeSelf();
        this.Main.box2D.addChild(this.tiledMap.mapSprite());
    }
    dispose() {
        if (this.tiledMap) {
            this.tiledMap.mapSprite().removeChildren();
            this.tiledMap.destroy();
            ILaya.Resource.destroyUnusedResources();
        }
    }
}
