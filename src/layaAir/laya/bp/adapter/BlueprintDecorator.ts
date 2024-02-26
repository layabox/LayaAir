import { BlueprintUtil } from "../core/BlueprintUtil";
import { TBPDeclaration, TBPDeclarationType, BPDecoratorsOptionClass, BPDecoratorsOptionProp, TBPDeclarationProp, BPDecoratorsOptionFunction, TBPDeclarationConstructor, TBPDeclarationFunction } from "../datas/types/BlueprintDeclaration";
import { BPType } from "../datas/types/BlueprintTypes";
import { Component } from "../../components/Component";

var bpUserMap: Map<Function, TBPDeclaration> = new Map;

function initDeclaration(name: string, cls: Function) {
    let type: TBPDeclarationType = "Others";
    if (cls instanceof Node) {
        type = "Node";
    } else if (cls instanceof Component) {
        type = "Component"
    }
    // else if (cls instanceof Component) {
    //     type = "Component";
    // }
    let declare: TBPDeclaration = {
        name,
        type,
    }

    bpUserMap.set(cls, declare);
    return declare;
}

/**
 * 蓝图装饰器
 * @param options
 */
export function bpClass(options: BPDecoratorsOptionClass) {

    return function (target: any) {
        if (options.propertType && options.propertType != "class") {
            console.error("BP:Reg class Fail :", options.name, " , propertType is not class!");
            return;
        }

        let declare = bpUserMap.get(target.prototype);
        if (!declare) {
            initDeclaration(options.name, target);
        } else {
            declare.name = options.name;
        }

        if (options.extends) {
            declare.extends = [options.extends];
        }

        bpUserMap.delete(target.prototype);
        //以uuid为识别
        // customData[options.uuid] = declare;
        BlueprintUtil.addCustomData(options.uuid, declare);
    }
}

/**
 * 蓝图装饰器,属性
 */
export function bpProperty(options: BPDecoratorsOptionProp) {

    return function (target: any, propertyKey: string) {

        if (options.propertType && options.propertType != "property") {
            console.error("BP:Reg Property Fail :", propertyKey, " , propertType is not property!");
            return
        }

        let declare = bpUserMap.get(target);
        if (!declare) {
            declare = initDeclaration("", target);
        }

        let prop: TBPDeclarationProp = {
            name: propertyKey,
            type: options.type,
            caption: options.caption,
            catalog: options.catalog,
            modifiers: options.modifiers,
            tips: options.tips
        };

        if (!prop.modifiers) prop.modifiers = {};
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
export function bpFunction(options: BPDecoratorsOptionFunction) {

    return function (target: any, propertyKey: string, descriptor: any) {

        if (options.propertType
            && options.propertType != "constructor"
            && options.propertType != "function") {
            console.error("BP:Reg Function Fail :", propertyKey, " , propertType is not function or constructor!");
            return;
        }

        let declare = bpUserMap.get(target.prototype);
        if (!declare) {
            declare = initDeclaration("", target);
        }

        if (options.propertType == "constructor") {
            let construct: TBPDeclarationConstructor = {
                params: options.params,

            }
            declare.construct = construct;
        } else {
            let func: TBPDeclarationFunction = {
                name: propertyKey,
                type: options.type || BPType.Function,
                returnType: options.returnType,
                caption: options.caption,
                catalog: options.catalog,
                modifiers: options.modifiers,
                tips: options.tips,
                params: options.params,
            }

            if (!func.modifiers) func.modifiers = {};
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
export function bpAccessor(options: BPDecoratorsOptionProp) {

    return function (target: any, propertyKey: string, descriptor: any) {

        if (options.propertType && options.propertType != "property") {
            console.error("BP:Reg Accessor Fail :", propertyKey, " , propertType is not property!");
            return;
        }

        let declare = bpUserMap.get(target);
        if (!declare) {
            declare = initDeclaration("", target);
        }

        let prop: TBPDeclarationProp = {
            name: propertyKey,
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

        if (descriptor.get) {
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
