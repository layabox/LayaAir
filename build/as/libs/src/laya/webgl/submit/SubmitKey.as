/*[IF-FLASH]*/
package laya.webgl.submit {
	public class SubmitKey {
		public var blendShader:Number;
		public var submitType:Number;
		public var other:Number;

		public function SubmitKey(){}
		public function clear():void{}
		public function copyFrom(src:SubmitKey):void{}
		public function copyFrom2(src:SubmitKey,submitType:Number,other:Number):void{}
		public function equal3_2(next:SubmitKey,submitType:Number,other:Number):Boolean{}
		public function equal4_2(next:SubmitKey,submitType:Number,other:Number):Boolean{}
		public function equal_3(next:SubmitKey):Boolean{}
		public function equal(next:SubmitKey):Boolean{}
	}

}
