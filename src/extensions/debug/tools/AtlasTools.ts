import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite"
import { Texture } from "laya/resource/Texture"

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
			if (this.mSprite == null)
			{
				this.mSprite = new Sprite();
			}
			Laya.stage.addChild(this.mSprite);
			this.showNext();
		}
		
		end():void
		{
			if (this.mSprite)
			{
				Laya.stage.removeChild(this.mSprite);
			}
		}
		
		showNext():void
		{
			if (this.mSprite == null)
			{
				this.mSprite = new Sprite();
			}
			Laya.stage.addChild(this.mSprite);
			this.mIndex ++;
		
			var tTexture:Texture;
			if (this.mTextureDic[this.mIndex])
			{
				tTexture = this.mTextureDic[this.mIndex];
			}

		}
		
	}


