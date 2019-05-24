package laya.ani {
	
	/**
	 * @private
	 * @author ...
	 */
	public class KeyFramesContent {
		//TODO 这个对内存影响较大，建议减少一下
		public var startTime:Number;
		public var duration:Number;
		public var interpolationData:Array;//私有插值方式 [type0(插值类型),Data0(插值数据,可为空)，type1(插值类型),Data1(插值数据,可为空)] 注意：254全线性插值，255全不插值
		public var data:Float32Array;//= new Float32Array();	数据
		public var dData:Float32Array;//= new Float32Array();	数据变化量
		public var nextData:Float32Array;//= new Float32Array();
	
	}

}