import { XMLIterator } from "./XMLIterator";
import { XMLUtils } from "./XMLUtils";
import { IHtmlObject } from "./IHtmlObject";
import { TextStyle } from "../display/css/TextStyle";
import { Pool } from "../utils/Pool";

export enum HtmlElementType {
    Text,
    Link,
    Image,
    Input,
    Select,
    Object,

    //internal
    LinkEnd,
}

export class HtmlElement {
    public type: HtmlElementType;
    public name: string;
    public text: string;
    public style: TextStyle;

    public obj: IHtmlObject;
    public space: number;

    public _attrs: Record<string, any>;

    public constructor() {
        this.style = new TextStyle();
    }

    public getAttr(attrName: string): any {
        if (this._attrs == null)
            return null;

        return this._attrs[attrName];
    }

    public setAttr(attrName: string, attrValue: any) {
        if (this._attrs == null)
            this._attrs = {};

        this._attrs[attrName] = attrValue;
    }

    public getAttrString(attrName: string, defValue?: string) {
        return XMLUtils.getString(this._attrs, attrName, defValue);
    }

    public getAttrInt(attrName: string, defValue?: number): number {
        return XMLUtils.getInt(this._attrs, attrName, defValue);
    }

    public getAttrFloat(attrName: string, defValue?: number): number {
        return XMLUtils.getFloat(this._attrs, attrName, defValue);
    }

    public getAttrBool(attrName: string, defValue?: boolean): boolean {
        return XMLUtils.getBool(this._attrs, attrName, defValue);
    }

    public fetchAttributes() {
        this._attrs = Object.assign({}, XMLIterator.attributes);
    }

    public reset() {
        this.name = null;
        this.text = null;
        if (this.obj) {
            this.obj.release();
            Pool.recoverByClass(this.obj);
            this.obj = null;
        }
        this._attrs = null;
    }

    static pool: Array<HtmlElement> = [];
    static getFromPool(type: HtmlElementType): HtmlElement {
        let ele: HtmlElement;
        if (this.pool.length > 0)
            ele = this.pool.pop();
        else
            ele = new HtmlElement();
        ele.type = type;
        if (ele.type != HtmlElementType.Text && !ele._attrs)
            ele._attrs = {};
        return ele;
    }

    static returnToPool(ele: HtmlElement | Array<HtmlElement>) {
        if (Array.isArray(ele)) {
            for (let e of ele)
                e.reset();
            this.pool.push(...ele);
            ele.length = 0;
        }
        else {
            ele.reset();
            this.pool.push(ele);
        }
    }
}