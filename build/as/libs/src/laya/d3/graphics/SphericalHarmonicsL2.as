package laya.d3.graphics {

	/**
	 * 二阶球谐函数。
	 */
	public class SphericalHarmonicsL2 {

		/**
		 * 获取颜色通道的系数。
		 * @param i 通道索引，范围0到2。
		 * @param j 系数索引，范围0到8。
		 */
		public function getCoefficient(i:Number,j:Number):Number{
			return null;
		}

		/**
		 * 设置颜色通道的系数。
		 * @param i 通道索引，范围0到2。
		 * @param j 系数索引，范围0到8。
		 */
		public function setCoefficient(i:Number,j:Number,coefficient:Number):void{}

		/**
		 * 设置颜色通道的系数。
		 * @param i 通道索引，范围0到2。
		 * @param coefficient0 系数0
		 * @param coefficient1 系数1
		 * @param coefficient2 系数2
		 * @param coefficient3 系数3
		 * @param coefficient4 系数4
		 * @param coefficient5 系数5
		 * @param coefficient6 系数6
		 * @param coefficient7 系数7
		 * @param coefficient8 系数8
		 */
		public function setCoefficients(i:Number,coefficient0:Number,coefficient1:Number,coefficient2:Number,coefficient3:Number,coefficient4:Number,coefficient5:Number,coefficient6:Number,coefficient7:Number,coefficient8:Number):void{}

		/**
		 * 克隆
		 * @param dest 
		 */
		public function cloneTo(dest:SphericalHarmonicsL2):void{}
	}

}
