package laya.gltf {
	import laya.d3.resource.models.Mesh;
	import laya.gltf.glTFSkin;
	import laya.d3.core.SkinnedMeshSprite3D;
	import laya.d3.core.MeshSprite3D;
	import laya.gltf.glTFNode;
	import laya.d3.core.Sprite3D;
	import laya.gltf.glTFScene;
	import laya.gltf.glTFMesh;
	import laya.gltf.glTFMaterialPbrMetallicRoughness;
	import laya.d3.core.material.PBRStandardMaterial;
	import laya.gltf.glTFMaterial;
	import laya.resource.Texture2D;
	import laya.gltf.glTFTextureInfo;
	import laya.gltf.glTFTextureWrapMode;
	import laya.gltf.glTFImage;
	import laya.gltf.glTFSampler;
	import laya.gltf.glTFAccessorType;
	import laya.utils.Handler;
	import laya.gltf.glTFInterface;
	import laya.d3.core.Sprite3D;
	import laya.resource.Texture2D;
	import laya.d3.resource.models.Mesh;
	import laya.d3.core.material.Material;
	import laya.d3.core.material.PBRStandardMaterial;
	import laya.d3.core.SkinnedMeshSprite3D;
	import laya.d3.core.MeshSprite3D;
	import laya.utils.Handler;

	/**
	 * <code>glTFUtils<code> 用于解析 glTF 2.0 对象
	 */
	public class glTFUtils {
		public static var Extensions:*;

		/**
		 * 保存 extra 处理函数对象
		 */
		public static var Extras:*;

		/**
		 * 注册 extra 处理函数
		 * @param context 
		 * @param extraName 
		 * @param handler 
		 */
		public static function RegisterExtra(context:String,extraName:String,handler:Handler):void{}

		/**
		 * 取消注册 extra 处理函数
		 * @param context 
		 * @param extraName 
		 * @param recoverHandler 
		 */
		public static function UnRegisterExtra(context:String,extraName:String,recoverHandler:Boolean = null):void{}

		/**
		 * 根据数据类型获取分量
		 * @param type 
		 */
		public static function getAccessorComponentsNum(type:glTFAccessorType):Number{
			return null;
		}

		/**
		 * 获取 attribute 分量
		 * @param attriStr 
		 */
		public static function getAttributeNum(attriStr:String):Number{
			return null;
		}

		/**
		 * 获取 accessor buffer 数据
		 * @param accessorIndex 
		 */
		public static function getBufferwithAccessorIndex(accessorIndex:Number):*{}

		/**
		 * 判断 Texture 是否需要 mipmap
		 * @param glTFImage 
		 * @param glTFSampler 
		 */
		public static function getTextureMipmap(glTFSampler:glTFSampler):Boolean{
			return null;
		}

		/**
		 * 获取 Texture format
		 * @param glTFImage 
		 */
		public static function getTextureFormat(glTFImage:glTFImage):Number{
			return null;
		}

		/**
		 * 获取 Texture filter mode
		 * @param glTFSampler 
		 */
		public static function getTextureFilterMode(glTFSampler:glTFSampler):Number{
			return null;
		}

		/**
		 * 获取 Texture warp mode
		 * @param mode 
		 */
		public static function getTextureWrapMode(mode:glTFTextureWrapMode):Number{
			return null;
		}

		/**
		 * 获取 Texture 初始化参数
		 * @param glTFImage 
		 * @param glTFSampler 
		 */
		public static function getTextureConstructParams(glTFImage:glTFImage,glTFSampler:glTFSampler):Array{
			return null;
		}

		/**
		 * 获取 Texture 属性参数
		 * @param glTFImage 
		 * @param glTFSampler 
		 */
		public static function getTexturePropertyParams(glTFSampler:glTFSampler):*{}

		/**
		 * 根据 glTFTextureInfo 获取 Texture2D
		 * @param glTFTextureInfo 
		 */
		public static function getTexturewithInfo(glTFTextureInfo:glTFTextureInfo):Texture2D{
			return null;
		}

		/**
		 * 根据 glTFMaterial 节点数据创建 default Material
		 * @param glTFMaterial 
		 */
		public static function _createdefaultMaterial(glTFMaterial:glTFMaterial):PBRStandardMaterial{
			return null;
		}

		/**
		 * 应用 pbrMetallicRoughness 数据
		 * @param pbrMetallicRoughness 
		 * @param layaPBRMaterial 
		 */
		public static function applyPBRMetallicRoughness(pbrMetallicRoughness:glTFMaterialPbrMetallicRoughness,layaPBRMaterial:PBRStandardMaterial):void{}

		/**
		 * 获取 gltf mesh 中 material
		 * @param glTFMesh 
		 */
		public static function pickMeshMaterials(glTFMesh:glTFMesh):Array{
			return null;
		}

		/**
		 * 创建 glTFScene 节点
		 * @param glTFScene 
		 */
		public static function _createSceneNode(glTFScene:glTFScene):Sprite3D{
			return null;
		}

		/**
		 * 应用 Transform 信息
		 * @param glTFNode 
		 * @param sprite 
		 */
		public static function applyTransform(glTFNode:glTFNode,sprite:Sprite3D):void{}

		/**
		 * 创建 节点对象
		 * @param glTFNode 
		 */
		public static function _createSprite3D(glTFNode:glTFNode):Sprite3D{
			return null;
		}

		/**
		 * 创建 MeshSprite3D 对象
		 * @param glTFNode 
		 */
		public static function _createMeshSprite3D(glTFNode:glTFNode):MeshSprite3D{
			return null;
		}

		/**
		 * 创建 MeshSprite3D 对象
		 * @param glTFNode 
		 */
		public static function _createSkinnedMeshSprite3D(glTFNode:glTFNode):SkinnedMeshSprite3D{
			return null;
		}

		/**
		 * 创建 Mesh
		 * @param mesh 
		 */
		public static function _createMesh(glTFMesh:glTFMesh,glTFSkin:glTFSkin = null):Mesh{
			return null;
		}

		/**
		 * 计算 SkinnedMeshSprite3D local bounds
		 * @param skinned 
		 */
		public static function calSkinnedSpriteLocalBounds(skinned:SkinnedMeshSprite3D):void{}

		/**
		 * @interna 获取 Animator 根节点
		 */
		public static function getAnimationRoot(channels:Array):Sprite3D{
			return null;
		}
	}

}
