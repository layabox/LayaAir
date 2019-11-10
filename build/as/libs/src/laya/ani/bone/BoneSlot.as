package laya.ani.bone {
	import laya.ani.bone.Templet;
	import laya.ani.bone.SlotData;
	import laya.ani.bone.SkinSlotDisplayData;
	import laya.ani.GraphicsAni;
	import laya.maths.Matrix;
	import laya.display.Graphics;
	import laya.resource.Texture;
	public class BoneSlot {

		/**
		 * 插槽名称
		 */
		public var name:String;

		/**
		 * 插槽绑定的骨骼名称
		 */
		public var parent:String;

		/**
		 * 插糟显示数据数据的名称
		 */
		public var attachmentName:String;

		/**
		 * 原始数据的索引
		 */
		public var srcDisplayIndex:Number;

		/**
		 * 判断对象是否是原对象
		 */
		public var type:String;

		/**
		 * 模板的指针
		 */
		public var templet:Templet;

		/**
		 * 当前插槽对应的数据
		 */
		public var currSlotData:SlotData;

		/**
		 * 当前插槽显示的纹理
		 */
		public var currTexture:Texture;

		/**
		 * 显示对象对应的数据
		 */
		public var currDisplayData:SkinSlotDisplayData;

		/**
		 * 显示皮肤的索引
		 */
		public var displayIndex:Number;

		/**
		 * @private 
		 */
		public var originalIndex:Number;

		/**
		 * @private 变形动画数据
		 */
		public var deformData:Array;

		/**
		 * 设置要显示的插槽数据
		 * @param slotData 
		 * @param disIndex 
		 * @param freshIndex 是否重置纹理
		 */
		public function showSlotData(slotData:SlotData,freshIndex:Boolean = null):void{}

		/**
		 * 通过名字显示指定对象
		 * @param name 
		 */
		public function showDisplayByName(name:String):void{}

		/**
		 * 替换贴图名
		 * @param tarName 要替换的贴图名
		 * @param newName 替换后的贴图名
		 */
		public function replaceDisplayByName(tarName:String,newName:String):void{}

		/**
		 * 替换贴图索引
		 * @param tarIndex 要替换的索引
		 * @param newIndex 替换后的索引
		 */
		public function replaceDisplayByIndex(tarIndex:Number,newIndex:Number):void{}

		/**
		 * 指定显示对象
		 * @param index 
		 */
		public function showDisplayByIndex(index:Number):void{}

		/**
		 * 替换皮肤
		 * @param _texture 
		 */
		public function replaceSkin(_texture:Texture):void{}

		/**
		 * 保存父矩阵的索引
		 * @param parentMatrix 
		 */
		public function setParentMatrix(parentMatrix:Matrix):void{}
		private var _mVerticleArr:*;
		private static var _tempMatrix:*;
		public static function createSkinMesh():*{}
		private static var isSameArr:*;
		private var getSaveVerticle:*;
		public static function isSameMatrix(mtA:Matrix,mtB:Matrix):Boolean{
			return null;
		}
		private var _preGraphicMatrix:*;
		private static var useSameMatrixAndVerticle:*;
		private var getSaveMatrix:*;

		/**
		 * 把纹理画到Graphics上
		 * @param graphics 
		 * @param noUseSave 不使用共享的矩阵对象 _tempResultMatrix，只有实时计算的时候才设置为true
		 */
		public function draw(graphics:GraphicsAni,boneMatrixArray:Array,noUseSave:Boolean = null,alpha:Number = null):void{}

		/**
		 * 显示蒙皮动画
		 * @param boneMatrixArray 当前帧的骨骼矩阵
		 */
		private var skinMesh:*;

		/**
		 * 画骨骼的起始点，方便调试
		 * @param graphics 
		 */
		public function drawBonePoint(graphics:Graphics):void{}

		/**
		 * 得到显示对象的矩阵
		 * @return 
		 */
		private var getDisplayMatrix:*;

		/**
		 * 得到插糟的矩阵
		 * @return 
		 */
		public function getMatrix():Matrix{
			return null;
		}

		/**
		 * 用原始数据拷贝出一个
		 * @return 
		 */
		public function copy():BoneSlot{
			return null;
		}
	}

}
