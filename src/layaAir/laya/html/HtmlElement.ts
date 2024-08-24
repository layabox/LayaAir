import { XMLIterator } from "./XMLIterator";
import { XMLUtils } from "./XMLUtils";
import { IHtmlObject } from "./IHtmlObject";
import { TextStyle } from "../display/css/TextStyle";
import { Pool } from "../utils/Pool";

/**
 * @en Enum representing the types of HTML elements.
 * @zh 枚举，表示 HTML 元素的类型。
 */
export enum HtmlElementType {
    /**
     * @en Text element, typically used for raw text content.
     * @zh 文本元素，通常用于纯文本内容。
     */
    Text,
    /**
     * @en Link element, used for creating hyperlinks.
     * @zh 链接元素，用于创建超链接。
     */
    Link,
    /**
     * @en Image element, used for embedding images.
     * @zh 图像元素，用于嵌入图像。
     */
    Image,
    /**
     * @en Input element, used for creating input fields.
     * @zh 输入元素，用于创建输入字段。
     */
    Input,
    /**
     * @en Select element, used for creating dropdown selects.
     * @zh 选择元素，用于创建下拉选择框。
     */
    Select,
    /**
     * @en Object element, used for embedding objects like images, videos, or other media.
     * @zh 对象元素，用于嵌入对象，如图像、视频或其他媒体。
     */
    Object,

    /**
     * @internal
     * @en Indicates the end of link elements.
     * @zh 表示链接元素的结束。
     */
    LinkEnd,
}

/**
 * @en The `HtmlElement` class represents HTML element.
 * @zh `HtmlElement` 类表示 HTML 元素。
 */
export class HtmlElement {
    /**
     * @en The type of the HTML element.
     * @zh HTML 元素的类型。
     */
    public type: HtmlElementType;
    /**
     * @en The name of the HTML element.
     * @zh HTML 元素的名称。
     */
    public name: string;
    /**
     * @en The text content of the HTML element.
     * @zh HTML 元素的文本内容。
     */
    public text: string;
    /**
     * @en The style of the HTML element.
     * @zh HTML 元素的样式。
     */
    public style: TextStyle;

    /**
     * @en The object associated with the HTML element.
     * @zh 与 HTML 元素关联的对象。
     */
    public obj: IHtmlObject;
    /**
     * @en The space associated with the element, used for layout purposes.
     * @zh 与元素关联的空间，用于布局目的。
     */
    public space: number;

    public _attrs: Record<string, any>;

    /**
     * @en Creates a new instance of the `HtmlElement` class.
     * @zh 创建 `HtmlElement` 类的新实例。
     */
    public constructor() {
        this.style = new TextStyle();
    }

    /**
     * @en Gets the value of an attribute from the element.
     * @param attrName The name of the attribute to retrieve.
     * @returns The value of the attribute.
     * @zh 从元素中获取属性的值。
     * @param attrName 属性名称。
     * @returns 属性值。
     */
    public getAttr(attrName: string): any {
        if (this._attrs == null)
            return null;

        return this._attrs[attrName];
    }

    /**
     * @en Sets an attribute on the element with the given value.
     * @param attrName The name of the attribute to set.
     * @param attrValue The value to set for the attribute.
     * @zh 使用给定的值在元素上设置属性。
     * @param attrName 属性名称。
     * @param attrValue 属性值。
     */
    public setAttr(attrName: string, attrValue: any) {
        if (this._attrs == null)
            this._attrs = {};

        this._attrs[attrName] = attrValue;
    }

    /**
     * @en Gets a string attribute value, with an optional default.
     * @param attrName The name of the attribute.
     * @param defValue The default value to use if the attribute is not found or is not a string.
     * @returns The string value of the attribute or the default value.
     * @zh 获取字符串属性值，可设置默认值。
     * @param attrName 属性名称。
     * @param defValue 默认值，如果属性不存在或不是字符串。
     * @returns 属性值或默认值。
     */
    public getAttrString(attrName: string, defValue?: string) {
        return XMLUtils.getString(this._attrs, attrName, defValue);
    }

    /**
     * @en Gets an integer attribute value, with an optional default.
     * @param attrName The name of the attribute.
     * @param defValue The default value to use if the attribute is not found or is not an integer.
     * @returns The integer value of the attribute or the default value.
     * @zh 获取整数属性值，可设置默认值。
     * @param attrName 属性名称。
     * @param defValue 默认值，如果属性不存在或不是整数。
     * @returns 属性值或默认值。
     */
    public getAttrInt(attrName: string, defValue?: number): number {
        return XMLUtils.getInt(this._attrs, attrName, defValue);
    }

    /**
     * @en Gets a float attribute value, with an optional default.
     * @param attrName The name of the attribute.
     * @param defValue The default value to use if the attribute is not found or is not a float.
     * @returns The float value of the attribute or the default value.
     * @zh 获取浮点属性值，可设置默认值。
     * @param attrName 属性名称。
     * @param defValue 默认值，如果属性不存在或不是浮点数。
     * @returns 属性值或默认值。
     */
    public getAttrFloat(attrName: string, defValue?: number): number {
        return XMLUtils.getFloat(this._attrs, attrName, defValue);
    }

    /**
     * @en Gets a boolean attribute value, with an optional default.
     * @param attrName The name of the attribute.
     * @param defValue The default value to use if the attribute is not found or is not a boolean.
     * @returns The boolean value of the attribute or the default value.
     * @zh 获取布尔属性值，可设置默认值。
     * @param attrName 属性名称。
     * @param defValue 默认值，如果属性不存在或不是布尔值。
     * @returns 属性值或默认值。
     */
    public getAttrBool(attrName: string, defValue?: boolean): boolean {
        return XMLUtils.getBool(this._attrs, attrName, defValue);
    }

    /**
     * @en Fetches attributes from an external source and assigns them to the element.
     * @zh 从外部源获取属性，并将它们分配给元素。
     */
    public fetchAttributes() {
        this._attrs = Object.assign({}, XMLIterator.attributes);
    }

    /**
     * @en Resets the properties of the element to their default state, preparing it for reuse from the pool.
     * @zh 将元素的属性重置为默认状态，准备从池中重用。
     */
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

    /**
     * @en A static pool of HtmlElement objects for reuse.
     * @zh HtmlElement 对象的静态池。
     */
    static pool: Array<HtmlElement> = [];
    /**
     * @en Retrieves an HtmlElement from the pool with a specified type, initializing it if necessary.
     * @zh 从池中检索具有指定类型的 HtmlElement，如有必要则进行初始化。
     */
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

    /**
     * @en Returns an HtmlElement or an array of HtmlElements back to the pool for reuse.
     * @zh 将 HtmlElement 或 HtmlElement 数组返回到池中以供重用。
     */
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