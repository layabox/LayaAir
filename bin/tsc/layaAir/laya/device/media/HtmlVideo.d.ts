import { Bitmap } from "../../resource/Bitmap";
/**
 * @private
 */
export declare class HtmlVideo extends Bitmap {
    protected video: any;
    protected _source: any;
    constructor();
    static create: Function;
    private createDomElement;
    setSource(url: string, extension: number): void;
    private appendSource;
    getVideo(): any;
    _getSource(): any;
    destroy(): void;
}
