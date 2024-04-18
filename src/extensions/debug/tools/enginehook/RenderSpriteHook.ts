import { CacheAnalyser } from "../CacheAnalyser"
import { Sprite } from "laya/display/Sprite"
import { Context } from "laya/renders/Context";
import { RenderSprite } from "laya/renders/RenderSprite"
import { Browser } from "laya/utils/Browser"

	/**
	 * ...
	 * @author ww
	 */
	export class RenderSpriteHook 
	{
		/** @private */
		 static IMAGE:number = 0x01;
		/** @private */
		 static FILTERS:number = 0x02;
		/** @private */
		 static ALPHA:number = 0x04;
		/** @private */
		 static TRANSFORM:number = 0x08;
		/** @private */
		 static CANVAS:number = 0x10;
		/** @private */
		 static BLEND:number = 0x20;
		/** @private */
		 static CLIP:number = 0x40;
		/** @private */
		 static STYLE:number = 0x80;
		/** @private */
		 static GRAPHICS:number = 0x100;
		/** @private */
		 static CUSTOM:number = 0x200;
		/** @private */
		 static ENABLERENDERMERGE:number = 0x400;
		/** @private */
		 static CHILDS:number = 0x800;
		/** @private */
		 static INIT:number = 0x11111;
		/** @private */
		 static renders:any[] = [];
		/** @private */
		
		/** @private */
		 _next:RenderSprite;
		/** @private */
		 _fun:Function;
		 static _oldCanvas:Function;
		constructor(){
			
		}
		 static I:RenderSpriteHook;
		 static _preCreateFun:Function;
		 static init():void
		{
			if (RenderSpriteHook._oldCanvas) return;
			//I = new RenderSpriteHook();
			//_preCreateFun = RunDriver.createRenderSprite;
			//RunDriver.createRenderSprite = I.createRenderSprite;
			RenderSpriteHook._oldCanvas=RenderSprite["prototype"]["_canvas"];
			RenderSprite["prototype"]["_canvas"] = RenderSpriteHook["prototype"]["_canvas"];
		}

		_canvas(sprite:Sprite, context:Context, x:number, y:number):void {
			//trace("hooked canvas");
			var _cacheStyle:any = (sprite as any)._cacheStyle;
			var _next:RenderSprite = this._next;
			var _repaint:boolean ;
			if (!_cacheStyle.enableCanvasRender) {
				RenderSpriteHook._oldCanvas.call(this,sprite, context, x, y);
				return;
			}

			if ((sprite as any)._needRepaint() || (!_cacheStyle.canvas)) {
				_repaint = true;
			}else
			{
				_repaint = false;
			}
			
			
			var preTime:number;
			preTime = Browser.now();
			
			RenderSpriteHook._oldCanvas.call(this,sprite, context, x, y);

			if (_repaint)
			{
				CacheAnalyser.I.reCacheCanvas(sprite,Browser.now()-preTime);
			}else
			{
				CacheAnalyser.I.renderCanvas(sprite,Browser.now()-preTime);
			}
			
			//trace(x + left, y + top,tRec.width,tRec.height);
		}
	}


