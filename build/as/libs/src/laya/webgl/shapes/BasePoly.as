package laya.webgl.shapes {
	public class BasePoly {
		private static var tempData:*;

		/**
		 * 构造线的三角形数据。根据一个位置数组生成vb和ib
		 * @param p 
		 * @param indices 
		 * @param lineWidth 
		 * @param indexBase 顶点开始的值，ib中的索引会加上这个
		 * @param outVertex 
		 * @return 
		 */
		public static function createLine2(p:Array,indices:Array,lineWidth:Number,indexBase:Number,outVertex:Array,loop:Boolean):Array{
			return null;
		}

		/**
		 * 相邻的两段线，边界会相交，这些交点可以作为三角形的顶点。有两种可选，一种是采用左左,右右交点，一种是采用 左右，左右交点。当两段线夹角很小的时候，如果采用
		 * 左左，右右会产生很长很长的交点，这时候就要采用左右左右交点，相当于把尖角截断。
		 * 当采用左左右右交点的时候，直接用切线的垂线。采用左右左右的时候，用切线
		 * 切线直接采用两个方向的平均值。不能用3-1的方式，那样垂线和下一段可能都在同一方向（例如都在右方）
		 * 注意把重合的点去掉
		 * @param path 
		 * @param color 
		 * @param width 
		 * @param loop 
		 * @param outvb 
		 * @param vbstride 顶点占用几个float,(bytelength/4)
		 * @param outib test:横线[100,100, 400,100]竖线[100,100, 100,400]直角[100,100, 400,100, 400,400]重合点[100,100,100,100,400,100]同一直线上的点[100,100,100,200,100,3000]像老式电视的左边不封闭的图形[98,176,  163,178, 95,66, 175,177, 198,178, 252,56, 209,178,  248,175,  248,266,  209,266, 227,277, 203,280, 188,271,  150,271, 140,283, 122,283, 131,268, 99,268]
		 */
		public static function createLineTriangle(path:Array,color:Number,width:Number,loop:Boolean,outvb:Float32Array,vbstride:Number,outib:Uint16Array):void{}
	}

}
