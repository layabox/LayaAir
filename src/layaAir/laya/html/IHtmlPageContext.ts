import { Text } from "../display/Text";
import { HtmlElement } from "./HtmlElement";
import { IHtmlObject } from "./IHtmlObject";

/**
 * @en The `IHtmlPageContext` interface represents the context in which HTML content is parsed and rendered, providing methods to create and manage HTML objects.
 * @zh `IHtmlPageContext` 接口表示解析和渲染 HTML 内容的上下文环境，提供创建和管理 HTML 对象的方法。
 */
export interface IHtmlPageContext {
    /**
     * @en Creates an HTML object based on the provided owner and element, which can be embedded within the HTML content.
     * @param owner The owner of the HTML object, typically a text container.
     * @param element The HTML element from which to create the object.
     * @returns An instance of `IHtmlObject` that represents the created HTML object.
     * @zh 基于提供的拥有者和元素创建一个 HTML 对象，该对象可以嵌入在 HTML 内容中。
     * @param owner HTML 对象的拥有者，通常是一个文本容器。
     * @param element 用于创建对象的 HTML 元素。
     * @returns `IHtmlObject` 的一个实例，代表创建的 HTML 对象。
     */
    createObject(owner: Text, element: HtmlElement): IHtmlObject;
    /**
     * @en Frees an HTML object, releasing any resources associated with it. This method is typically called when an object is no longer needed.
     * @param obj The HTML object to be freed.
     * @zh 释放一个 HTML 对象，释放与其关联的所有资源。通常在不再需要对象时调用此方法。 
     * @param obj 要释放的 HTML 对象。
     */
    freeObject(obj: IHtmlObject): void;
}