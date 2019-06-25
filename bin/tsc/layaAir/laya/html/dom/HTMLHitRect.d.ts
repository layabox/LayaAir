import { Rectangle } from "../../maths/Rectangle";
/**
 * @private
 */
export declare class HTMLHitRect {
    rec: Rectangle;
    href: string;
    constructor();
    reset(): HTMLHitRect;
    recover(): void;
    static create(): HTMLHitRect;
}
