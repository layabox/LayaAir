import { BaseData } from "../core/BaseData";
import { BaseParam } from "../core/BaseParam";
import { MDClass } from "../core/MDClass";
import { MDHierarchy } from "../core/MDHierarchy";
import { MDMethods } from "../core/MDMethods";
import { MDProperties } from "../core/MDProperties";
import { MDSelf } from "../core/MDSelf";
import { MethodsData } from "../core/MethodsData";
import { PropertiesData } from "../core/PropertiesData";
import { PropertiesValue } from "../core/PropertiesValue";
import { TBPDeclaration, TBPDeclarationFunction, TBPDeclarationProp } from "./BlueprintDeclaration";

/**
 * 
 * @ brief: CreateUtils
 * @ author: zyh
 * @ data: 2024-04-26 10:33
 */
export class CreateUtils {
    static createMDClass(element: TBPDeclaration, extendsCls: string[]) {
        let mc = new MDClass();
        mc.className = element.name;

        let self = this.createMDSelf(element);
        mc.seft = self;

        let hierarchy = this.createHierarchy(element, extendsCls);
        mc.hierarchy = hierarchy;

        let properties = this.createProperties(element.props);
        mc.properties = properties;

        let methods = this.createMethods(element.funcs);
        mc.methods = methods;
        return mc;
    }

    static createMDSelf(element: TBPDeclaration) {
        let self = new MDSelf();
        if (element.extends) {
            self.extends = element.extends[0];
        }
        self.ZH = this.createBaseData(`zh{${element.name}}`, element.zhTips);
        self.EN = this.createBaseData(element.name, element.enTips);

        return self;
    }

    static createHierarchy(element: TBPDeclaration, extendsCls: string[]) {
        if (!element.extends) return null;

        let hierarchy = new MDHierarchy();
        const parentCls = element.extends[0];
        hierarchy.parent = `[${parentCls}](${element.imports[parentCls]})`;
        hierarchy.className = element.name;
        hierarchy.extends = extendsCls;
        return hierarchy;
    }

    static createBaseData(name: string, describe: string, param?: any, tips?: string, returns?: string) {
        let bd = new BaseData();
        bd.name = name;
        bd.describe = describe || "";
        if (tips)
            bd.tips = tips;
        if (param) {
            let _param = new BaseParam();
            for (const key in param) {
                const element = param[key];
                _param.addParam(key, element, "");
            }
            bd.param = _param;
        }
        if (returns)
            bd.returns = returns;

        return bd;
    }

    static createProperties(props: TBPDeclarationProp[]) {
        let properties = new MDProperties();
        for (const key in props) {
            const prop = props[key];
            let pdataValue = new PropertiesValue();
            pdataValue.setDef(prop.type, "");
            let pdataValueZH = this.createBaseData(`zh{${prop.name}}`, prop.zhTips);
            let pdataValueEN = this.createBaseData(prop.name, prop.enTips);
            pdataValue.ZH = pdataValueZH;
            pdataValue.EN = pdataValueEN;

            let pdata = new PropertiesData();
            pdata.key = prop.name;
            pdata.value = pdataValue;
            properties.addProperties(pdata);
        }
        return properties;
    }

    static createMethods(funcs: TBPDeclarationFunction[]) {
        let methods = new MDMethods();
        for (const key in funcs) {
            const func = funcs[key];
            let mdata = new MethodsData();
            mdata.name = func.name;
            mdata.returns = func.returnType.toString();

            let mdataZH = this.createBaseData(`zh{${func.name}}`, func.zhTips, "", "", func.zhReturnTips);
            let mdataEN = this.createBaseData(func.name, func.enTips, "", "", func.enReturnTips);

            let mdataParams = new BaseParam();
            let mdataParamsEN = new BaseParam();

            let array = func.params || [];
            for (let index = 0; index < array.length; index++) {
                const param = array[index];
                if (func.zhParamTips) {
                    mdataParams.addParam(param.name, func.zhParamTips[index], param.type);
                }
                if (func.enParamTips) {
                    mdataParamsEN.addParam(param.name, func.enParamTips[index], param.type);
                }
            };

            mdataZH.param = mdataParams;
            mdataEN.param = mdataParamsEN;

            mdata.ZH = mdataZH;
            mdata.EN = mdataEN;

            methods.addMethods(mdata);
        }
        return methods;
    }
}