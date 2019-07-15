/*[IF-FLASH]*/
package laya.d3.core.scene {
	improt laya.display.Sprite;
	improt laya.resource.Context;
	improt laya.resource.ICreateResource;
	improt laya.resource.Texture2D;
	improt laya.utils.Handler;
	improt laya.utils.Timer;
	improt laya.webgl.submit.ISubmit;
	improt laya.d3.Input3D;
	improt laya.d3.math.Vector3;
	improt laya.d3.physics.PhysicsSimulation;
	improt laya.d3.resource.models.SkyRenderer;
	improt laya.d3.resource.TextureCube;
	improt laya.d3.shadowMap.ParallelSplitShadowMap;
	public class Scene3D extends laya.display.Sprite implements laya.webgl.submit.ISubmit,laya.resource.ICreateResource {
		public static var HIERARCHY:String;
		public static var octreeCulling:Boolean;
		public static var octreeInitialSize:Number;
		public static var octreeInitialCenter:Vector3;
		public static var octreeMinNodeSize:Number;
		public static var octreeLooseness:Number;
		public static var REFLECTIONMODE_SKYBOX:Number;
		public static var REFLECTIONMODE_CUSTOM:Number;
		public static var FOGCOLOR:Number;
		public static var FOGSTART:Number;
		public static var FOGRANGE:Number;
		public static var LIGHTDIRECTION:Number;
		public static var LIGHTDIRCOLOR:Number;
		public static var POINTLIGHTPOS:Number;
		public static var POINTLIGHTRANGE:Number;
		public static var POINTLIGHTATTENUATION:Number;
		public static var POINTLIGHTCOLOR:Number;
		public static var SPOTLIGHTPOS:Number;
		public static var SPOTLIGHTDIRECTION:Number;
		public static var SPOTLIGHTSPOTANGLE:Number;
		public static var SPOTLIGHTRANGE:Number;
		public static var SPOTLIGHTCOLOR:Number;
		public static var SHADOWDISTANCE:Number;
		public static var SHADOWLIGHTVIEWPROJECT:Number;
		public static var SHADOWMAPPCFOFFSET:Number;
		public static var SHADOWMAPTEXTURE1:Number;
		public static var SHADOWMAPTEXTURE2:Number;
		public static var SHADOWMAPTEXTURE3:Number;
		public static var AMBIENTCOLOR:Number;
		public static var REFLECTIONTEXTURE:Number;
		public static var REFLETIONINTENSITY:Number;
		public static var TIME:Number;
		public static var ANGLEATTENUATIONTEXTURE:Number;
		public static var RANGEATTENUATIONTEXTURE:Number;
		public static var POINTLIGHTMATRIX:Number;
		public static var SPOTLIGHTMATRIX:Number;
		public static function load(url:String,complete:Handler):void{}
		public var currentCreationLayer:Number;
		public var enableLight:Boolean;
		public var parallelSplitShadowMaps:Array;
		private var _time:*;
		public function get url():String{};
		public var enableFog:Boolean;
		public var fogColor:Vector3;
		public var fogStart:Number;
		public var fogRange:Number;
		public var ambientColor:Vector3;
		public function get skyRenderer():SkyRenderer{};
		public var customReflection:TextureCube;
		public var reflectionIntensity:Number;
		public function get physicsSimulation():PhysicsSimulation{};
		public var reflectionMode:Number;
		public var timer:Timer;
		public function get input():Input3D{};

		public function Scene3D(){}
		public function _setCreateURL(url:String):void{}
		public function _parse(data:*,spriteMap:*):void{}
		protected function _onActive():void{}
		protected function _onInActive():void{}
		public function setlightmaps(value:Array):void{}
		public function getlightmaps():Array{}
		public function destroy(destroyChild:Boolean = null):void{}
		public function render(ctx:Context,x:Number,y:Number):void{}
		public function renderSubmit():Number{}
		public function getRenderType():Number{}
		public function releaseRender():void{}
		public function reUse(context:Context,pos:Number):Number{}
	}

}
