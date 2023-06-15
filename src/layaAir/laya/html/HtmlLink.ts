import { Sprite } from "../display/Sprite";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { Rectangle } from "../maths/Rectangle";
import { IHitArea } from "../utils/IHitArea";
import { HtmlElement } from "./HtmlElement";
import { IHtmlObject } from "./IHtmlObject";

export class HtmlLink implements IHtmlObject, IHitArea {
    private _owner: Text;
    private _element: HtmlElement;
    private _shape: Sprite;
    private _rects: Array<Rectangle>;
    private _rectCnt: number;

    public constructor() {
        this._shape = new Sprite();
        this._shape.hitArea = this;
        this._shape.on(Event.CLICK, () => {
            this._owner.bubbleEvent(Event.LINK, this._element.getAttrString("href"));
        });

        this._rects = [];
        this._rectCnt = 0;
    }

    public get element(): HtmlElement {
        return this._element;
    }

    public get width(): number {
        return 0;
    }

    public get height(): number {
        return 0;
    }

    public create(owner: Text, element: HtmlElement): void {
        this._owner = owner;
        this._element = element;
        this._owner.objContainer.addChild(this._shape);
    }

    public resetArea() {
        this._rectCnt = 0;
    }

    public addRect(x: number, y: number, width: number, height: number) {
        let rect = this._rects[this._rectCnt];
        if (!rect)
            rect = this._rects[this._rectCnt] = new Rectangle();
        this._rectCnt++;
        rect.setTo(x, y, width, height);
    }

    public contains(x: number, y: number): boolean {
        for (let i = 0; i < this._rectCnt; i++) {
            if (this._rects[i].contains(x, y))
                return true;
        }
        return false;
    }

    public pos(x: number, y: number): void {
    }

    public release(): void {
        this._shape.removeSelf();
        this._shape.offAll();
        this._owner = null;
        this._element = null;
    }

    public destroy(): void {
        this._shape.destroy();
    }
}