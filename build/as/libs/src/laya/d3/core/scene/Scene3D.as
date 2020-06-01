package laya.d3.core.scene {
	import laya.display.Sprite;
	import laya.resource.Context;
	import laya.resource.ICreateResource;
	import laya.resource.Texture2D;
	import laya.resource.TextureDecodeFormat;
	import laya.utils.Handler;
	import laya.utils.Timer;
	import laya.webgl.submit.ISubmit;
	import laya.d3.graphics.SphericalHarmonicsL2;
	import laya.d3.Input3D;
	import laya.d3.math.Vector3;
	import laya.d3.physics.PhysicsSimulation;
	import laya.d3.resource.models.SkyRenderer;
	import laya.d3.resource.TextureCube;
	import laya.d3.core.scene.Lightmap;
	import laya.d3.physicsCannon.CannonPhysicsSimulation;

	/**
	 * 用于实现3D场景。
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
		public static var AMBIENTSHAR:Number;
		public static var AMBIENTSHAG:Number;
		public static var AMBIENTSHAB:Number;
		public static var AMBIENTSHBR:Number;
		public static var AMBIENTSHBG:Number;
		public static var AMBIENTSHBB:Number;
		public static var AMBIENTSHC:Number;
		public static var REFLECTIONPROBE:Number;
		public static var REFLECTIONCUBE_HDR_PARAMS:Number;
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
		public static var AMBIENTCOLOR:Number;
		public static var REFLECTIONTEXTURE:Number;
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

		/**
		 * 资源的URL地址。
		 */
		public function get url():String{return null;}

		/**
		 * 是否允许雾化。
		 */
		public function get enableFog():Boolean{return null;}
		public function set enableFog(value:Boolean):void{}

		/**
		 * 雾化颜色。
		 */
		public function get fogColor():Vector3{return null;}
		public function set fogColor(value:Vector3):void{}

		/**
		 * 雾化起始位置。
		 */
		public function get fogStart():Number{return null;}
		public function set fogStart(value:Number):void{}

		/**
		 * 雾化范围。
		 */
		public function get fogRange():Number{return null;}
		public function set fogRange(value:Number):void{}

		/**
		 * 环境光模式。
		 * 如果值为AmbientMode.SolidColor一般使用ambientColor作为环境光源，如果值为如果值为AmbientMode.SphericalHarmonics一般使用ambientSphericalHarmonics作为环境光源。
		 */
		public function get ambientMode():*{return null;}
		public function set ambientMode(value:*):void{}

		/**
		 * 固定颜色环境光。
		 */
		public function get ambientColor():Vector3{return null;}
		public function set ambientColor(value:Vector3):void{}

		/**
		 * 球谐环境光,修改后必须重新赋值。
		 */
		public function get ambientSphericalHarmonics():SphericalHarmonicsL2{return null;}
		public function set ambientSphericalHarmonics(value:SphericalHarmonicsL2):void{}

		/**
		 * 环境球谐强度。
		 */
		public function get ambientSphericalHarmonicsIntensity():Number{return null;}
		public function set ambientSphericalHarmonicsIntensity(value:Number):void{}

		/**
		 * 反射立方体纹理。
		 */
		public function get reflection():TextureCube{return null;}
		public function set reflection(value:TextureCube):void{}

		/**
		 * 反射立方体纹理解码格式。
		 */
		public function get reflectionDecodingFormat():TextureDecodeFormat{return null;}
		public function set reflectionDecodingFormat(value:TextureDecodeFormat):void{}

		/**
		 * 反射强度。
		 */
		public function get reflectionIntensity():Number{return null;}
		public function set reflectionIntensity(value:Number):void{}

		/**
		 * 天空渲染器。
		 */
		public function get skyRenderer():SkyRenderer{return null;}

		/**
		 * 物理模拟器。
		 */
		public function get physicsSimulation():PhysicsSimulation{return null;}
		public function get cannonPhysicsSimulation():CannonPhysicsSimulation{return null;}

		/**
		 * 场景时钟。
		 * @override 
		 */
		override public function get timer():Timer{return null;}
		public function set timer(value:Timer):void{}

		/**
		 * 输入。
		 */
		public function get input():Input3D{return null;}

		/**
		 * 光照贴图数组,返回值为浅拷贝数组。
		 */
		public function get lightmaps():Array{return null;}
		public function set lightmaps(value:Array):void{}

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

		/**
		 * @deprecated 
		 */
		public function get customReflection():TextureCube{return null;}
		public function set customReflection(value:TextureCube):void{}

		/**
		 * @deprecated 
		 */
		public function get reflectionMode():Number{return null;}
		public function set reflectionMode(value:Number):void{}

		/**
		 * @deprecated 设置光照贴图。
		 * @param value 光照贴图。
		 */
		public function setlightmaps(value:Array):void{}

		/**
		 * @deprecated 获取光照贴图浅拷贝列表。
		 * @return 获取光照贴图浅拷贝列表。
		 */
		public function getlightmaps():Array{
			return null;
		}
	}

}
