import { BPType } from "./BlueprintTypes";

export type TBPDecoratorsPropertType = "function" | "property" | "class" | "constructor" | "accessor";

export type TBPDecoratorsFuncType = "pure" | "function" | "event" | BPType.Pure | BPType.Function | BPType.Event;

export type TBPDeclarationType = "Node" | "Component" | "Others";

/** 修饰符 */
export type BPModifiers = {
    /** 是否是私有 */
    isPrivate?: boolean;
    /** 是否是公有 */
    isPublic?: boolean;
    /** 是否是受保护的 */
    isProtected?: boolean;
    /** 是否是静态 */
    isStatic?: boolean;
    /** 是否为只读 */
    isReadonly?: boolean;
    /**
     * 是否是自动运行
     */
    isAutoRun?: boolean;
}

export type TBPDeclaration = {
    /** 包名 */
    module?: string;
    /** 当前描述名 */
    name: string;
    /** 当前描述的具体类型 */
    type: TBPDeclarationType,
    /** 能否被继承 */
    canInherited?: boolean;
    /** 继承的类型数组，按次序从为父类的父类  */
    extends?: string[];
    /** 事件相关 */
    events?: TBPDeclarationEvent[];
    /** 实现的接口名 */
    implements?: string[];
    /** 该描述的属性列表 */
    props?: TBPDeclarationProp[];
    /** 该描述的方法列表 */
    funcs?: TBPDeclarationFunction[];
    /** 构造函数 */
    construct?: TBPDeclarationConstructor;
    /** 显示名称，没有默认使用name */
    caption?: string;
    /** 分组 */
    catalog?: string;
    /** 提示内容 */
    tips?: string;
}

export type TBPDeclarationEvent = {
    name: string;
    params?: TBPDeclarationEventData[];
}

export type TBPDeclarationEventData = {
    id?: number;
    /** 参数名称 */
    name: string;
    /** 参数类型 */
    type: string;
    /** 显示名称，没有默认使用name */
    caption?: string;
    /** 分组 */
    catalog?: string;
    /** 提示内容 */
    tips?: string;
}

export type TBPDeclarationConstructor = {
    params?: TBPDeclarationParam[];
    /** 显示名称，没有默认使用name */
    caption?: string;
    /** 分组 */
    catalog?: string;
    /** 提示内容 */
    tips?: string;
}

export type TBPDeclarationProp = {
    /** 变量名称 */
    name: string;
    value?: any;
    /** 变量类型 */
    type?: string;

    customId?: string;
    /** 是否有getter 方法 */
    getter?: boolean;
    /** 是否有setter 方法 */
    setter?: boolean;
    /** 泛型 */
    typeParameters?: any;
    /** 修饰符 */
    modifiers?: BPModifiers;
    /** 是否来自父类 */
    fromParent?: string;
    /** 显示名称，没有默认使用name */
    caption?: string;
    /** 分组 */
    catalog?: string;
    /** 提示内容 */
    tips?: string;
}

export type TBPDeclarationFunction = {
    /** 方法名称 */
    name: string;
    /**鼠标右键里面的菜单路径,如果填写none则代表不在菜单中显示 */
    menuPath?: string;
    /** 具体方法类型 */
    type?: TBPDecoratorsFuncType;
    /** 修饰符 */
    modifiers?: BPModifiers;
    /** 方法的参数列表 */
    params?: TBPDeclarationParam[];
    /** 方法的返回类型 */
    returnType: string | any[];
    /** 方法的返回注释 */
    returnTips?: string;
    /** 泛型 */
    typeParameters?: any;
    /** 注册的原始方法 */
    originFunc?: Function;

    /** 是否来自父类 */
    fromParent?: string;

    customId?: number;

    /** 显示名称，没有默认使用name */
    caption?: string;
    /** 分组 */
    catalog?: string;
    /** 提示内容 */
    tips?: string;
}

export type TBPDeclarationParam = {
    id?: number;
    /** 参数名称 */
    name: string;
    /** 参数类型 */
    type: string;
    /** 是否为可选项 */
    optional?: boolean;
    /** 是否为...方法 */
    dotdotdot?: boolean;
    /** 显示名称，没有默认使用name */
    caption?: string;
    /** 分组 */
    catalog?: string;
    /** 提示内容 */
    tips?: string;
}


export interface BPDecoratorsOptionBase {
    /** 标题，如果不提供将使用name */
    caption?: string;
    /** 注册对象成员类型 */
    propertType?: TBPDecoratorsPropertType;
    /** 修饰符 */
    modifiers?: BPModifiers;
    /** 分类 */
    catalog?: string;
    /** 提示内容 */
    tips?: string;
}

export interface BPDecoratorsOptionClass extends BPDecoratorsOptionBase {
    /** 注册名称 */
    name: string;
    /** 唯一识别id */
    uuid?: string;
    /** 继承的父类 */
    extends?: string;
    /** 能否被继承 */
    canInherited?: boolean;
}

export interface BPDecoratorsOptionFunction extends BPDecoratorsOptionBase {
    /** 方法或者构造函数参数，必填 */
    params: TBPDeclarationParam[];
    /** 
     * 方法分类
     * @default BPType.Function
     */
    type?: TBPDecoratorsFuncType;
    /**
     * 返回类型
     */
    returnType: string;
}

export interface BPDecoratorsOptionProp extends BPDecoratorsOptionBase {
    /** 参数类型 */
    type: string;
}


