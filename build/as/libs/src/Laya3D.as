/*[IF-FLASH]*/
package  {

	improt laya.utils.Handler;
	improt laya.d3.physics.PhysicsSettings;
	public class Laya3D {
		public static var HIERARCHY:String;
		public static var MESH:String;
		public static var MATERIAL:String;
		public static var TEXTURE2D:String;
		public static var TEXTURECUBE:String;
		public static var ANIMATIONCLIP:String;
		public static var AVATAR:String;
		public static var TERRAINHEIGHTDATA:String;
		public static var TERRAINRES:String;
		private static var _innerFirstLevelLoaderManager:*;
		private static var _innerSecondLevelLoaderManager:*;
		private static var _innerThirdLevelLoaderManager:*;
		private static var _innerFourthLevelLoaderManager:*;
		private static var _isInit:*;
		public static var _editerEnvironment:Boolean;
		public static var _config:Config3D;
		public static var physicsSettings:PhysicsSettings;
		public static function get enbalePhysics():*{};
		public static function _cancelLoadByUrl(url:String):void{}
		private static var _changeWebGLSize:*;
		private static var __init__:*;
		private static var enableNative3D:*;
		private static var formatRelativePath:*;
		private static var _endLoad:*;
		private static var _eventLoadManagerError:*;
		private static var _addHierarchyInnerUrls:*;
		private static var _getSprite3DHierarchyInnerUrls:*;
		private static var _loadHierarchy:*;
		private static var _onHierarchylhLoaded:*;
		private static var _onHierarchyInnerForthLevResouLoaded:*;
		private static var _onHierarchyInnerThirdLevResouLoaded:*;
		private static var _onHierarchyInnerSecondLevResouLoaded:*;
		private static var _onHierarchyInnerFirstLevResouLoaded:*;
		private static var _loadMesh:*;
		private static var _onMeshLmLoaded:*;
		private static var _loadMaterial:*;
		private static var _onMaterilLmatLoaded:*;
		private static var _onMateialTexturesLoaded:*;
		private static var _loadAvatar:*;
		private static var _loadAnimationClip:*;
		private static var _loadTexture2D:*;
		private static var _loadTextureCube:*;
		private static var _onTextureCubeLtcLoaded:*;
		private static var _onTextureCubeImagesLoaded:*;
		private static var _onProcessChange:*;
		public static function init(width:Number,height:Number,config:Config3D = null,compolete:Handler = null):void{}

		public function Laya3D(){}
	}

}
