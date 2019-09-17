import { Laya } from "Laya";
import { Browser } from "laya/utils/Browser";
import { Matrix } from "laya/maths/Matrix";
import { Sprite } from "laya/display/Sprite";
import { Point } from "laya/maths/Point";
import { Texture } from "laya/resource/Texture";

	
	/**
	 * 本类用于操作html对象
	 * @author ww
	 */
	export class JSTools
	{
		
		constructor(){
		
		}
		
		/**
		 * 将html对象添加到body上
		 * @param el
		 * @param x
		 * @param y
		 *
		 */
		 static showToBody(el:any, x:number = 0, y:number = 0):void
		{
			Browser.document.body.appendChild(el);
			var style:any;
			
			style = el.style;
			style.position = "absolute";
			style.top = y + "px";
			style.left = x + "px";
		}
		 static showToParent(el:any,x:number = 0, y:number = 0,parent:any=null):void
		{
			parent.appendChild(el);
			var style:any;
			
			style = el.style;
			style.position = "absolute";
			style.top = y + "px";
			style.left = x + "px";
		}
		 static addToBody(el:any):void
		{
			Browser.document.body.appendChild(el);
		}
		 static setPos(el:any,x:number,y:number):void
		{
			var style:any;		
			style = el.style;

			style.top = y + "px";

			style.left = x + "px";
			
			
		}
		 static setSize(el:any,width:number,height:number):void
		{
			var style:any;		
			style = el.style;
			
			style.width = width + "px";
			
			style.height = height + "px";
			
			
		}
		 static setTransform(el:any, mat:Matrix):void
		{
			var style:any;		
			style = el.style;
			style.transformOrigin = style.webkitTransformOrigin = style.msTransformOrigin = style.mozTransformOrigin = style.oTransformOrigin = "0px 0px 0px";
			style.transform = style.webkitTransform = style.msTransform = style.mozTransform = style.oTransform = "matrix(" + mat.toString() + ")";
		}
		 static noMouseEvent(el:any):void
		{
			var style:any;		
			style = el.style;
			style["pointer-events"]="none";
		}
		 static setMouseEnable(el:any,enable:boolean):void
		{
			var style:any;		
			style = el.style;
			style["pointer-events"]=enable?"auto":"none";
		}
		 static setZIndex(el:any,zIndex:number):void
		{
			var style:any;
			
			style = el.style;
			style["z-index"] = zIndex;
		}
		/**
		 * 将html对象添加到显示列表上的某个对象的上方
		 * @param el
		 * @param sprite
		 * @param dx
		 * @param dy
		 *
		 */
		 static showAboveSprite(el:any, sprite:Sprite, dx:number = 0, dy:number = 0):void
		{
			var pos:Point;
			pos = new Point();
			pos = sprite.localToGlobal(pos);
			pos.x += dx;
			pos.y += dy;
			pos.x += Laya.stage.offset.x;
			pos.y += Laya.stage.offset.y;
			JSTools.showToBody(el, pos.x, pos.y);
		}
		
		/**
		 * 移除html对象
		 * @param el
		 *
		 */
		 static removeElement(el:any):void
		{
			Browser.removeElement(el);
		}
		 static isElementInDom(el:any):boolean
		{
			return el && el.parentNode;
		}
		 static getImageSpriteByFile(file:any,width:number=0,height:number=0):Sprite
		{
			var reader:any;
			reader= new FileReader();;
			reader.readAsDataURL(file);
			var sprite:Sprite;
			sprite = new Sprite();
			reader.onload = function(e:any):void
			{
				var txt:Texture;
				txt = new Texture();
				txt.load(reader.result);
				sprite.graphics.drawTexture(txt, 0, 0,width,height);
			}
			return sprite;
		}
		
		private static _pixelRatio:number=-1;
		 static getPixelRatio():number
		{
			if (JSTools._pixelRatio > 0) return JSTools._pixelRatio;
			var canvas:any = Browser.createElement("canvas");
			var context:any = canvas.getContext('2d');
			 var devicePixelRatio:number = Browser.window.devicePixelRatio || 1;
             var  backingStoreRatio:number = context.webkitBackingStorePixelRatio ||
                            context.mozBackingStorePixelRatio ||
                            context.msBackingStorePixelRatio ||
                            context.oBackingStorePixelRatio ||
                            context.backingStorePixelRatio || 1;

              var ratio:number = devicePixelRatio / backingStoreRatio;
			  console.log("pixelRatioc:", ratio);
			  JSTools._pixelRatio = ratio;
			  return ratio;
		}

	}


