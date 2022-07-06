import { ILaya } from "../../ILaya";
import { Resource } from "./Resource";
import { Texture } from "./Texture";

export class AtlasResource extends Resource {
    dir: string;
    textures: Array<Texture>;
    frames: Array<string>;

    constructor() {
        super();

        this.textures = [];
        this.frames = [];
        this.lock = true;
    }

    protected _disposeResource(): void {
        for (let url of this.frames)
            ILaya.loader.clearRes(url);

        for (let tex of this.textures)
            tex.destroy();

        this.frames.length = 0;
        this.textures.length = 0;
    }
}