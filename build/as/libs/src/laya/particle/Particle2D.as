package laya.particle {
	import laya.display.Sprite;
	import laya.particle.ParticleSetting;
	import laya.resource.Context;
	import laya.particle.emitter.EmitterBase;

	/**
	 * <code>Particle2D</code> 类是2D粒子播放类
	 */
	public class Particle2D extends Sprite {

		/**
		 * @private 
		 */
		private var _matrix4:*;

		/**
		 * @private 
		 */
		private var _particleTemplate:*;

		/**
		 * @private 
		 */
		private var _canvasTemplate:*;

		/**
		 * @private 
		 */
		private var _emitter:*;

		/**
		 * 是否自动播放
		 */
		public var autoPlay:Boolean;
		public var tempCmd:*;

		/**
		 * 创建一个新的 <code>Particle2D</code> 类实例。
		 * @param setting 粒子配置数据
		 */

		public function Particle2D(setting:ParticleSetting = undefined){}

		/**
		 * 设置 粒子文件地址
		 * @param path 粒子文件地址
		 */
		public var url:String;

		/**
		 * 加载粒子文件
		 * @param url 粒子文件地址
		 */
		public function load(url:String):void{}

		/**
		 * 设置粒子配置数据
		 * @param settings 粒子配置数据
		 */
		public function setParticleSetting(setting:ParticleSetting):void{}

		/**
		 * 获取粒子发射器
		 */
		public function get emitter():EmitterBase{
				return null;
		}

		/**
		 * 播放
		 */
		public function play():void{}

		/**
		 * 停止
		 */
		public function stop():void{}

		/**
		 * @private 
		 */
		private var _loop:*;

		/**
		 * 时钟前进
		 * @param passedTime 时钟前进时间
		 */
		public function advanceTime(passedTime:Number = null):void{}

		/**
		 * @param context 
		 * @param x 
		 * @param y 
		 * @override 
		 */
		override public function customRender(context:Context,x:Number,y:Number):void{}

		/**
		 * @param destroyChild 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}
	}

}
