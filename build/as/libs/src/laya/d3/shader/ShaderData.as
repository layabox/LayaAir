package laya.d3.shader {
	import laya.resource.BaseTexture;
	import laya.d3.core.IClone;
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Quaternion;
	import laya.d3.math.Vector2;
	import laya.d3.math.Vector3;
	import laya.d3.math.Vector4;
	import laya.d3.shader.ShaderDefine;

	/**
	 * 着色器数据类。
	 */
	public class ShaderData implements IClone {

		/**
		 * 增加Shader宏定义。
		 * @param value 宏定义。
		 */
		public function addDefine(define:ShaderDefine):void{}

		/**
		 * 移除Shader宏定义。
		 * @param value 宏定义。
		 */
		public function removeDefine(define:ShaderDefine):void{}

		/**
		 * 是否包含Shader宏定义。
		 * @param value 宏定义。
		 */
		public function hasDefine(define:ShaderDefine):Boolean{
			return null;
		}

		/**
		 * 清空宏定义。
		 */
		public function clearDefine():void{}

		/**
		 * 获取布尔。
		 * @param index shader索引。
		 * @return 布尔。
		 */
		public function getBool(index:Number):Boolean{
			return null;
		}

		/**
		 * 设置布尔。
		 * @param index shader索引。
		 * @param value 布尔。
		 */
		public function setBool(index:Number,value:Boolean):void{}

		/**
		 * 获取整形。
		 * @param index shader索引。
		 * @return 整形。
		 */
		public function getInt(index:Number):Number{
			return null;
		}

		/**
		 * 设置整型。
		 * @param index shader索引。
		 * @param value 整形。
		 */
		public function setInt(index:Number,value:Number):void{}

		/**
		 * 获取浮点。
		 * @param index shader索引。
		 * @return 浮点。
		 */
		public function getNumber(index:Number):Number{
			return null;
		}

		/**
		 * 设置浮点。
		 * @param index shader索引。
		 * @param value 浮点。
		 */
		public function setNumber(index:Number,value:Number):void{}

		/**
		 * 获取Vector2向量。
		 * @param index shader索引。
		 * @return Vector2向量。
		 */
		public function getVector2(index:Number):Vector2{
			return null;
		}

		/**
		 * 设置Vector2向量。
		 * @param index shader索引。
		 * @param value Vector2向量。
		 */
		public function setVector2(index:Number,value:Vector2):void{}

		/**
		 * 获取Vector3向量。
		 * @param index shader索引。
		 * @return Vector3向量。
		 */
		public function getVector3(index:Number):Vector3{
			return null;
		}

		/**
		 * 设置Vector3向量。
		 * @param index shader索引。
		 * @param value Vector3向量。
		 */
		public function setVector3(index:Number,value:Vector3):void{}

		/**
		 * 获取颜色。
		 * @param index shader索引。
		 * @return 颜色向量。
		 */
		public function getVector(index:Number):Vector4{
			return null;
		}

		/**
		 * 设置向量。
		 * @param index shader索引。
		 * @param value 向量。
		 */
		public function setVector(index:Number,value:Vector4):void{}

		/**
		 * 获取四元数。
		 * @param index shader索引。
		 * @return 四元。
		 */
		public function getQuaternion(index:Number):Quaternion{
			return null;
		}

		/**
		 * 设置四元数。
		 * @param index shader索引。
		 * @param value 四元数。
		 */
		public function setQuaternion(index:Number,value:Quaternion):void{}

		/**
		 * 获取矩阵。
		 * @param index shader索引。
		 * @return 矩阵。
		 */
		public function getMatrix4x4(index:Number):Matrix4x4{
			return null;
		}

		/**
		 * 设置矩阵。
		 * @param index shader索引。
		 * @param value 矩阵。
		 */
		public function setMatrix4x4(index:Number,value:Matrix4x4):void{}

		/**
		 * 获取Buffer。
		 * @param index shader索引。
		 * @return 
		 */
		public function getBuffer(shaderIndex:Number):Float32Array{
			return null;
		}

		/**
		 * 设置Buffer。
		 * @param index shader索引。
		 * @param value buffer数据。
		 */
		public function setBuffer(index:Number,value:Float32Array):void{}

		/**
		 * 设置纹理。
		 * @param index shader索引。
		 * @param value 纹理。
		 */
		public function setTexture(index:Number,value:BaseTexture):void{}

		/**
		 * 获取纹理。
		 * @param index shader索引。
		 * @return 纹理。
		 */
		public function getTexture(index:Number):BaseTexture{
			return null;
		}

		/**
		 * 设置Attribute。
		 * @param index shader索引。
		 * @param value 纹理。
		 */
		public function setAttribute(index:Number,value:Int32Array):void{}

		/**
		 * 获取Attribute。
		 * @param index shader索引。
		 * @return 纹理。
		 */
		public function getAttribute(index:Number):Array{
			return null;
		}

		/**
		 * 获取长度。
		 * @return 长度。
		 */
		public function getLength():Number{
			return null;
		}

		/**
		 * 设置长度。
		 * @param 长度 。
		 */
		public function setLength(value:Number):void{}

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

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneToForNative(destObject:*):void{}
		public function needRenewArrayBufferForNative(index:Number):void{}
		public function getDataForNative():Array{
			return null;
		}
		public function setReferenceForNative(value:*):Number{
			return null;
		}
		public static function setRuntimeValueMode(bReference:Boolean):void{}
		public function clearRuntimeCopyArray():void{}
	}

}
