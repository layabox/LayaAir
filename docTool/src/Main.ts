import { MDManager } from "./MDManager";
import { BaseData } from "./core/BaseData";
import { BaseParam } from "./core/BaseParam";
import { MDClass } from "./core/MDClass";
import { MDMethods } from "./core/MDMethods";
import { MDProperties } from "./core/MDProperties";
import { MDSelf } from "./core/MDSelf";
import { MethodsData } from "./core/MethodsData";
import { PropertiesData } from "./core/PropertiesData";
import { PropertiesValue } from "./core/PropertiesValue";
import { IHierarchy } from "./core/interface/IHierarchy";
import { IMethods } from "./core/interface/IMethods";
import { IProperties } from "./core/interface/IProperties";
import { BlueprintDTSParser } from "./tools/BlueprintDTSParser";
import { TBPDeclaration, TBPDeclarationFunction, TBPDeclarationProp } from "./tools/BlueprintDeclaration";
import { CreateUtils } from "./tools/CreateUtils";
import { MoveUtils } from "./tools/MoveUtils";
import { TranslateUtils } from "./tools/TranslateUtils";
const fs = require("fs");
const path = require("path");

/**
 * 
 * @ brief: Main
 * @ author: zyh
 * @ data: 2024-04-23 15:08
 */
export class Main {
    dts = new BlueprintDTSParser()
    constructor() {

    }

    init(dtsPath: string) {
        this.dts.start(dtsPath);
    }

    initByPath(dtsPath: string) {
        try {
            const stats = fs.statSync(dtsPath);
            if (stats.isDirectory()) {
                const files = fs.readdirSync(dtsPath);
                files.forEach(file => {
                    let fullPath = path.join(dtsPath, file);
                    this.initByPath(fullPath);
                });
            } else if (stats.isFile() && path.basename(dtsPath).endsWith('.d.ts')) {
                this.init(dtsPath);
                // main.canver(dtsPath, getFileNameWithoutExt(dtsPath, outDir), getFileNameWithoutExt(dtsPath, emptyDataDir));
            }
        } catch (err) {
            console.error(err);
        }
    }

    canver(dtsPath: string, outDir: string, emptyDataDir: string, mdFileName: string) {
        // if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
        // }
        // if (!fs.existsSync(emptyDataDir)) {
        fs.mkdirSync(emptyDataDir, { recursive: true });
        // }

        var bp = new BlueprintDTSParser();
        bp.start(dtsPath);

        const data = bp.classData;
        let allMdStr: string = "";
        for (const key in data) {
            const element = data[key];
            let mc = MDManager.instance.get(element.name);
            const extendsCls = this.getExtendsCls(element.name, dtsPath);
            if (!mc) {
                mc = CreateUtils.createMDClass(element, extendsCls);
                MDManager.instance.add(mc.className, mc);
            } else {
                this.updateMDClass(mc, element, extendsCls);
            }
            const mdStr = mc.toString();
            allMdStr += mdStr + "\n\n";
            const tObj = TranslateUtils.extractZHContent(mdStr);
            if (Object.keys(tObj).length > 0) {
                TranslateUtils.map.set(mc.className, tObj);
            }

            // TranslateUtils.translate();

            const emptydata = mc.getEmptydata();
            if (!mdFileName) {
                const outPath = outDir + mc.className + ".md";
                MoveUtils.addNewPath(outPath, true);
                fs.writeFileSync(outPath, mdStr, "utf-8");
            }
            if (emptydata) {
                fs.writeFileSync(emptyDataDir + mc.className + ".json", JSON.stringify(emptydata, null, 4), "utf-8");
            }
        }

        if (mdFileName && allMdStr) {
            const outPath = outDir + mdFileName + ".md";
            MoveUtils.addNewPath(outPath, true);
            fs.writeFileSync(outPath, allMdStr, "utf-8");
            console.log("write md file: " + outDir + mdFileName + ".md");
        }
    }

