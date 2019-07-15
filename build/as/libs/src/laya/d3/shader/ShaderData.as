/*[IF-FLASH]*/
package laya.d3.shader {
	improt laya.resource.BaseTexture;
	improt laya.d3.core.IClone;
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.math.Quaternion;
	improt laya.d3.math.Vector2;
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Vector4;
	public class ShaderData implements laya.d3.core.IClone {
		public function addDefine(define:Number):void{}
		public function removeDefine(define:Number):void{}
		public function hasDefine(define:Number):Boolean{}
		public function clearDefine():void{}
		public function getBool(index:Number):Boolean{}
		public function setBool(index:Number,value:Boolean):void{}
		public function getInt(index:Number):Number{}
		public function setInt(index:Number,value:Number):void{}
		public function getNumber(index:Number):Number{}
		public function setNumber(index:Number,value:Number):void{}
		public function getVector2(index:Number):Vector2{}
		public function setVector2(index:Number,value:Vector2):void{}
		public function getVector3(index:Number):Vector3{}
		public function setVector3(index:Number,value:Vector3):void{}
		public function getVector(index:Number):Vector4{}
		public function setVector(index:Number,value:Vector4):void{}
		public function getQuaternion(index:Number):Quaternion{}
		public function setQuaternion(index:Number,value:Quaternion):void{}
		public function getMatrix4x4(index:Number):Matrix4x4{}
		public function setMatrix4x4(index:Number,value:Matrix4x4):void{}
		public function getBuffer(shaderIndex:Number):Float32Array{}
		public function setBuffer(index:Number,value:Float32Array):void{}
		public function setTexture(index:Number,value:BaseTexture):void{}
		public function getTexture(index:Number):BaseTexture{}
		public function setAttribute(index:Number,value:Int32Array):void{}
		public function getAttribute(index:Number):Array{}
		public function getLength():Number{}
		public function setLength(value:Number):void{}
		public function cloneTo(destObject:*):void{}
		public function clone():*{}
		public function cloneToForNative(destObject:*):void{}
		public function needRenewArrayBufferForNative(index:Number):void{}
		public function getDataForNative():Array{}
		public function setReferenceForNative(value:*):Number{}
		public static function setRuntimeValueMode(bReference:Boolean):void{}
		public function clearRuntimeCopyArray():void{}
	}

}
