import { HtmlVideo } from "./HtmlVideo";
/**
 * @private
 */
export declare class WebGLVideo extends HtmlVideo {
    private gl;
    private preTarget;
    private preTexture;
    private static curBindSource;
    constructor();
    updateTexture(): void;
    readonly _glTexture: any;
    destroy(): void;
}
