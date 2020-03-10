package laya.ani.bone {
	import laya.ani.bone.Bone;
	import laya.ani.AnimationTemplet;
	import laya.ani.bone.SkinSlotDisplayData;
	import laya.resource.Texture;
	import laya.maths.Matrix;
	import laya.display.Graphics;
	import laya.ani.bone.Skeleton;

	/**
	 * 数据解析完成后的调度。
	 * @eventType Event.COMPLETE
	 */

	/**
	 * 数据解析错误后的调度。
	 * @eventType Event.ERROR
	 */

	/**
	 * 动画模板类
	 */
	public class Templet extends AnimationTemplet {

		/**
		 * 存放原始骨骼信息
		 */
		public var srcBoneMatrixArr:Array;

		/**
		 * IK数据
		 */
		public var ikArr:Array;

		/**
		 * transform数据
		 */
		public var tfArr:Array;

		/**
		 * path数据
		 */
		public var pathArr:Array;

		/**
		 * 存放插槽数据的字典
		 */
		public var boneSlotDic:*;

		/**
		 * 绑定插槽数据的字典
		 */
		public var bindBoneBoneSlotDic:*;

		/**
		 * 存放插糟数据的数组
		 */
		public var boneSlotArray:Array;

		/**
		 * 皮肤数据
		 */
		public var skinDataArray:Array;

		/**
		 * 皮肤的字典数据
		 */
		public var skinDic:*;

		/**
		 * 存放纹理数据
		 */
		public var subTextureDic:*;

		/**
		 * 是否解析失败
		 */
		public var isParseFail:Boolean;

		/**
		 * 反转矩阵，有些骨骼动画要反转才能显示
		 */
		public var yReverseMatrix:Matrix;

		/**
		 * 渲染顺序动画数据
		 */
		public var drawOrderAniArr:Array;

		/**
		 * 事件动画数据
		 */
		public var eventAniArr:Array;

		/**
		 * @private 索引对应的名称
		 */
		public var attachmentNames:Array;

		/**
		 * 顶点动画数据
		 */
		public var deformAniArr:Array;

		/**
		 * 实际显示对象列表，用于销毁用
		 */
		public var skinSlotDisplayDataArr:Array;
		public var isParserComplete:Boolean;
		public var aniSectionDic:*;

		/**
		 * @private 
		 */
		public var tMatrixDataLen:Number;
		public var mRootBone:Bone;
		public var mBoneArr:Array;
		public function loadAni(url:String):void{}
		private var onComplete:*;

		/**
		 * 解析骨骼动画数据
		 * @param texture 骨骼动画用到的纹理
		 * @param skeletonData 骨骼动画信息及纹理分块信息
		 * @param playbackRate 缓冲的帧率数据（会根据帧率去分帧）
		 */
		public function parseData(texture:Texture,skeletonData:ArrayBuffer,playbackRate:Number = null):void{}

		/**
		 * 创建动画
		 * 0,使用模板缓冲的数据，模板缓冲的数据，不允许修改					（内存开销小，计算开销小，不支持换装）
		 * 1,使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存	（内存开销大，计算开销小，支持换装）
		 * 2,使用动态方式，去实时去画										（内存开销小，计算开销大，支持换装,不建议使用）
		 * @param aniMode 0	动画模式，0:不支持换装,1,2支持换装
		 * @return 
		 */
		public function buildArmature(aniMode:Number = null):Skeleton{
			return null;
		}

		/**
		 * @private 解析动画
		 * @param data 解析的二进制数据
		 * @param playbackRate 帧率
		 * @override 
		 */
		override public function parse(data:ArrayBuffer):void{}

		/**
		 * 得到指定的纹理
		 * @param name 纹理的名字
		 * @return 
		 */
		public function getTexture(name:String):Texture{
			return null;
		}

		/**
		 * @private 显示指定的皮肤
		 * @param boneSlotDic 插糟字典的引用
		 * @param skinIndex 皮肤的索引
		 * @param freshDisplayIndex 是否重置插槽纹理
		 */
		public function showSkinByIndex(boneSlotDic:*,skinIndex:Number,freshDisplayIndex:Boolean = null):Boolean{
			return null;
		}

		/**
		 * 通过皮肤名字得到皮肤索引
		 * @param skinName 皮肤名称
		 * @return 
		 */
		public function getSkinIndexByName(skinName:String):Number{
			return null;
		}

		/**
		 * @private 得到缓冲数据
		 * @param aniIndex 动画索引
		 * @param frameIndex 帧索引
		 * @return 
		 */
		public function getGrahicsDataWithCache(aniIndex:Number,frameIndex:Number):Graphics{
			return null;
		}

		/**
		 * @private 保存缓冲grahpics
		 * @param aniIndex 动画索引
		 * @param frameIndex 帧索引
		 * @param graphics 要保存的数据
		 */
		public function setGrahicsDataWithCache(aniIndex:Number,frameIndex:Number,graphics:Graphics):void{}
		public function deleteAniData(aniIndex:Number):void{}

		/**
		 * 释放纹理
		 * @override 
		 */
		override public function destroy():void{}

		/**
		 * *********************************下面为一些儿访问接口****************************************
		 */

		/**
		 * 通过索引得动画名称
		 * @param index 
		 * @return 
		 */
		public function getAniNameByIndex(index:Number):String{
			return null;
		}
		public var rate:Number;
	}

}