    canverByPath(dtsPath: any, outDir: any, emptyDataDir: any) {
        try {
            const stats = fs.statSync(dtsPath);
            if (stats.isDirectory()) {
                const files = fs.readdirSync(dtsPath);
                files.forEach(file => {
                    let fullPath = path.join(dtsPath, file);
                    // 更新输出目录以包含当前目录名称
                    let updatedOutDir = path.join(outDir, path.basename(dtsPath) + '/');
                    // 更新空数据目录以包含当前目录名称
                    let updatedEmptyDataDir = path.join(emptyDataDir, path.basename(dtsPath) + '/');
                    this.canverByPath(fullPath, updatedOutDir, updatedEmptyDataDir);
                });
            } else if (stats.isFile() && path.basename(dtsPath).endsWith('.d.ts')) {
                this.canver(dtsPath, outDir, this.getFileNameWithoutExt(dtsPath, emptyDataDir), this.getFileNameWithoutExt(dtsPath, null));
                // main.canver(dtsPath, getFileNameWithoutExt(dtsPath, outDir), getFileNameWithoutExt(dtsPath, emptyDataDir));
            }
        } catch (err) {
            console.error(err);
        }
    }

    private getFileNameWithoutExt(filePath, outDir) {
        let str;
        let filename = path.basename(filePath);
        if (filename.endsWith('.d.ts')) {
            str = filename.substring(0, filename.length - '.d.ts'.length);
        } else {
            str = path.basename(filename, path.extname(filename));
        }
        if (outDir) {
            return outDir + str + "/";
        }
        return str;
    }

    private getExtendsCls(className: string, dtsPath: string) {
        const extendsCls = [];
        const classData = this.dts.classData;
        for (const key in classData) {
            const element = classData[key];
            if (element.extends && element.extends[0] == className) {
                extendsCls.push(`[${element.name}](${this.getRelativePath(element.filePath, dtsPath)})`);
            }
        }
        return extendsCls;
    }

    updateMDClass(mc: MDClass, element: TBPDeclaration, extendsCls: string[]) {
        mc.className = element.name;

        mc.seft = this.updateMDSelf(mc.seft, element);

        mc.hierarchy = this.updateMDHierarchy(mc.hierarchy, element, extendsCls);

        mc.properties = this.updateMDProperties(mc.properties, element.props);

        mc.methods = this.updateMDMethods(mc.methods, element.funcs);
    }

    updateMDSelf(self: MDSelf, element: TBPDeclaration) {
        if (!self) {
            self = CreateUtils.createMDSelf(element);
        } else {
            if (element.extends) {
                self.extends = element.extends[0];
            }
            let selfZh = self.ZH;
            if (!selfZh) {
                selfZh = CreateUtils.createBaseData(`zh{${element.name}}`, element.zhTips);
                self.ZH = selfZh;
            } else {
                // selfZh.name = `zh{${element.name}}`;
                if (selfZh.describe != element.zhTips) {
                    selfZh.describe = element.zhTips;
                    selfZh.tips = "";
                }
            }

            let selfEn = self.EN;
            if (!selfEn) {
                selfEn = CreateUtils.createBaseData(element.name, element.enTips);
                self.EN = selfEn;
            } else {
                selfEn.name = element.name;
                if (selfEn.describe != element.enTips) {
                    selfEn.describe = element.enTips;
                    selfEn.tips = "";
                }
            }
        }
        return self;
    }

    updateMDHierarchy(hierarchy: IHierarchy, element: TBPDeclaration, extendsCls: string[]) {
        if (!element.extends) return null;

        if (!hierarchy) {
            hierarchy = CreateUtils.createHierarchy(element, extendsCls);
        } else {
            const parentCls = element.extends[0];
            hierarchy.parent = `[${parentCls}](${element.imports[parentCls]})`;
            hierarchy.className = element.name;
            hierarchy.extends = element.extends || [];
        }
        return hierarchy;
    }

