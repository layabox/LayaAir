package laya.webgl {
	public class WebGLContext {

		/*
		 * @private 
		 */
		public static var mainContext:*;

		/*
		 * @private 
		 */
		public static function useProgram(gl:*,program:*):Boolean{
			return null;
		}

		/*
		 * @private 
		 */
		public static function setDepthTest(gl:*,value:Boolean):void{}

		/*
		 * @private 
		 */
		public static function setDepthMask(gl:*,value:Boolean):void{}

		/*
		 * @private 
		 */
		public static function setDepthFunc(gl:*,value:Number):void{}

		/*
		 * @private 
		 */
		public static function setBlend(gl:*,value:Boolean):void{}

		/*
		 * @private 
		 */
		public static function setBlendFunc(gl:*,sFactor:Number,dFactor:Number):void{}

		/*
		 * @private 
		 */
		public static function setBlendFuncSeperate(gl:*,srcRGB:Number,dstRGB:Number,srcAlpha:Number,dstAlpha:Number):void{}

		/*
		 * @private 
		 */
		public static function setCullFace(gl:*,value:Boolean):void{}

		/*
		 * @private 
		 */
		public static function setFrontFace(gl:*,value:Number):void{}

		/*
		 * @private 
		 */
		public static function activeTexture(gl:*,textureID:Number):void{}

		/*
		 * @private 
		 */
		public static function bindTexture(gl:*,target:*,texture:*):void{}

		/*
		 * @private 
		 */
		public static function __init_native():void{}

		/*
		 * @private 
		 */
		public static function useProgramForNative(gl:*,program:*):Boolean{
			return null;
		}

		/*
		 * @private 
		 */
		public static function setDepthTestForNative(gl:*,value:Boolean):void{}

		/*
		 * @private 
		 */
		public static function setDepthMaskForNative(gl:*,value:Boolean):void{}

		/*
		 * @private 
		 */
		public static function setDepthFuncForNative(gl:*,value:Number):void{}

		/*
		 * @private 
		 */
		public static function setBlendForNative(gl:*,value:Boolean):void{}

		/*
		 * @private 
		 */
		public static function setBlendFuncForNative(gl:*,sFactor:Number,dFactor:Number):void{}

		/*
		 * @private 
		 */
		public static function setCullFaceForNative(gl:*,value:Boolean):void{}

		/*
		 * @private 
		 */
		public static function setFrontFaceForNative(gl:*,value:Number):void{}

		/*
		 * @private 
		 */
		public static function activeTextureForNative(gl:*,textureID:Number):void{}

		/*
		 * @private 
		 */
		public static function bindTextureForNative(gl:*,target:*,texture:*):void{}

		/*
		 * @private 
		 */
		public static function bindVertexArrayForNative(gl:WebGLContext,vertexArray:*):void{}
	}

}
