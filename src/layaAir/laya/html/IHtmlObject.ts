import { HtmlElement } from "./HtmlElement";
import { Text } from "../display/Text";

export interface IHtmlObject {
    width: number;
    height: number;
    element: HtmlElement;
    loading?: boolean;

    create(owner: Text, element: HtmlElement): void;
    pos(x: number, y: number): void;
    release(): void;
    destroy(): void;
}