    updateMDMethods(methods: IMethods, funcs: TBPDeclarationFunction[]) {
        if (!methods) {
            methods = CreateUtils.createMethods(funcs);
        } else {
            const arr = [];
            for (const key in funcs) {
                const func = funcs[key];
                let mdata = (methods as MDMethods).getMethods(func.name);
                if (!mdata) {
                    mdata = new MethodsData();
                }
                mdata.name = func.name;
                mdata.returns = func.returnType.toString();

                let mdataZH = mdata.ZH;
                if (!mdataZH) {
                    mdataZH = CreateUtils.createBaseData(`zh{${func.name}}`, func.zhTips);
                } else {
                    // mdataZH.name = `zh{${func.name}}`;
                    if (mdataZH.describe != func.zhTips) {
                        mdataZH.describe = func.zhTips;
                        mdataZH.tips = "";
                    }
                }
                let mdataEN = mdata.EN;
                if (!mdataEN) {
                    mdataEN = CreateUtils.createBaseData(func.name, func.enTips);
                } else {
                    mdataEN.name = func.name;
                    if (mdataEN.describe != func.enTips) {
                        mdataEN.describe = func.enTips;
                        mdataEN.tips = "";
                    }
                }

                let mdataParams = mdataZH.param as BaseParam;
                if (!mdataParams) {
                    mdataParams = new BaseParam();
                }
                let mdataParamsEN = mdataEN.param as BaseParam;
                if (!mdataParamsEN) {
                    mdataParamsEN = new BaseParam();
                }

                let array = func.params;
                mdataParams.updateMethodParamByDatas(array, func.zhParamTips || []);
                mdataParamsEN.updateMethodParamByDatas(array, func.enParamTips || []);

                mdataZH.param = mdataParams;
                mdataEN.param = mdataParamsEN;

                mdata.ZH = mdataZH;
                mdata.EN = mdataEN;

                arr.push(mdata);
            }
            (methods as MDMethods).methods = arr;
        }
        return methods;
    }

    updateMDProperties(properties: IProperties, props: TBPDeclarationProp[]) {
        if (!properties) {
            properties = CreateUtils.createProperties(props);
        } else {
            const arr = [];
            for (const key in props) {
                const prop = props[key];
                let pdataValue: PropertiesValue;
                if (!prop.value) {
                    pdataValue = new PropertiesValue();
                }
                pdataValue.setDef(prop.type, "");
                let pdataValueZH = pdataValue.ZH;
                if (!pdataValueZH) {
                    pdataValueZH = CreateUtils.createBaseData(`zh{${prop.name}}`, prop.zhTips);
                } else {
                    // pdataValueZH.name = `zh{${prop.name}}`;
                    if (pdataValueZH.describe != prop.zhTips) {
                        pdataValueZH.describe = prop.zhTips;
                        pdataValueZH.tips = "";
                    }
                }
                let pdataValueEN = pdataValue.EN;
                if (!pdataValueEN) {
                    pdataValueEN = CreateUtils.createBaseData(prop.name, prop.enTips);
                } else {
                    pdataValueEN.name = prop.name;
                    if (pdataValueEN.describe != prop.enTips) {
                        pdataValueEN.describe = prop.enTips;
                        pdataValueEN.tips = "";
                    }
                }
                pdataValue.ZH = pdataValueZH;
                pdataValue.EN = pdataValueEN;

                let pdata = (properties as MDProperties).getProperties(prop.name);
                if (!pdata) {
                    pdata = new PropertiesData();
                }
                pdata.key = prop.name;
                pdata.value = pdataValue;
                arr.push(pdata);
            }
            (properties as MDProperties).properties = arr;
        }
        return properties;
    }

