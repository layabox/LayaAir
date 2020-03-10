import { VIDEOTYPE } from "./Video";
import { Bitmap } from "../../resource/Bitmap";
import { ILaya } from "../../../ILaya";


/**
 * @internal
 */
export class HtmlVideo extends Bitmap {
    protected video: HTMLVideoElement;
	protected _source: any;
	protected _w=0;
	protected _h=0;
    constructor() {
        super();

        this._width = 1;
        this._height = 1;

        this.createDomElement();
    }

    static create: Function = function (): HtmlVideo {
        return new HtmlVideo();
    }

    private createDomElement(): void {
        this._source = this.video = ILaya.Browser.createElement("video");

        var style: any = this.video.style;
        style.position = 'absolute';
        style.top = '0px';
        style.left = '0px';

        this.video.addEventListener("loadedmetadata", ()=> {
            this._w = this.video.videoWidth;
            this._h = this.video.videoHeight;
        });
    }

    setSource(url: string, extension: number): void {
        while (this.video.childElementCount)
            this.video.firstChild.remove();

        if (extension & VIDEOTYPE.MP4)
            this.appendSource(url, "video/mp4");
        if (extension & VIDEOTYPE.OGG)
            this.appendSource(url + ".ogg", "video/ogg");
    }

    private appendSource(source: string, type: string): void {
        var sourceElement: any = ILaya.Browser.createElement("source");
        sourceElement.src = source;
        sourceElement.type = type;
        this.video.appendChild(sourceElement);
    }

    getVideo(): any {
        return this.video;
    }
    /**
     * @internal
     * @override
     */
    _getSource(): any {
        // TODO Auto Generated method stub
        return this._source;
    }

    /**
     * @override
     */
    destroy(): void {
        super.destroy();

        var isConchApp: boolean = ILaya.Render.isConchApp;
        if (isConchApp) {
            (<any>this.video)._destroy();
        }
    }

}

