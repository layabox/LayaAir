package laya.ani.swf {
	import laya.display.Sprite;
	import laya.utils.Byte;
	import laya.utils.Handler;

	/*
	 * 动画播放完毕后调度。
	 * @eventType Event.COMPLETE
	 */

	/*
	 * 播放到某标签后调度。
	 * @eventType Event.LABEL
	 */

	/*
	 * 加载完成后调度。
	 * @eventType Event.LOADED
	 */

	/*
	 * 进入帧后调度。
	 * @eventType Event.FRAME
	 */

	/*
	 * <p> <code>MovieClip</code> 用于播放经过工具处理后的 swf 动画。</p>
	 */
	public class MovieClip extends laya.display.Sprite {

		/*
		 * @private 
		 */
		protected static var _ValueList:Array;

		/*
		 * @private 数据起始位置。
		 */
		protected var _start:Number;

		/*
		 * @private 当前位置。
		 */
		protected var _Pos:Number;

		/*
		 * @private 数据。
		 */
		protected var _data:Byte;

		/*
		 * @private 
		 */
		protected var _curIndex:Number;

		/*
		 * @private 
		 */
		protected var _preIndex:Number;

		/*
		 * @private 
		 */
		protected var _playIndex:Number;

		/*
		 * @private 
		 */
		protected var _playing:Boolean;

		/*
		 * @private 
		 */
		protected var _ended:Boolean;

		/*
		 * @private 总帧数。
		 */
		protected var _count:Number;

		/*
		 * @private 
		 */
		protected var _loadedImage:*;

		/*
		 * @private 
		 */
		protected var _labels:*;

		/*
		 * 资源根目录。
		 */
		public var basePath:String;

		/*
		 * @private 
		 */
		private var _atlasPath:*;

		/*
		 * @private 
		 */
		private var _url:*;

		/*
		 * @private 
		 */
		private var _isRoot:*;

		/*
		 * @private 
		 */
		private var _completeHandler:*;

		/*
		 * @private 
		 */
		private var _endFrame:*;

		/*
		 * 播放间隔(单位：毫秒)。
		 */
		public var interval:Number;

		/*
		 * 是否循环播放
		 */
		public var loop:Boolean;

		/*
		 * 创建一个 <code>MovieClip</code> 实例。
		 * @param parentMovieClip 父MovieClip,自己创建时不需要传该参数
		 */

		public function MovieClip(parentMovieClip:MovieClip = undefined){}

		/*
		 * <p>销毁此对象。以及销毁引用的Texture</p>
		 * @param destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/*
		 * @private 
		 * @override 
		 */
		override protected function _onDisplay(value:Boolean = null):void{}

		/*
		 * @private 更新时间轴
		 */
		public function updates():void{}

		/*
		 * 当前播放索引。
		 */
		public var index:Number;

		/*
		 * 增加一个标签到index帧上，播放到此index后会派发label事件
		 * @param label 标签名称
		 * @param index 索引位置
		 */
		public function addLabel(label:String,index:Number):void{}

		/*
		 * 删除某个标签
		 * @param label 标签名字，如果label为空，则删除所有Label
		 */
		public function removeLabel(label:String):void{}

		/*
		 * 帧总数。
		 */
		public function get count():Number{
				return null;
		}

		/*
		 * 是否在播放中
		 */
		public function get playing():Boolean{
				return null;
		}

		/*
		 * @private 动画的帧更新处理函数。
		 */
		private var _update:*;

		/*
		 * 停止播放动画。
		 */
		public function stop():void{}

		/*
		 * 跳到某帧并停止播放动画。
		 * @param frame 要跳到的帧
		 */
		public function gotoAndStop(index:Number):void{}

		/*
		 * @private 清理。
		 */
		private var _clear:*;

		/*
		 * 播放动画。
		 * @param index 帧索引。
		 */
		public function play(index:Number = null,loop:Boolean = null):void{}

		/*
		 * @private 
		 */
		private var _displayFrame:*;

		/*
		 * @private 
		 */
		private var _reset:*;

		/*
		 * @private 
		 */
		private var _parseFrame:*;

		/*
		 * 资源地址。
		 */
		public var url:String;

		/*
		 * 加载资源。
		 * @param url swf 资源地址。
		 * @param atlas 是否使用图集资源
		 * @param atlasPath 图集路径，默认使用与swf同名的图集
		 */
		public function load(url:String,atlas:Boolean = null,atlasPath:String = null):void{}

		/*
		 * @private 
		 */
		private var _onLoaded:*;

		/*
		 * @private 
		 */
		private var _initState:*;

		/*
		 * @private 
		 */
		private var _initData:*;

		/*
		 * 从开始索引播放到结束索引，结束之后出发complete回调
		 * @param start 开始索引
		 * @param end 结束索引
		 * @param complete 结束回调
		 */
		public function playTo(start:Number,end:Number,complete:Handler = null):void{}
	}

}
