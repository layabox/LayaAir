/*[IF-FLASH]*/
package laya.webgl.submit {
	improt laya.webgl.submit.ISubmit;
	improt laya.webgl.shader.d2.value.Value2D;
	public class SubmitBase implements laya.webgl.submit.ISubmit {
		public static var TYPE_2D:Number;
		public static var TYPE_CANVAS:Number;
		public static var TYPE_CMDSETRT:Number;
		public static var TYPE_CUSTOM:Number;
		public static var TYPE_BLURRT:Number;
		public static var TYPE_CMDDESTORYPRERT:Number;
		public static var TYPE_DISABLESTENCIL:Number;
		public static var TYPE_OTHERIBVB:Number;
		public static var TYPE_PRIMITIVE:Number;
		public static var TYPE_RT:Number;
		public static var TYPE_BLUR_RT:Number;
		public static var TYPE_TARGET:Number;
		public static var TYPE_CHANGE_VALUE:Number;
		public static var TYPE_SHAPE:Number;
		public static var TYPE_TEXTURE:Number;
		public static var TYPE_FILLTEXTURE:Number;
		public static var KEY_ONCE:Number;
		public static var KEY_FILLRECT:Number;
		public static var KEY_DRAWTEXTURE:Number;
		public static var KEY_VG:Number;
		public static var KEY_TRIANGLES:Number;
		public static var RENDERBASE:SubmitBase;
		public static var ID:Number;
		public static var preRender:ISubmit;
		public var clipInfoID:Number;
		protected var _id:Number;
		public var shaderValue:Value2D;
		public static function __init__():void{}

		public function SubmitBase(renderType:Number = null){}
		public function getID():Number{}
		public function getRenderType():Number{}
		public function toString():String{}
		public function renderSubmit():Number{}
		public function releaseRender():void{}
	}

}
