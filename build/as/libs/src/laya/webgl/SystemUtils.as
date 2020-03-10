package laya.webgl {

	/**
	 * 系统工具。
	 */
	public class SystemUtils {

		/**
		 * 图形设备支持的最大纹理数量。
		 */
		public static function get maxTextureCount():Number{
				return null;
		}

		/**
		 * 图形设备支持的最大纹理尺寸。
		 */
		public static function get maxTextureSize():Number{
				return null;
		}

		/**
		 * 图形设备着色器的大致能力等级,类似于DirectX的shader model概念。
		 */
		public static function get shaderCapailityLevel():Number{
				return null;
		}

		/**
		 * 是否支持纹理格式。
		 * @param format 纹理格式。
		 * @returns 是否支持。
		 */
		public static function supportTextureFormat(format:Number):Boolean{
			return null;
		}

		/**
		 * 是否支持渲染纹理格式。
		 * @param format 渲染纹理格式。
		 * @returns 是否支持。
		 */
		public static function supportRenderTextureFormat(format:Number):Boolean{
			return null;
		}
	}

}
