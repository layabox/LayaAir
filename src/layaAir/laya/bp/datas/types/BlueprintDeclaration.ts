import { regClass } from "../../../../Decorators";
import { Component } from "../../../components/Component";
import { Node } from "../../../display/Node";
import { BlueprintUtil } from "../../core/BlueprintUtil";
import { customData } from "../BlueprintExtends";
import { BPType } from "./BlueprintTypes";

export type TBPDecoratorsPropertType = "function" | "property" | "class" | "constructor" | "accessor";

export type TBPDecoratorsFuncType = "pure" | "function" | "event" | BPType.Pure | BPType.Function | BPType.Event;

export type TBPDeclarationType = "Node"|"Component"|"Others";

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
}

export type TBPDeclaration = {
    /** 包名 */
    module?: string;
    /** 当前描述名 */
    name: string;
    /** 当前描述的具体类型 */
    type: TBPDeclarationType,
    /** 能否被继承 */
    canInherited?:boolean;
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


export type TBPDeclarationConstructor = {
    params?: TBPDeclarationParam[];
    /** 显示名称，没有默认使用name */
    caption?:string;
    /** 分组 */
    catalog?:string;
    /** 提示内容 */
    tips?:string;
}

export type TBPDeclarationProp = {
    /** 变量名称 */
    name: string;
    /** 变量类型 */
    type?: string;
    /** 是否有getter 方法 */
    getter?: boolean;
    /** 是否有setter 方法 */
    setter?: boolean;
    /** 泛型 */
    typeParameters?:any;
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

export type TBPDeclarationFunction = {
    /** 方法名称 */
    name: string;
    /**鼠标右键里面的菜单路径,如果填写none则代表不在菜单中显示 */
    menuPath?:string;
    /** 具体方法类型 */
    type?:TBPDecoratorsFuncType;
    /** 修饰符 */
    modifiers?:BPModifiers;
    /** 方法的参数列表 */
    params?: TBPDeclarationParam[];
    /** 方法的返回类型 */
    returnType: string|any[];
    /** 泛型 */
    typeParameters?:any;
    /** 注册的原始方法 */
    originFunc?:Function;

    /** 是否来自父类 */
    fromParent?: string;

    customId?:number;
    
    /** 显示名称，没有默认使用name */
    caption?:string;
    /** 分组 */
    catalog?:string;
    /** 提示内容 */
    tips?:string;
}

export type TBPDeclarationParam = {
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
    /** 标题，如果不提供将使用name */
    caption?:string;
    /** 注册对象成员类型 */
    propertType?:TBPDecoratorsPropertType;
    /** 修饰符 */
    modifiers?:BPModifiers;
    /** 分类 */
    catalog?:string;
    /** 提示内容 */
    tips?:string;
}

export interface BPDecoratorsOptionClass extends BPDecoratorsOptionBase{
    /** 注册名称 */
    name:string;
    /** 唯一识别id */
    uuid?:string;
    /** 继承的父类 */
    extends?:string;
}

export interface BPDecoratorsOptionFunction extends BPDecoratorsOptionBase{
    /** 方法或者构造函数参数，必填 */
    params:TBPDeclarationParam[];
    /** 
     * 方法分类
     * @default BPType.Function
     */
    type?:TBPDecoratorsFuncType;
    /**
     * 返回类型
     */
    returnType:string;
}

export interface BPDecoratorsOptionProp extends BPDecoratorsOptionBase{
    /** 参数类型 */
    type:string;
}


var bpUserMap : Map<Function,TBPDeclaration> = new Map;

function initDeclaration(name:string , cls:Function){
    let type:TBPDeclarationType = "Others";
    if (cls instanceof Node) {
        type = "Node";
    }else if (cls instanceof Component) {
        type = "Component"
    }
    // else if (cls instanceof Component) {
    //     type = "Component";
    // }
    let declare:TBPDeclaration = {
        name,
        type,
    }

    bpUserMap.set(cls,declare);
    return declare;
}

/**
 * 蓝图装饰器
 * @param options
 */
export function bpClass( options : BPDecoratorsOptionClass){
    
    return function(target: any){
        if (options.propertType && options.propertType != "class") {
            console.error("BP:Reg class Fail :" , options.name ,  " , propertType is not class!");
            return ;
        }
    
        let declare = bpUserMap.get(target.prototype);
        if (!declare) {
            initDeclaration(options.name , target );
        }else{
            declare.name = options.name;
        }

        if (options.extends) {
            declare.extends = [options.extends];
        }

        bpUserMap.delete(target.prototype);
        //以uuid为识别
        // customData[options.uuid] = declare;
        BlueprintUtil.addCustomData(options.uuid,declare);
    }
}

/**
 * 蓝图装饰器,属性
 */
export function bpProperty( options : BPDecoratorsOptionProp){   

    return function(target: any, propertyKey: string){

        if (options.propertType  && options.propertType != "property") {
            console.error("BP:Reg Property Fail :" , propertyKey ,  " , propertType is not property!");
            return
        }
    
        let declare = bpUserMap.get(target);
        if (!declare) {
            declare = initDeclaration( "" , target );
        }

        let prop:TBPDeclarationProp = {
            name: propertyKey,
            type : options.type,
            caption : options.caption,
            catalog : options.catalog,
            modifiers : options.modifiers,
            tips : options.tips
        };

        if (!prop.modifiers) prop.modifiers = { };
        prop.modifiers.isPublic = true;
        
        if (!declare.props) {
            declare.props = [];
        }
        declare.props.push(prop);
    }
}

/**
 * 蓝图装饰器，方法包括getset
 */
export function bpFunction( options : BPDecoratorsOptionFunction){

    return function(target: any, propertyKey: string, descriptor: any){

        if (options.propertType 
            && options.propertType != "constructor" 
            && options.propertType != "function") 
        {
            console.error("BP:Reg Function Fail :" ,propertyKey ,  " , propertType is not function or constructor!");
            return;
        }

        let declare = bpUserMap.get(target.prototype);
        if (!declare) {
            declare = initDeclaration( "" , target );
        }

        if (options.propertType == "constructor") {
            let construct:TBPDeclarationConstructor = {
                params:options.params,

            }
            declare.construct = construct;            
        }else{
            let func:TBPDeclarationFunction = {
                name:propertyKey,
                type: options.type || BPType.Function,
                returnType: options.returnType,
                caption: options.caption,
                catalog: options.catalog,
                modifiers: options.modifiers,
                tips: options.tips,
                params:options.params,
            }

            if (!func.modifiers) func.modifiers = { };
            func.modifiers.isPublic = true;
            // func.originFunc = descriptor.value;

            if (!declare.funcs) {
                declare.funcs = [];
            }
    
            declare.funcs.push(func);
        }
    }
}

/**
 * 蓝图装饰器，方法包括
 */
export function bpAccessor( options : BPDecoratorsOptionProp){
    
    return function(target: any, propertyKey: string, descriptor: any){

        if (options.propertType  && options.propertType != "property") {
            console.error("BP:Reg Accessor Fail :" , propertyKey ,  " , propertType is not property!");
            return;
        }

        let declare = bpUserMap.get(target);
        if (!declare) {
            declare = initDeclaration( "" , target );
        }

        let prop:TBPDeclarationProp = {
            name:propertyKey,
            type: options.type,
            caption: options.caption,
            catalog: options.catalog,
            modifiers: options.modifiers,
            tips: options.tips,
        }
        // if (options) {
        //     prop 
        // }else{
        //     prop = {
        //         name:propertyKey,
        //         type:"any"
        //     }
        // }

        if(descriptor.get){
            prop.getter = true;
        }

        if (descriptor.set) {
            prop.setter = true;
        }

        if (prop.getter && !prop.setter) {
            if (!prop.modifiers) {
                prop.modifiers = {}
            }
            prop.modifiers.isReadonly = true;
        }

        if (!declare.props) {
            declare.props = [];
        }
        declare.props.push(prop);
    }
}
