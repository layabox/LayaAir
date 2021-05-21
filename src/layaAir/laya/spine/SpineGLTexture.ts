import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";

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

	setFilters (minFilter: spine.TextureFilter, magFilter: spine.TextureFilter) {

	}

	setWraps (uWrap: spine.TextureWrap, vWrap: spine.TextureWrap) {

	}
}