import { PropertType } from "../../../../Decorators";
import { BPType } from "./BlueprintTypes";

type TBPDecoratorsPropertType = "function"|"property"|"class" | "constructor";

type TBPDecoratorsFuncType = BPType.Pure|BPType.Function|BPType.Event;


/** 修饰符 */
type BPModifiers = {
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
}

export type TBPDeclaration = {
    /** 包名 */
    module?: string;
    /** 当前描述名 */
    name: string;
    /** 当前描述的具体类型 */
    type: string,
    /** 继承的类型数组，按次序从为父类的父类  */
    extends?: string[];
    /** 实现的接口名 */
    implements?: string[];
    /** 该描述的属性列表 */
    props?: TBPDeclarationProp[];
    /** 该描述的方法列表 */
    funcs?: TBPDeclarationFunction[];
    /** 构造函数 */
    construct?: TBPDeclarationConstructor;
    /** 显示名称，没有默认使用name */
    caption?:string;
    /** 分组 */
    catalog?:string;
    /** 提示内容 */
    tips?:string;
}


type TBPDeclarationConstructor = {
    params?: TBPDeclarationParam[];
    /** 显示名称，没有默认使用name */
    caption?:string;
    /** 分组 */
    catalog?:string;
    /** 提示内容 */
    tips?:string;
}

type TBPDeclarationProp = {
    /** 变量名称 */
    name: string;
    /** 变量类型 */
    type?: string;
    /** 是否有getter 方法 */
    getter?: boolean;
    /** 是否有setter 方法 */
    setter?: boolean;
    /** 修饰符 */
    modifiers?:BPModifiers;
    /** 是否来自父类 */
    fromParent?: string;
    /** 显示名称，没有默认使用name */
    caption?:string;
    /** 分组 */
    catalog?:string;
    /** 提示内容 */
    tips?:string;
}

type TBPDeclarationFunction = {
    /** 方法名称 */
    name: string;
    /** 具体方法类型 */
    type?:TBPDecoratorsFuncType;
    /** 修饰符 */
    modifiers?:BPModifiers;
    /** 方法的参数列表 */
    params?: TBPDeclarationParam[];
    /** 方法的返回类型 */
    return: string;

    /** 注册的原始方法 */
    originFunc?:Function;

    /** 是否来自父类 */
    fromParent?: string;
    
    /** 显示名称，没有默认使用name */
    caption?:string;
    /** 分组 */
    catalog?:string;
    /** 提示内容 */
    tips?:string;
}

type TBPDeclarationParam = {
    /** 参数名称 */
    name: string;
    /** 参数类型 */
    type: string;
    /** 是否为可选项 */
    optional?: boolean;
    /** 是否为...方法 */
    dotdotdot?:boolean;
    /** 显示名称，没有默认使用name */
    caption?:string;
    /** 分组 */
    catalog?:string;
    /** 提示内容 */
    tips?:string;
}


export interface BPDecoratorsOptionBase{
    /** 注册名称 */
    name:string;
    /** 标题，如果不提供将使用name */
    caption:string;
    /** 注册对象成员类型 */
    propertType:TBPDecoratorsPropertType;
    /** 修饰符 */
    modifiers?:BPModifiers;
    /** 分类 */
    catalog:string;
}

export interface BPDecoratorsOptionFunction extends BPDecoratorsOptionBase{
    /** 方法或者构造函数参数 */
    params?:TBPDeclarationParam[];
    /** 
     * 方法分类
     * @default BPType.Function
     */
    type?:TBPDecoratorsFuncType;
    /**
     * 返回类型
     */
    returnType:PropertType;
}

export interface BPDecoratorsOptionProp extends BPDecoratorsOptionBase{
    /** 参数类型 */
    type:PropertType;
}

/**
 * 蓝图装饰器
 */
export function blueprintReg( name:string , options? : BPDecoratorsOptionBase){

    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor){

    }
}