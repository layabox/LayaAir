package laya.webgl.text {
	import laya.resource.Context;
	import laya.resource.Texture;

	/**
	 * ...
	 * @author laoxie
	 */
	public class CharSubmitCache {
		private static var __posPool:*;
		private static var __nPosPool:*;
		private var _data:*;
		private var _ndata:*;
		private var _tex:*;
		private var _imgId:*;
		private var _clipid:*;
		private var _clipMatrix:*;

		public function CharSubmitCache(){}
		public function clear():void{}
		public function destroy():void{}
		public function add(ctx:Context,tex:Texture,imgid:Number,pos:Array,uv:Array,color:Number):void{}
		public function getPos():Array{
			return null;
		}
		public function enable(value:Boolean,ctx:Context):void{}
		public function submit(ctx:Context):void{}
	}

}