    private getRelativePath(path1: string, path2: string): string {
        // 将路径分割成数组
        const arr1 = path1.split(/[\/\\]/);
        const arr2 = path2.split(/[\/\\]/);

        // 找到共同的前缀
        let i = 0;
        while (i < arr1.length && i < arr2.length && arr1[i] === arr2[i]) {
            i++;
        }

        // 构建相对路径
        const goBack = arr2.slice(i, -1).map(() => '..').join('/');
        let goForward = arr1.slice(i).join('/');

        // 去掉 .d.ts 后缀
        goForward = goForward.replace(/\.d\.ts$/, '');

        // 组合相对路径
        let relativePath = goBack + (goBack && goForward ? '/' : '') + goForward;

        // 如果结果为空字符串或只有文件名，加上 './'
        if (!relativePath || !relativePath.includes('/')) {
            relativePath = './' + relativePath;
        }

        return relativePath;
    }

    test() {
        let mc = new MDClass();
        mc.className = "Sprite";

        let self = new MDSelf();
        self.extends = "Node";

        let seftZH = new BaseData();
        seftZH.name = "精灵";
        seftZH.describe = "最基础的2D显示对象节点与容器";
        seftZH.tips = "无";

        let seftEN = new BaseData();
        seftEN.name = "Sprite";
        seftEN.describe = "The most basic 2D display object node and container";
        seftEN.tips = "None";

        self.ZH = seftZH;
        self.EN = seftEN;

        mc.seft = self;

        let properties = new MDProperties();
        let pdata = new PropertiesData();
        pdata.key = "autoSize";

        let pdataValue = new PropertiesValue();
        pdataValue.setDef("boolean", "false");

        let pdataValueZH = new BaseData();
        pdataValueZH.name = "自动宽高";
        pdataValueZH.describe = "是否自动计算宽高数据";
        pdataValueZH.tips = "无";

        let pdataValueEN = new BaseData();
        pdataValueEN.name = "Auto size";
        pdataValueEN.describe = "Whether to automatically calculate width and height data";
        pdataValueEN.tips = "None";

        pdataValue.ZH = pdataValueZH;
        pdataValue.EN = pdataValueEN;

        pdata.value = pdataValue;
        properties.addProperties(pdata);

        let pdata2 = new PropertiesData();
        pdata2.key = "height";

        let pdataValue2 = new PropertiesValue();
        pdataValue2.setDef("number", "0");

        let pdataValueZH2 = new BaseData();
        pdataValueZH2.name = "高度";
        pdataValueZH2.describe = "显示对象的高度";
        pdataValueZH2.tips = "无";

        let pdataValueEN2 = new BaseData();
        pdataValueEN2.name = "Height";
        pdataValueEN2.describe = "The height of the display object";
        pdataValueEN2.tips = "None";

        pdataValue2.ZH = pdataValueZH2;
        pdataValue2.EN = pdataValueEN2;

        pdata2.value = pdataValue2;
        properties.addProperties(pdata2);

        mc.properties = properties;

        let methods = new MDMethods();
        let mdata = new MethodsData();
        mdata.name = "loadImage";
        mdata.returns = "Sprite";

        let mdataZH = new BaseData();
        mdataZH.name = "加载图片";
        mdataZH.describe = "加载并显示一个图片";
        mdataZH.tips = "无";

        let mdataParams = new BaseParam();
        mdataParams.addParam("url", "图片资源的地址", 'string');
        mdataParams.addParam("complete", "(可选)加载完成回调", 'Handler');

        mdataZH.param = mdataParams;

        let mdataEN = new BaseData();
        mdataEN.name = "Load image";
        mdataEN.describe = "Load and display an image";
        mdataEN.tips = "None";

        let mdataParamsEN = new BaseParam();
        mdataParamsEN.addParam("url", "The address of the image resource", 'string');
        mdataParamsEN.addParam("complete", "(Optional) Load completion callback", 'Handler');

        mdataEN.param = mdataParamsEN;

        mdata.ZH = mdataZH;
        mdata.EN = mdataEN;

        methods.addMethods(mdata);

        mc.methods = methods;

        // console.log(mc.seft.toString());
        console.log(mc.toString());
    }
}