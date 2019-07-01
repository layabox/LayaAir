import { WebGLContext } from "../WebGLContext"
	
	export class BlendMode
	{
		 static activeBlendFunction:Function = null;
		 static NAMES:any[] = ["normal", "add", "multiply", "screen", "overlay", "light", "mask", "destination-out"];
		 static TOINT:any = { "normal":0, "add":1, "multiply":2, "screen":3 , "overlay":4, "light":5, "mask":6, "destination-out":7, "lighter":1 };
		
		 static NORMAL:string = "normal";					//0
		 static ADD:string = "add";							//1
		 static MULTIPLY:string = "multiply";				//2
		 static SCREEN:string = "screen";					//3
		 static OVERLAY:string = "overlay";					//4
		 static LIGHT:string = "light";						//5
		 static MASK:string = "mask";						//6
		 static DESTINATIONOUT:string = "destination-out";	//7
		 static LIGHTER:string = "lighter";					//1  等同于加色法
		
		 static fns:any[] = [];
		 static targetFns:any[] = [];
		/**@internal */
		 static _init_(gl:WebGLContext):void
		{
			BlendMode.fns = [BlendMode.BlendNormal, BlendMode.BlendAdd, BlendMode.BlendMultiply, BlendMode.BlendScreen, BlendMode.BlendOverlay, BlendMode.BlendLight, BlendMode.BlendMask,BlendMode.BlendDestinationOut];
			BlendMode.targetFns = [BlendMode.BlendNormalTarget, BlendMode.BlendAddTarget, BlendMode.BlendMultiplyTarget, BlendMode.BlendScreenTarget, BlendMode.BlendOverlayTarget, BlendMode.BlendLightTarget,BlendMode.BlendMask,BlendMode.BlendDestinationOut];
		}
		
		 static BlendNormal(gl:WebGL2RenderingContext):void
		{
			//为了避免黑边，和canvas作为贴图的黑边
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
		}

		 static BlendAdd(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.DST_ALPHA);
		}
		
		//TODO:coverage
		 static BlendMultiply(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.DST_COLOR, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
		}
		
		//TODO:coverage
		 static BlendScreen(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
		}
		
		//TODO:coverage
		 static BlendOverlay(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_COLOR);
		}
		
		//TODO:coverage
		 static BlendLight(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
		}
	
		 static BlendNormalTarget(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl,WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
		}
		
		//TODO:coverage
		 static BlendAddTarget(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.DST_ALPHA);
		}
		
		//TODO:coverage
		 static BlendMultiplyTarget(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.DST_COLOR, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
		}
		
		//TODO:coverage
		 static BlendScreenTarget(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
		}
		
		//TODO:coverage
		 static BlendOverlayTarget(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_COLOR);
		}

		//TODO:coverage
		 static BlendLightTarget(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
		}
		
		 static BlendMask(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ZERO, WebGL2RenderingContext.SRC_ALPHA);
		}
		
		//TODO:coverage
		 static BlendDestinationOut(gl:WebGL2RenderingContext):void
		{
			WebGLContext.setBlendFunc(gl, WebGL2RenderingContext.ZERO, WebGL2RenderingContext.ZERO);
		}
	}

