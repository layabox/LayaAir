package laya.d3.core.scene {
	import laya.display.Sprite;
	import laya.resource.Context;
	import laya.resource.ICreateResource;
	import laya.resource.Texture2D;
	import laya.utils.Handler;
	import laya.utils.Timer;
	import laya.webgl.submit.ISubmit;
	import laya.d3.Input3D;
	import laya.d3.math.Vector3;
	import laya.d3.physics.PhysicsSimulation;
	import laya.d3.resource.models.SkyRenderer;
	import laya.d3.resource.TextureCube;
	import laya.d3.shadowMap.ParallelSplitShadowMap;

	/**
	 * <code>Scene3D</code> 类用于实现场景。
	 */
	public class Scene3D extends Sprite implements ISubmit,ICreateResource {

		/**
		 * Hierarchy资源。
		 */
		public static var HIERARCHY:String;

		/**
		 * 是否开启八叉树裁剪。
		 */
		public static var octreeCulling:Boolean;

		/**
		 * 八叉树初始化尺寸。
		 */
		public static var octreeInitialSize:Number;

		/**
		 * 八叉树初始化中心。
		 */
		public static var octreeInitialCenter:Vector3;

		/**
		 * 八叉树最小尺寸。
		 */
		public static var octreeMinNodeSize:Number;

		/**
		 * 八叉树松散值。
		 */
		public static var octreeLooseness:Number;
		public static var REFLECTIONMODE_SKYBOX:Number;
		public static var REFLECTIONMODE_CUSTOM:Number;
		public static var FOGCOLOR:Number;
		public static var FOGSTART:Number;
		public static var FOGRANGE:Number;
		public static var DIRECTIONLIGHTCOUNT:Number;
		public static var LIGHTBUFFER:Number;
		public static var CLUSTERBUFFER:Number;
		public static var SUNLIGHTDIRECTION:Number;
		public static var SUNLIGHTDIRCOLOR:Number;
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

		/**
		 * 加载场景,注意:不缓存。
		 * @param url 模板地址。
		 * @param complete 完成回调。
		 */
		public static function load(url:String,complete:Handler):void{}

		/**
		 * 当前创建精灵所属遮罩层。
		 */
		public var currentCreationLayer:Number;

		/**
		 * 是否启用灯光。
		 */
		public var enableLight:Boolean;
		public var parallelSplitShadowMaps:Array;
		private var _time:*;

		/**
		 * 获取资源的URL地址。
		 * @return URL地址。
		 */
		public function get url():String{
				return null;
		}

		/**
		 * 获取是否允许雾化。
		 * @return 是否允许雾化。
		 */

		/**
		 * 设置是否允许雾化。
		 * @param value 是否允许雾化。
		 */
		public var enableFog:Boolean;

		/**
		 * 获取雾化颜色。
		 * @return 雾化颜色。
		 */

		/**
		 * 设置雾化颜色。
		 * @param value 雾化颜色。
		 */
		public var fogColor:Vector3;

		/**
		 * 获取雾化起始位置。
		 * @return 雾化起始位置。
		 */

		/**
		 * 设置雾化起始位置。
		 * @param value 雾化起始位置。
		 */
		public var fogStart:Number;

		/**
		 * 获取雾化范围。
		 * @return 雾化范围。
		 */

		/**
		 * 设置雾化范围。
		 * @param value 雾化范围。
		 */
		public var fogRange:Number;

		/**
		 * 获取环境光颜色。
		 * @return 环境光颜色。
		 */

		/**
		 * 设置环境光颜色。
		 * @param value 环境光颜色。
		 */
		public var ambientColor:Vector3;

		/**
		 * 获取天空渲染器。
		 * @return 天空渲染器。
		 */
		public function get skyRenderer():SkyRenderer{
				return null;
		}

		/**
		 * 获取反射贴图。
		 * @return 反射贴图。
		 */

		/**
		 * 设置反射贴图。
		 * @param 反射贴图 。
		 */
		public var customReflection:TextureCube;

		/**
		 * 获取反射强度。
		 * @return 反射强度。
		 */

		/**
		 * 设置反射强度。
		 * @param 反射强度 。
		 */
		public var reflectionIntensity:Number;

		/**
		 * 获取物理模拟器。
		 * @return 物理模拟器。
		 */
		public function get physicsSimulation():PhysicsSimulation{
				return null;
		}

		/**
		 * 获取反射模式。
		 * @return 反射模式。
		 */

		/**
		 * 设置反射模式。
		 * @param value 反射模式。
		 */
		public var reflectionMode:Number;

		/**
		 * 获取输入。
		 * @return 输入。
		 */
		public function get input():Input3D{
				return null;
		}

		/**
		 * 创建一个 <code>Scene3D</code> 实例。
		 */

		public function Scene3D(){}

		/**
		 */
		public function _setCreateURL(url:String):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onActive():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _onInActive():void{}

		/**
		 * 设置光照贴图。
		 * @param value 光照贴图。
		 */
		public function setlightmaps(value:Array):void{}

		/**
		 * 获取光照贴图浅拷贝列表。
		 * @return 获取光照贴图浅拷贝列表。
		 */
		public function getlightmaps():Array{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 */
		public function renderSubmit():Number{
			return null;
		}

		/**
		 */
		public function getRenderType():Number{
			return null;
		}

		/**
		 */
		public function releaseRender():void{}

		/**
		 */
		public function reUse(context:Context,pos:Number):Number{
			return null;
		}
	}

}
