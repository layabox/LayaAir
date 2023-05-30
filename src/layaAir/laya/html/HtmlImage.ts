import { ILaya } from "../../ILaya";
import { Sprite } from "../display/Sprite";
import { Text } from "../display/Text";
import { Loader } from "../net/Loader";
import { HtmlElement } from "./HtmlElement";
import { IHtmlObject } from "./IHtmlObject";

export class HtmlImage implements IHtmlObject {
    public readonly obj: Sprite;

    private _owner: Text;
    private _element: HtmlElement;

    public constructor() {
        this.obj = new Sprite();
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

        let src = this._element.getAttrString("src");
        this.loadTexture(src);
    }

    protected loadTexture(src: string) {
        let width = this._element.getAttrInt("width", -1);
        let height = this._element.getAttrInt("height", -1);
        if (width != -1)
            this.obj.width = width;
        if (height != -1)
            this.obj.height = height;

        let tex = Loader.getRes(src);
        if (tex) {
            this.obj.texture = tex;
            if (width == -1)
                this.obj.width = tex.sourceWidth;
            if (height == -1)
                this.obj.height = tex.sourceHeight;
        }
        else {
            ILaya.loader.load(src, { silent: true }).then(tex => {
                let w = this.obj.width;
                let h = this.obj.height;
                this.obj.texture = tex;
                if (width == -1)
                    this.obj.width = tex ? tex.sourceWidth : 0;
                if (height == -1)
                    this.obj.height = tex ? tex.sourceHeight : 0;
                if (this._owner && (w != this.obj.width || h != this.obj.height))
                    this._owner.refreshLayout();
            });
        }
    }

    public pos(x: number, y: number): void {
        this.obj.pos(x, y);
    }

    public release(): void {
        this.obj.removeSelf();
        this.obj.offAll();
        this.obj.texture = null;
        this._owner = null;
        this._element = null;
    }

    public destroy(): void {
        this.obj.destroy();
    }
}