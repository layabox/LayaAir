/*[IF-FLASH]*/
package laya.ani.bone {
	improt laya.ani.bone.Templet;
	improt laya.ani.bone.SlotData;
	improt laya.ani.bone.SkinSlotDisplayData;
	improt laya.ani.GraphicsAni;
	improt laya.maths.Matrix;
	improt laya.display.Graphics;
	improt laya.resource.Texture;
	public class BoneSlot {
		public var name:String;
		public var parent:String;
		public var attachmentName:String;
		public var srcDisplayIndex:Number;
		public var type:String;
		public var templet:Templet;
		public var currSlotData:SlotData;
		public var currTexture:Texture;
		public var currDisplayData:SkinSlotDisplayData;
		public var displayIndex:Number;
		public var originalIndex:Number;
		private var _diyTexture:*;
		private var _parentMatrix:*;
		private var _resultMatrix:*;
		private var _replaceDic:*;
		private var _curDiyUV:*;
		private var _skinSprite:*;
		public var deformData:Array;
		public function showSlotData(slotData:SlotData,freshIndex:Boolean = null):void{}
		public function showDisplayByName(name:String):void{}
		public function replaceDisplayByName(tarName:String,newName:String):void{}
		public function replaceDisplayByIndex(tarIndex:Number,newIndex:Number):void{}
		public function showDisplayByIndex(index:Number):void{}
		public function replaceSkin(_texture:Texture):void{}
		public function setParentMatrix(parentMatrix:Matrix):void{}
		private var _mVerticleArr:*;
		private static var _tempMatrix:*;
		public static function createSkinMesh():*{}
		private static var isSameArr:*;
		private static var _tempResultMatrix:*;
		private var _preGraphicVerticle:*;
		private var getSaveVerticle:*;
		public static function isSameMatrix(mtA:Matrix,mtB:Matrix):Boolean{}
		private var _preGraphicMatrix:*;
		private static var useSameMatrixAndVerticle:*;
		private var getSaveMatrix:*;
		public function draw(graphics:GraphicsAni,boneMatrixArray:Array,noUseSave:Boolean = null,alpha:Number = null):void{}
		private static var _tempVerticleArr:*;
		private var skinMesh:*;
		public function drawBonePoint(graphics:Graphics):void{}
		private var getDisplayMatrix:*;
		public function getMatrix():Matrix{}
		public function copy():BoneSlot{}
	}

}
