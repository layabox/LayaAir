import { Laya } from "Laya";
import { Main } from "./../Main";
import { Stage } from "layasplay/Stage"
	import { TiledMap } from "layap/TiledMap"
	import { Rectangle } from "layaths/Rectangle"
	import { Resource } from "layasource/Resource"
	import { Browser } from "layails/Browser"
	import { Handler } from "layails/Handler"
	import { WebGL } from "layabgl/WebGL"
	
	export class TiledMap_PerspectiveWall
	{
		private tiledMap:TiledMap;
		constructor(){
			// 不支持WebGL时自动切换至Canvas
//			Laya.init(700, 500, WebGL);

			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;

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
				Resource.destroyUnusedResources();
			}
		}
	}

