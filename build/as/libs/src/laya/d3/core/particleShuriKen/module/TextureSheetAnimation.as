package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.particleShuriKen.module.FrameOverTime;
	import laya.d3.core.particleShuriKen.module.StartFrame;
	import laya.d3.core.IClone;
	import laya.d3.math.Vector2;

	/**
	 * <code>TextureSheetAnimation</code> 类用于创建粒子帧动画。
	 */
	public class TextureSheetAnimation implements IClone {

		/**
		 * 纹理平铺。
		 */
		public var tiles:Vector2;

		/**
		 * 类型,0为whole sheet、1为singal row。
		 */
		public var type:Number;

		/**
		 * 是否随机行，type为1时有效。
		 */
		public var randomRow:Boolean;

		/**
		 * 行索引,type为1时有效。
		 */
		public var rowIndex:Number;

		/**
		 * 循环次数。
		 */
		public var cycles:Number;

		/**
		 * UV通道类型,0为Noting,1为Everything,待补充,暂不支持。
		 */
		public var enableUVChannels:Number;

		/**
		 * 是否启用
		 */
		public var enable:Boolean;

		/**
		 * 获取时间帧率。
		 */
		public function get frame():FrameOverTime{
				return null;
		}

		/**
		 * 获取开始帧率。
		 */
		public function get startFrame():StartFrame{
				return null;
		}

		/**
		 * 创建一个 <code>TextureSheetAnimation</code> 实例。
		 * @param frame 动画帧。
		 * @param startFrame 开始帧。
		 */

		public function TextureSheetAnimation(frame:FrameOverTime = undefined,startFrame:StartFrame = undefined){}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
