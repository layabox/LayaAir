import { Laya } from "Laya";
import { Main } from "./../Main";
import { ILaya } from "ILaya";
import { Rectangle } from "laya/maths/Rectangle";
import { Handler } from "laya/utils/Handler";
import { TiledMap } from "laya/map/TiledMap";
	export class TiledMap_PerspectiveWall
	{
		private tiledMap:TiledMap;
		constructor(){
			// 不支持WebGL时自动切换至Canvas
//			Laya.init(700, 500, WebGL);
			Laya.stage.alignV = ILaya.Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = ILaya.Stage.ALIGN_CENTER;

			Laya.stage.bgColor = "#232628";
			
			this.createMap();
		}
		
		private createMap():void
		{
			this.tiledMap = new TiledMap();
			this.tiledMap.createMap("res/tiledMap/perspective_walls.json", new Rectangle(0, 0, Laya.stage.width, Laya.stage.height), Handler.create(this,this.onLoaded));
		}
		
		private onLoaded():void
		{
			this.tiledMap.mapSprite().removeSelf();
			Main.box2D.addChild(this.tiledMap.mapSprite());
		}
		
		 dispose():void
		{
			if(this.tiledMap)
			{
				this.tiledMap.mapSprite().removeChildren();
				this.tiledMap.destroy();
				ILaya.Resource.destroyUnusedResources();
			}
		}
	}

