import { Laya } from "./../../../../../../core/src/Laya";
import { Sprite } from "../../../../../../core/src/laya/display/Sprite"
	import { Event } from "../../../../../../core/src/laya/events/Event"
	import { Render } from "../../../../../../core/src/laya/renders/Render"
	import { Texture } from "../../../../../../core/src/laya/resource/Texture"
	//import laya.webgl.atlas.Atlaser;
	//import laya.webgl.atlas.AtlasResourceManager;
	/**
	 * tianpeng
	 * @author 
	 */
	export class AtlasTools 
	{
		
		private mSprite:Sprite;
		private mIndex:number = 0;
		private mTextureDic:any = { };
		
		private static mInstance:AtlasTools;
		
		constructor(){
			
		}
		
		 static getInstance():AtlasTools
		{
			return AtlasTools.mInstance =AtlasTools.mInstance|| new AtlasTools();
		}
		
		 start():void
		{
			if (!Render.isWebGL) return;
			if (this.mSprite == null)
			{
				this.mSprite = new Sprite();
			}
			Laya.stage.addChild(this.mSprite);
			this.showNext();
		}
		
		 end():void
		{
			if (!Render.isWebGL) return;
			if (this.mSprite)
			{
				Laya.stage.removeChild(this.mSprite);
			}
		}
		
		 showNext():void
		{
			if (!Render.isWebGL) return;
			if (this.mSprite == null)
			{
				this.mSprite = new Sprite();
			}
			Laya.stage.addChild(this.mSprite);
			this.mIndex ++;
			var resManager:any;
			resManager = laya.webgl.atlas.AtlasResourceManager.instance;;
			var tCount:number =  resManager.getAtlaserCount();
			if (this.mIndex >= tCount)
			{
				this.mIndex = 0;
			}
			var tTexture:Texture;
			if (this.mTextureDic[this.mIndex])
			{
				tTexture = this.mTextureDic[this.mIndex];
			}else {
				var tAtlaser:any = resManager.getAtlaserByIndex(this.mIndex);
				if (tAtlaser && tAtlaser.texture)
				{
					//tTexture = Texture.create(tAtlaser.texture, 0, 0, 2048, 2048);
					tTexture = new Texture(tAtlaser.texture,null);
					this.mTextureDic[this.mIndex] = tTexture;
				}
			}
			if (tTexture)
			{
				this.mSprite.graphics.clear();
				this.mSprite.graphics.save();
				this.mSprite.graphics.alpha(0.9);
				this.mSprite.graphics.drawRect(0, 0, 1024, 1024, "#efefefe");
				this.mSprite.graphics.restore();
				this.mSprite.graphics.drawTexture(tTexture, 0, 0, 1024, 1024);
				this.mSprite.graphics.fillText((this.mIndex + 1).toString() +"/" + tCount.toString(),25,100,"40px Arial","#ff0000","left");
			}
		}
		
	}


