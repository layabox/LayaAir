import { ClassUtils } from "./laya/utils/ClassUtils";

export interface PropertyDescriptor {
    name: string;
    type: string | Function | Array<string | Function>;
    caption: string;
    tips: string;
    default: any;
    catalog: string;
    catalogCaption: string;
    catalogOrder: number;

    inspector?: string;

    hidden: boolean | string;
    disable: boolean | string;
    readonly: boolean | string;
    validator: string;

    serializable?: boolean;

    multiline: boolean;
    submitOnTyping?: boolean;

    enumSource: { name: string, value: any, [index: string]: any }[] | any[] | string;
    enumIsFlag: boolean;

    reverseBool: boolean;

    nullable?: boolean;

    min: number,
    max: number,
    range: [number, number];
    step: number;
    fractionDigits: number;

    fixedLength: boolean;
    elementProps?: Partial<PropertyDescriptor>;

    showAlpha: boolean;
    defaultColor?: any;
    colorNullable?: boolean;

    hideHeader?: boolean;

    assetTypeFilter?: string;

    position: string;
    addIndent?: number;

    options?: Record<string, any>;
}

export function regClass(className?: string): any {
    return function (constructor: Function) {
        if (className)
            ClassUtils.regClass(className, constructor);
    };
}

export function executeInEditMode(constructor: Function): void {}
export function menu(name: string): any {}
export function property(info?: string | Partial<PropertyDescriptor>): any {}
