package laya.spine {
	import laya.resource.Texture;
	import laya.resource.Texture2D;
	import laya.resource.Texture;
	import laya.resource.Texture2D;
	public class SpineGLTexture extends Texture {

		public function SpineGLTexture(tex:* = undefined){}
		public function getImage():Object{
			return null;
		}
		public function setFilters(minFilter:spine.TextureFilter,magFilter:spine.TextureFilter):void{}
		public function setWraps(uWrap:spine.TextureWrap,vWrap:spine.TextureWrap):void{}
	}

}
