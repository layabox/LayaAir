import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { MapLayer } from "laya/map/MapLayer";
import { TiledMap } from "laya/map/TiledMap";
import { Point } from "laya/maths/Point";
import { Rectangle } from "laya/maths/Rectangle";
import { Handler } from "laya/utils/Handler";
import { Main } from "./../Main";

export class TiledMap_IsometricWorld {
	private tiledMap: TiledMap;
	private layer: MapLayer;
	private sprite: Sprite;

	Main: typeof Main = null;
	constructor(maincls: typeof Main) {
		this.Main = maincls;

		Laya.init(1600, 800).then(() => {
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

			Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
			Laya.stage.bgColor = "#232628";

			this.createMap();

			Laya.stage.on("click", this, this.onStageClick);
		});

	}

	private createMap(): void {
		this.tiledMap = new TiledMap();
		this.tiledMap.createMap("res/tiledMap/isometric_grass_and_water.json", new Rectangle(0, 0, Laya.stage.width, Laya.stage.height), Handler.create(this, this.mapLoaded), null, new Point(1600, 800));
	}

	private onStageClick(e: any = null): void {
		var p: Point = new Point(0, 0);
		if (this.layer) {
			this.layer.getTilePositionByScreenPos(Laya.stage.mouseX, Laya.stage.mouseY, p);
			this.layer.getScreenPositionByTilePos(Math.floor(p.x), Math.floor(p.y), p);
			this.sprite.pos(p.x, p.y);
		}
	}

	private mapLoaded(e: any = null): void {
		this.layer = this.tiledMap.getLayerByIndex(0);

		var radiusX: number = 32;
		var radiusY: number = Math.tan(180 / Math.PI * 30) * radiusX;
		var color: string = "#FF7F50";

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

	dispose(): void {
		Laya.stage.off("click", this, this.onStageClick);
		if (this.tiledMap) {
			this.tiledMap.mapSprite().removeChildren();
			this.tiledMap.destroy();
			// Resource.destroyUnusedResources();
		}
	}
}

