import { HtmlElement } from "./HtmlElement";
import { Text } from "../display/Text";

/**
 * @en The `IHtmlObject` interface defines the structure and behavior of objects that can be embedded within HTML content.
 * @zh `IHtmlObject` 接口定义了可以嵌入在 HTML 内容中的对象的结构和行为。
 */
export interface IHtmlObject {
    /**
     * @en The width of the HTML object.
     * @zh HTML 对象的宽度。
     */
    width: number;
    /**
     * @en The height of the HTML object.
     * @zh HTML 对象的高度。
     */
    height: number;
    /**
     * @en The HTML element associated with this object.
     * @zh 与此对象关联的 HTML 元素。
     */
    element: HtmlElement;
    /**
     * @en Indicates whether the HTML object is currently loading.
     * @zh 表示 HTML 对象当前是否正在加载。
     */
    loading?: boolean;

    /**
     * @en Creates the HTML object with the given owner and element.
     * @param owner The owner of the HTML object.
     * @param element The HTML element to create the object from.
     * @zh 使用给定的所有者和元素创建 HTML 对象。
     * @param owner HTML 对象的所有者。
     * @param element 用于创建对象的 HTML 元素。
     */
    create(owner: Text, element: HtmlElement): void;
    /**
     * @en Positions the HTML object at the specified coordinates.
     * @param x The x-coordinate.
     * @param y The y-coordinate.
     * @zh 将 HTML 对象定位到指定的坐标。
     * @param x x 坐标。
     * @param y y 坐标。
     */
    pos(x: number, y: number): void;
    /**
     * @en Releases resources associated with the HTML object.
     * @zh 释放与 HTML 对象关联的资源。
     */
    release(): void;
    /**
     * @en Destroys the HTML object and frees up all associated resources.
     * @zh 销毁 HTML 对象并释放所有关联的资源。
     */
    destroy(): void;
}