/*[IF-FLASH]*/
package laya.d3.core.particleShuriKen.module {
	improt laya.d3.core.particleShuriKen.module.FrameOverTime;
	improt laya.d3.core.particleShuriKen.module.StartFrame;
	improt laya.d3.core.IClone;
	improt laya.d3.math.Vector2;
	public class TextureSheetAnimation implements laya.d3.core.IClone {
		public var tiles:Vector2;
		public var type:Number;
		public var randomRow:Boolean;
		public var rowIndex:Number;
		public var cycles:Number;
		public var enableUVChannels:Number;
		public var enable:Boolean;
		public function get frame():FrameOverTime{};
		public function get startFrame():StartFrame{};

		public function TextureSheetAnimation(frame:FrameOverTime,startFrame:StartFrame){}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
	}

}
