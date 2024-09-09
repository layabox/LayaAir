import { BaseData } from "./core/BaseData";
import { BaseParam } from "./core/BaseParam";
import { MDClass } from "./core/MDClass";
import { MDMethods } from "./core/MDMethods";
import { MDProperties } from "./core/MDProperties";
import { MDSelf } from "./core/MDSelf";
import { MethodsData } from "./core/MethodsData";
import { PropertiesData } from "./core/PropertiesData";
import { PropertiesValue } from "./core/PropertiesValue";
import { MoveUtils } from "./tools/MoveUtils";
const fs = require('fs');
const path = require('path');

/**
 * 
 * @ brief: MDManager
 * @ author: zyh
 * @ data: 2024-04-25 14:56
 */
export class MDManager {
    static instance: MDManager = new MDManager();

    map: Map<string, MDClass> = new Map();
    constructor() { }

    add(key: string, value: MDClass) {
        this.map.set(key, value);
    }

    get(key: string): MDClass {
        return this.map.get(key);
    }

    has(key: string): boolean {
        return this.map.has(key);
    }

    addByMD(md: string) {
        const arr = this.splitMainSections('\n' + md, '\n#');
        arr.forEach(section => {
            const mdClass = this.createMDClassByMD(section.content, section.title);
            this.add(mdClass.className, mdClass);
        });
    }

    createMDSelfByMD(md: string) {
        const self = new MDSelf();

        const four = this.splitMainSections(md, '\n####');
        four.forEach(section => {
            if (section.title === 'extends') {
                self.extends = section.content;
            } else if (section.title === 'ZH') {
                self.ZH = this.createBaseData(section.content);
            } else if (section.title === 'EN') {
                self.EN = this.createBaseData(section.content);
            }
        });

        return self;
    }
    createBaseData(content: string) {
        const baseData = new BaseData();

        const child = this.splitMainSections('\n' + content, '\n-');
        child.forEach(section => {
            const arr = section.title.split(':');
            if (arr[0] === 'Param') {
                baseData.param = this.createBaseParam(section.content);
            }
            else {
                baseData[arr[0]] = arr[1].trim();
            }
        });

        return baseData;
    }

    private createBaseParam(content: string) {
        const baseParam = new BaseParam();

        const child = this.splitMainSections('\n  ' + content, '\n  -');
        child.forEach(section => {
            const arr = section.title.split(':');
            baseParam.addParam(arr[0], arr[1].trim());
        });

        return baseParam;
    }

    createMDClassByMD(md: string, title?: string) {
        const mdClass = new MDClass();

        let str = '';
        if (title) {
            str = '\n';
            mdClass.className = title;
        } else {
            const mainSections = this.splitMainSections(md);
            mdClass.className = mainSections[0].title;
        }

        const second = this.splitMainSections(str + md, '\n##');
        second.forEach(section => {
            if (section.title === 'self') {
                mdClass.seft = this.createMDSelfByMD('\n' + section.content);
            } else if (section.title === 'Properties') {
                mdClass.properties = this.createMDPropertiesByMD('\n' + section.content);
            } else if (section.title === 'Methods') {
                mdClass.methods = this.createMDMethodsByMD('\n' + section.content);
            }
        });

        return mdClass;
    }

    createMDMethodsByMD(md: string) {
        const methods = new MDMethods();

        const three = this.splitMainSections(md, '\n###');
        three.forEach(section => {
            let mdata = new MethodsData();
            mdata.name = section.title;
            const child = this.splitMainSections('\n' + section.content, '\n####');
            child.forEach(subSection => {
                if (subSection.title === 'Returns') {
                    mdata.returns = subSection.content;
                } else if (subSection.title === 'ZH') {
                    mdata.ZH = this.createBaseData(subSection.content);
                } else if (subSection.title === 'EN') {
                    mdata.EN = this.createBaseData(subSection.content);
                }
            });
            methods.addMethods(mdata);
        });

        return methods;
    }

    createMDPropertiesByMD(md: string) {
        const properties = new MDProperties();

        const three = this.splitMainSections(md, '\n###');
        three.forEach(section => {
            let pdata = new PropertiesData();
            pdata.key = section.title;
            pdata.value = this.createPropertiesValueByMD(section.content);
            properties.addProperties(pdata);
        });

        return properties;
    }

    createPropertiesValueByMD(md: string) {
        const pdataValue = new PropertiesValue();

        const props = this.splitMainSections('\n' + md, '\n####');
        props.forEach(section => {
            if (section.title === 'Data') {
                const arr = this.splitMainSections('\n' + section.content, '\n-');
                const type = arr[0].title.split(':')[1].trim();
                const def = arr[1].title.split(':')[1].trim();
                pdataValue.setDef(type, def);
            } else if (section.title === 'ZH') {
                pdataValue.ZH = this.createBaseData(section.content);
            } else if (section.title === 'EN') {
                pdataValue.EN = this.createBaseData(section.content);
            }
        });

        return pdataValue;
    }

    addByPath(pathStr: string) {
        if (!fs.existsSync(pathStr)) return;

        try {
            const stats = fs.statSync(pathStr);
            if (stats.isDirectory()) {
                const files = fs.readdirSync(pathStr);
                files.forEach(file => {
                    let fullPath = path.join(pathStr, file);
                    this.addByPath(fullPath);
                });
            } else if (stats.isFile()) {
                let filename = path.basename(pathStr);
                if (filename.endsWith('.md')) {
                    MoveUtils.addOldPath(pathStr, true);
                    const md = fs.readFileSync(pathStr, 'utf-8');
                    this.addByMD(md);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    splitMainSections(mdContent: string, separator: string = '#') {
        const sections = mdContent.split(`${separator} `).slice(1); // 利用"\n# "分割主要部分
        return sections.map(section => {
            const [title, ...content] = section.split('\n');
            return { title: title.trim(), content: content.join('\n').trim() };
        });
    }
}