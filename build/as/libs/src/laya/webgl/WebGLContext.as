/*[IF-FLASH]*/
package laya.webgl {
	public class WebGLContext {
		public static var mainContext:WebGLRenderingContext;
		public static function useProgram(gl:WebGLRenderingContext,program:*):Boolean{}
		public static function setDepthTest(gl:WebGLRenderingContext,value:Boolean):void{}
		public static function setDepthMask(gl:WebGLRenderingContext,value:Boolean):void{}
		public static function setDepthFunc(gl:WebGLRenderingContext,value:Number):void{}
		public static function setBlend(gl:WebGLRenderingContext,value:Boolean):void{}
		public static function setBlendFunc(gl:WebGLRenderingContext,sFactor:Number,dFactor:Number):void{}
		public static function setBlendFuncSeperate(gl:WebGLRenderingContext,srcRGB:Number,dstRGB:Number,srcAlpha:Number,dstAlpha:Number):void{}
		public static function setCullFace(gl:WebGLRenderingContext,value:Boolean):void{}
		public static function setFrontFace(gl:WebGLRenderingContext,value:Number):void{}
		public static function activeTexture(gl:WebGLRenderingContext,textureID:Number):void{}
		public static function bindTexture(gl:WebGLRenderingContext,target:*,texture:*):void{}
		public static function __init_native():void{}
		public static function useProgramForNative(gl:WebGLRenderingContext,program:*):Boolean{}
		public static function setDepthTestForNative(gl:WebGLRenderingContext,value:Boolean):void{}
		public static function setDepthMaskForNative(gl:WebGLRenderingContext,value:Boolean):void{}
		public static function setDepthFuncForNative(gl:WebGLRenderingContext,value:Number):void{}
		public static function setBlendForNative(gl:WebGLRenderingContext,value:Boolean):void{}
		public static function setBlendFuncForNative(gl:WebGLRenderingContext,sFactor:Number,dFactor:Number):void{}
		public static function setCullFaceForNative(gl:WebGLRenderingContext,value:Boolean):void{}
		public static function setFrontFaceForNative(gl:WebGLRenderingContext,value:Number):void{}
		public static function activeTextureForNative(gl:WebGLRenderingContext,textureID:Number):void{}
		public static function bindTextureForNative(gl:WebGLRenderingContext,target:*,texture:*):void{}
		public static function bindVertexArrayForNative(gl:WebGLContext,vertexArray:*):void{}
	}

}
