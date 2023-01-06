import { Resource } from "./Resource";
import { Texture } from "./Texture";
/**
 * 大图合集资源
 */
export class AtlasResource extends Resource {
    readonly dir: string;
    readonly textures: Array<Texture>;
    readonly frames: Array<Texture>;

    /**
     * 实例化体格大图合集资源
     * @param dir 
     * @param textures 
     * @param frames 
     */
    constructor(dir: string, textures: Array<Texture>, frames: Array<Texture>) {
        super();

        this.dir = dir;
        this.textures = textures;
        this.frames = frames;
        this.lock = true;
    }

    /**
     * @internal
     */
    protected _disposeResource(): void {
        for (let tex of this.textures) {
            if (tex)
                tex.destroy();
        }

        for (let tex of this.frames)
            tex.destroy();

        this.frames.length = 0;
        this.textures.length = 0;
    }
}