import { Resource } from "./Resource";
import { Texture } from "./Texture";
/**
 * @en Resource class for managing an atlas, which is a collection of textures and their frames.
 * @zh 管理大图合集资源的类，该类包含纹理和它们的帧。
 */
export class AtlasResource extends Resource {
    /**
     * @en The directory where the atlas resource is stored.
     * @zh 存储大图合集资源的目录。
     */
    readonly dir: string;
    /**
     * @en An array of textures contained within the atlas.
     * @zh 包含在大图合集中的纹理数组。
     */
    readonly textures: Array<Texture>;
    /**
     * @en An array of texture frames, which are individual images within the atlas.
     * @zh 大图合集中的纹理帧数组，它们是大图中的单个图像。
     */
    readonly frames: Array<Texture>;

    /**
     * @en Creates a new instance of the AtlasResource class.
     * @param dir Directory of the atlas.
     * @param textures Array of textures in the atlas.
     * @param frames Array of frames corresponding to the textures.
     * @zh 创建AtlasResource类的新实例。实例化大图合集资源。
     * @param dir 大图合集的目录路径。
     * @param textures 大图合集中的纹理数组。
     * @param frames 对应纹理的帧数组。
     */
    constructor(dir: string, textures: Array<Texture>, frames: Array<Texture>) {
        super();

        this.dir = dir;
        this.textures = textures;
        this.frames = frames;

        for (let tex of frames) {
            tex._addReference();
            tex._atlas = this;
        }
        for (let tex of textures) {
            tex._addReference();
            tex._atlas = this;
        }
    }

    /**
     * @en Disposes of the resources used by the atlas, destroying all textures and frames.
     * @zh 释放大图合集使用的资源，销毁所有纹理和帧。
     */
    protected _disposeResource(): void {
        for (let tex of this.textures) {
            tex._atlas = null;
            tex._removeReference();
        }

        for (let tex of this.frames) {
            tex._atlas = null;
            tex._removeReference();
        }

        this.frames.length = 0;
        this.textures.length = 0;
    }
}