import { ColorUtils } from "../../utils/ColorUtils";
export declare class DrawStyle {
    static DEFAULT: DrawStyle;
    _color: ColorUtils;
    static create(value: any): DrawStyle;
    constructor(value: any);
    setValue(value: any): void;
    reset(): void;
    toInt(): number;
    equal(value: any): boolean;
    toColorStr(): string;
}
