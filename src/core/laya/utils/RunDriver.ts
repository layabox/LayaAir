import { Laya } from "./../../Laya";
import { Browser } from "././Browser";
import { Config } from "./../../Config";
import { ColorUtils } from "././ColorUtils";
import { Sprite } from "../display/Sprite"
	import { Render } from "../renders/Render"
	import { RenderSprite } from "../renders/RenderSprite"
	import { Context } from "../resource/Context"
	import { HTMLCanvas } from "../resource/HTMLCanvas"
	import { Texture } from "../resource/Texture"
	import { Texture2D } from "../resource/Texture2D"
	import { WebGL } from "../webgl/WebGL"
	import { WebGLContext } from "../webgl/WebGLContext"
	import { RenderState2D } from "../webgl/utils/RenderState2D"

	
	/**
	 * @private
	 */
	export class RunDriver {
		//TODO:coverage
		 static createShaderCondition:Function = function(conditionScript:string):Function {
			var fn:string = "(function() {return " + conditionScript + ";})";
			return Laya._runScript(fn);//生成条件判断函数
		}
		private static hanzi:RegExp = new RegExp("^[\u4E00-\u9FA5]$");
		private static fontMap:any[] = [];
		 static measureText:Function = function(txt:string, font:string):any {
			var isChinese:boolean = RunDriver.hanzi.test(txt);
			if (isChinese && RunDriver.fontMap[font]) {
				return RunDriver.fontMap[font];
			}
			
			var ctx:any = Browser.context;
			ctx.font = font;
			
			var r:any = ctx.measureText(txt);
			if (isChinese) RunDriver.fontMap[font] = r;
			return r;
		}
		
		/**
		 * @private
		 * 绘制到画布。
		 */
		 static drawToCanvas:Function =/*[STATIC SAFE]*/ function(sprite:Sprite, _renderType:number, canvasWidth:number, canvasHeight:number, offsetX:number, offsetY:number):HTMLCanvas {
			offsetX -= sprite.x;
			offsetY -= sprite.y;
			offsetX |= 0;
			offsetY |= 0;
			canvasWidth |= 0;
			canvasHeight |= 0;
			var ctx:Context = new Context();
			ctx.size(canvasWidth, canvasHeight);
			ctx.asBitmap = true;
			ctx._targets.start();
			RenderSprite.renders[_renderType]._fun(sprite, ctx, offsetX, offsetY);
			ctx.flush();
			ctx._targets.end();
			ctx._targets.restore();
			var dt:Uint8Array = ctx._targets.getData(0, 0, canvasWidth, canvasHeight);
			ctx.destroy();
			var imgdata:any = new ImageData(canvasWidth,canvasHeight);;	//创建空的imagedata。因为下面要翻转，所以不直接设置内容
			//翻转getData的结果。
			var lineLen:number = canvasWidth * 4;
			var temp:Uint8Array = new Uint8Array(lineLen);
			var dst:Uint8Array = imgdata.data;
			var y:number = canvasHeight - 1;
			var off:number = y * lineLen;
			var srcoff:number = 0;
			for (; y >= 0; y--) {
				dst.set(dt.subarray(srcoff, srcoff + lineLen), off);
				off -= lineLen;
				srcoff += lineLen;
			}
			//imgdata.data.set(dt);
			//画到2d画布上
			var canv:HTMLCanvas = new HTMLCanvas(true);
			canv.size(canvasWidth, canvasHeight);
			var ctx2d:CanvasRenderingContext2D =<CanvasRenderingContext2D>(canv.getContext('2d') as any);
			ctx2d.putImageData(imgdata, 0, 0);;
			return canv;
		}
		
		 static drawToTexture=function(sprite:Sprite, _renderType:number, canvasWidth:number, canvasHeight:number, offsetX:number, offsetY:number):Texture {
			offsetX -= sprite.x;
			offsetY -= sprite.y;
			offsetX |= 0;
			offsetY |= 0;
			canvasWidth |= 0;
			canvasHeight |= 0;
			var ctx:Context = new Context();
			ctx.size(canvasWidth, canvasHeight);
			ctx.asBitmap = true;
			ctx._targets.start();
			RenderSprite.renders[_renderType]._fun(sprite, ctx, offsetX, offsetY);
			ctx.flush();
			ctx._targets.end();
            ctx._targets.restore();
			var rtex:Texture = new Texture( ((<Texture2D>(ctx._targets as any) )),Texture.INV_UV);
			ctx.destroy(true);// 保留 _targets
			return rtex;
		}
		
		/**
		 * 用于改变 WebGL宽高信息。
		 */
		 static changeWebGLSize:Function = /*[STATIC SAFE]*/ function(w:number, h:number):void {
			WebGL.onStageResize(w, h);
		}
		
		/** @private */
		 static clear:Function = function(value:string):void {
			//修改需要同步到上面的native实现中
			Context.set2DRenderConfig();//渲染2D前要还原2D状态,否则可能受3D影响
			RenderState2D.worldScissorTest && WebGL.mainContext.disable(WebGLContext.SCISSOR_TEST);
			var ctx:Context = Render.context;
			//兼容浏览器
			var c:any[] = (ctx._submits._length == 0 || Config.preserveDrawingBuffer) ? ColorUtils.create(value).arrColor : Laya.stage._wgColor;
			if (c) 
				ctx.clearBG(c[0], c[1], c[2], c[3]);
			else
				ctx.clearBG(0, 0, 0, 0);
			RenderState2D.clear();
		};
		
		
		 static  enableNative:Function;
	}


