package  {

	import laya.utils.Handler;
	import laya.d3.physics.PhysicsSettings;

	/*
	 * <code>Laya3D</code> 类用于初始化3D设置。
	 */
	public class Laya3D {

		/*
		 * Hierarchy资源。
		 */
		public static var HIERARCHY:String;

		/*
		 * Mesh资源。
		 */
		public static var MESH:String;

		/*
		 * Material资源。
		 */
		public static var MATERIAL:String;

		/*
		 * Texture2D资源。
		 */
		public static var TEXTURE2D:String;

		/*
		 * TextureCube资源。
		 */
		public static var TEXTURECUBE:String;

		/*
		 * AnimationClip资源。
		 */
		public static var ANIMATIONCLIP:String;

		/*
		 * Avatar资源。
		 */
		public static var AVATAR:String;

		/*
		 * Terrain资源。
		 */
		public static var TERRAINHEIGHTDATA:String;

		/*
		 * Terrain资源。
		 */
		public static var TERRAINRES:String;

		/*
		 * @private 
		 */
		private static var _innerFirstLevelLoaderManager:*;

		/*
		 * @private 
		 */
		private static var _innerSecondLevelLoaderManager:*;

		/*
		 * @private 
		 */
		private static var _innerThirdLevelLoaderManager:*;

		/*
		 * @private 
		 */
		private static var _innerFourthLevelLoaderManager:*;

		/*
		 * @private 
		 */
		private static var _isInit:*;

		/*
		 * @private 
		 */
		public static var _editerEnvironment:Boolean;

		/*
		 * @private 
		 */
		public static var _config:Config3D;

		/*
		 * @private 
		 */
		public static var physicsSettings:PhysicsSettings;

		/*
		 * 获取是否可以启用物理。
		 * @param 是否启用物理 。
		 */
		public static function get enbalePhysics():*{
				return null;
		}

		/*
		 * @private 
		 */
		public static function _cancelLoadByUrl(url:String):void{}

		/*
		 * @private 
		 */
		private static var _changeWebGLSize:*;

		/*
		 * @private 
		 */
		private static var __init__:*;
		private static var enableNative3D:*;

		/*
		 * @private 
		 */
		private static var formatRelativePath:*;

		/*
		 * @private 
		 */
		private static var _endLoad:*;

		/*
		 * @private 
		 */
		private static var _eventLoadManagerError:*;

		/*
		 * @private 
		 */
		private static var _addHierarchyInnerUrls:*;

		/*
		 * @private 
		 */
		private static var _getSprite3DHierarchyInnerUrls:*;

		/*
		 * @private 
		 */
		private static var _loadHierarchy:*;

		/*
		 * @private 
		 */
		private static var _onHierarchylhLoaded:*;

		/*
		 * @private 
		 */
		private static var _onHierarchyInnerForthLevResouLoaded:*;

		/*
		 * @private 
		 */
		private static var _onHierarchyInnerThirdLevResouLoaded:*;

		/*
		 * @private 
		 */
		private static var _onHierarchyInnerSecondLevResouLoaded:*;

		/*
		 * @private 
		 */
		private static var _onHierarchyInnerFirstLevResouLoaded:*;

		/*
		 * @private 
		 */
		private static var _loadMesh:*;

		/*
		 * @private 
		 */
		private static var _onMeshLmLoaded:*;

		/*
		 * @private 
		 */
		private static var _loadMaterial:*;

		/*
		 * @private 
		 */
		private static var _onMaterilLmatLoaded:*;

		/*
		 * @private 
		 */
		private static var _onMateialTexturesLoaded:*;

		/*
		 * @private 
		 */
		private static var _loadAvatar:*;

		/*
		 * @private 
		 */
		private static var _loadAnimationClip:*;

		/*
		 * @private 
		 */
		private static var _loadTexture2D:*;

		/*
		 * @private 
		 */
		private static var _loadTextureCube:*;

		/*
		 * @private 
		 */
		private static var _onTextureCubeLtcLoaded:*;

		/*
		 * @private 
		 */
		private static var _onTextureCubeImagesLoaded:*;

		/*
		 * @private 
		 */
		private static var _onProcessChange:*;

		/*
		 * 初始化Laya3D相关设置。
		 * @param width 3D画布宽度。
		 * @param height 3D画布高度。
		 */
		public static function init(width:Number,height:Number,config:Config3D = null,compolete:Handler = null):void{}

		/*
		 * 创建一个 <code>Laya3D</code> 实例。
		 */

		public function Laya3D(){}
	}

}
