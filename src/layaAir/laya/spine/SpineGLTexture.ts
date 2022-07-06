import { BaseTexture } from "../resource/BaseTexture";
import { Texture } from "../resource/Texture";

export class SpineGLTexture extends Texture {
	constructor (tex: BaseTexture | Texture) {
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