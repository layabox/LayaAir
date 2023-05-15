import { Text } from "../display/Text";
import { HtmlElement } from "./HtmlElement";
import { IHtmlObject } from "./IHtmlObject";

export interface IHtmlPageContext {
    createObject(owner: Text, element: HtmlElement): IHtmlObject;
    freeObject(obj: IHtmlObject): void;
}