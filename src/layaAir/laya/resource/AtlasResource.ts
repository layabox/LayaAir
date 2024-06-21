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

    // get referenceCount(): number {
    //     let count = 0;
    //      this.textures.forEach((tex) => {
    //          count += tex.referenceCount;
    //     })
    //     return count;
    // }

    // _removeReference(count: number = 1): void {
    //     //this._referenceCount -= count;
    //     //如果_removeReference发生在destroy中，可能是在collect或者处理内嵌资源的释放
    //     if (this.referenceCount <= 0 && !this.lock && this.destroyedImmediately) {
    //         this.destroy();
    //     }
    // }

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