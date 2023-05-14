import { Text } from "../display/Text";
import { Image } from "../ui/Image";
import { HtmlElement } from "./HtmlElement";
import { IHtmlObject } from "./IHtmlObject";

export class HtmlImage implements IHtmlObject {
    public readonly obj: Image;

    private _owner: Text;
    private _element: HtmlElement;

    public constructor() {
        this.obj = new Image();
    }

    public get element(): HtmlElement {
        return this._element;
    }

    public get width(): number {
        return this.obj.width;
    }

    public get height(): number {
        return this.obj.height;
    }

    public create(owner: Text, element: HtmlElement): void {
        this._owner = owner;
        this._element = element;
        this._owner.objContainer.addChild(this.obj);

        let width = element.getAttrInt("width", -1);
        let height = element.getAttrInt("height", -1);
        if (width != -1)
            this.obj.width = width;
        if (height != -1)
            this.obj.height = height;

        let p = this.obj._setSkin(element.getAttrString("src"));
        let w = this.obj.width;
        let h = this.obj.height;
        p.then(() => {
            let source = this.obj.source;
            if (width == -1)
                this.obj.width = source ? source.sourceWidth : 0;
            if (height == -1)
                this.obj.height = source ? source.sourceHeight : 0;
            if (this._owner && (w != this.obj.width || h != this.obj.height))
                this._owner.refreshLayout();
        });
    }

    public pos(x: number, y: number): void {
        this.obj.pos(x, y);
    }

    public release(): void {
        this.obj.removeSelf();
        this.obj.offAll();
        this.obj.skin = null;
        this._owner = null;
        this._element = null;
    }

    public destroy(): void {
        this.obj.destroy();
    }
}