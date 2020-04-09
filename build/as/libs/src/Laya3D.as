package  {

	import laya.d3.physics.PhysicsSettings;
	import laya.utils.Handler;

	/**
	 * <code>Laya3D</code> 类用于初始化3D设置。
	 */
	public class Laya3D {

		/**
		 * Hierarchy资源。
		 */
		public static var HIERARCHY:String;

		/**
		 * Mesh资源。
		 */
		public static var MESH:String;

		/**
		 * Material资源。
		 */
		public static var MATERIAL:String;

		/**
		 * Texture2D资源。
		 */
		public static var TEXTURE2D:String;

		/**
		 * TextureCube资源。
		 */
		public static var TEXTURECUBE:String;

		/**
		 * TextureCube资源。
		 */
		public static var TEXTURECUBEBIN:String;

		/**
		 * AnimationClip资源。
		 */
		public static var ANIMATIONCLIP:String;

		/**
		 * Avatar资源。
		 */
		public static var AVATAR:String;

		/**
		 * Terrain资源。
		 */
		public static var TERRAINHEIGHTDATA:String;

		/**
		 * Terrain资源。
		 */
		public static var TERRAINRES:String;

		/**
		 * @private 
		 */
		public static var physicsSettings:PhysicsSettings;

		/**
		 * 获取是否可以启用物理。
		 * @param 是否启用物理 。
		 */
		public static function get enablePhysics():*{
				return null;
		}
		private static var enableNative3D:*;

		/**
		 * @private 
		 */
		private static var formatRelativePath:*;

		/**
		 * 初始化Laya3D相关设置。
		 * @param width 3D画布宽度。
		 * @param height 3D画布高度。
		 */
		public static function init(width:Number,height:Number,config:Config3D = null,compolete:Handler = null):void{}

		/**
		 * 创建一个 <code>Laya3D</code> 实例。
		 */

		public function Laya3D(){}
	}

}
