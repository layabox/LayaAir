import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";
import TextureFilter = spine.TextureFilter;
import TextureWrap = spine.TextureWrap;

export class SpineGLTexture extends Texture {
	constructor (tex: Texture2D | Texture) {
		super(tex);
	}

	getImage (): Object {
		return {
			width: this.sourceWidth,
			height: this.sourceHeight
		};
	}

	setFilters (minFilter: TextureFilter, magFilter: TextureFilter) {

	}

	setWraps (uWrap: TextureWrap, vWrap: TextureWrap) {

	}
}