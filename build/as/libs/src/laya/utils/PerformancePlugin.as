package laya.utils {
	public class PerformancePlugin {
		public static var _enable:Boolean;
		public static var PERFORMANCE_LAYA:String;
		public static var PERFORMANCE_LAYA_3D:String;
		public static var PERFORMANCE_LAYA_2D:String;
		public static var PERFORMANCE_LAYA_3D_PRERENDER:String;
		public static var PERFORMANCE_LAYA_3D_UPDATESCRIPT:String;
		public static var PERFORMANCE_LAYA_3D_PHYSICS:String;
		public static var PERFORMANCE_LAYA_3D_PHYSICS_SIMULATE:String;
		public static var PERFORMANCE_LAYA_3D_PHYSICS_CHARACTORCOLLISION:String;
		public static var PERFORMANCE_LAYA_3D_PHYSICS_EVENTSCRIPTS:String;
		public static var PERFORMANCE_LAYA_3D_RENDER:String;
		public static var PERFORMANCE_LAYA_3D_RENDER_SHADOWMAP:String;
		public static var PERFORMANCE_LAYA_3D_RENDER_CLUSTER:String;
		public static var PERFORMANCE_LAYA_3D_RENDER_CULLING:String;
		public static var PERFORMANCE_LAYA_3D_RENDER_RENDERDEPTHMDOE:String;
		public static var PERFORMANCE_LAYA_3D_RENDER_RENDEROPAQUE:String;
		public static var PERFORMANCE_LAYA_3D_RENDER_RENDERCOMMANDBUFFER:String;
		public static var PERFORMANCE_LAYA_3D_RENDER_RENDERTRANSPARENT:String;
		public static var PERFORMANCE_LAYA_3D_RENDER_POSTPROCESS:String;
		public static function setPerformanceDataTool(tool:*):void{}
		public static function begainSample(path:String):void{}
		public static function endSample(path:String):Number{
			return null;
		}
		public static function expoertFile(path:String):*{}
		public static function showFunSampleFun(path:String):void{}
		public static function set enable(value:Boolean):void{}
		public static function get enable():Boolean{return null;}
		public static function set enableDataExport(value:Boolean):void{}
		public static function get enableDataExport():Boolean{return null;}
	}

}
