import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { TiledMap } from "laya/map/TiledMap";
import { Point } from "laya/maths/Point";
import { Rectangle } from "laya/maths/Rectangle";
import { Resource } from "laya/resource/Resource";
import { Handler } from "laya/utils/Handler";
export class TiledMap_IsometricWorld {
    constructor(maincls) {
        this.Main = null;
        this.Main = maincls;
        // 不支持WebGL时自动切换至Canvas
        //			Laya.init(1600, 800, WebGL);
        Laya.stage.alignV = Stage.ALIGN_MIDDLE;
        Laya.stage.alignH = Stage.ALIGN_CENTER;
        //			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.bgColor = "#232628";
        this.createMap();
        Laya.stage.on("click", this, this.onStageClick);
    }
    createMap() {
        this.tiledMap = new TiledMap();
        this.tiledMap.createMap("res/tiledMap/isometric_grass_and_water.json", new Rectangle(0, 0, Laya.stage.width, Laya.stage.height), Handler.create(this, this.mapLoaded), null, new Point(1600, 800));
    }
    onStageClick(e = null) {
        var p = new Point(0, 0);
        if (this.layer) {
            this.layer.getTilePositionByScreenPos(Laya.stage.mouseX, Laya.stage.mouseY, p);
            this.layer.getScreenPositionByTilePos(Math.floor(p.x), Math.floor(p.y), p);
            this.sprite.pos(p.x, p.y);
        }
    }
    mapLoaded(e = null) {
        this.layer = this.tiledMap.getLayerByIndex(0);
        var radiusX = 32;
        var radiusY = Math.tan(180 / Math.PI * 30) * radiusX;
        var color = "#FF7F50";
        this.sprite = new Sprite();
        this.sprite.graphics.drawLine(0, 0, -radiusX, radiusY, color);
        this.sprite.graphics.drawLine(0, 0, radiusX, radiusY, color);
        this.sprite.graphics.drawLine(-radiusX, radiusY, 0, radiusY * 2, color);
        this.sprite.graphics.drawLine(radiusX, radiusY, 0, radiusY * 2, color);
        this.Main.box2D.addChild(this.sprite);
        this.sprite.zOrder = 99999;
        this.tiledMap.mapSprite().removeSelf();
        this.Main.box2D.addChild(this.tiledMap.mapSprite());
    }
    dispose() {
        Laya.stage.off("click", this, this.onStageClick);
        if (this.tiledMap) {
            this.tiledMap.mapSprite().removeChildren();
            this.tiledMap.destroy();
            Resource.destroyUnusedResources();
        }
    }
}
