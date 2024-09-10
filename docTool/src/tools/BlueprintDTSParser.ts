const ts = require("typescript");
const fs = require("fs");
const { argv, argv0 } = require("process");
const path = require("path");
const e = require("cors");
const { t } = require("i18next");

////////////////////////////////////////

const internalStrs = ["paramTips"];

const baseModifers = ["isPublic", "isPrivate", "isProtected", "isStatic", "isReadonly"];
export class BlueprintDTSParser {

    /** @type {boolean} */
    associate;
    /** @type {boolean} */
    splitSample;
    /** @type {boolean} */
    removePrivate;
    /** @type {string} */
    outDir;
    /** @type {string} */
    codeDir;
    /** @type {string} */
    fileName;

    implementArr = ["IClone"];

    /** @type {ts.SourceFile} */
    sc;

    inheritDocList = [];

    classData = {};

    outJson = {};

    packages = {};

    /** 当前的类名 @type {string} */
    className = "";
    /** 当前的模块名 @type {string} */
    moduleName = "";
    /** 泛型映射表 */
    // typeParamters = {};

    COLLECT = {
        "ClassDeclaration": this.collectClassFunc, //Class对象
        "ModuleDeclaration": this.collectModuleFunc,
        "EnumDeclaration": this.collectEnum, //枚举导出
        "InterfaceDeclaration": this.collectInterface, //生成接口
    }

    VISITORS = {
        // "ImportDeclaration":this.emitImport, //improt引用
        "ClassDeclaration": this.emitClassFunc, //Class对象
        "PropertyDeclaration": this.emitPropertyFunc, //属性
        "ModuleDeclaration": this.emitModuleFunc,
        "GetAccessor": this.emitGetSetFunc,//get 解析
        "SetAccessor": this.emitGetSetFunc,//set 解析
        "MethodDeclaration": this.emitMethodFunc, //方法
        "Constructor": this.emitConstructorFunc,
        "EnumDeclaration": this.emitEunmFunc, //枚举导出  

        // "InterfaceDeclaration":this.emitInterface, //生成接口
        // "MethodSignature":this.emitMethodSig, //生成interface用方法
        // "PropertySignature":this.emitPropertySing, //生成interface属性
        // "ImportEqualsDeclaration":this.emitImportEquals, //特殊引用
        // "CallSignature":this.emitCallSignature
    }

    cloneObject(any) {
        return JSON.parse(JSON.stringify(any));
    }

    copyObject(from, to) {
        for (const key in from) {
            if (internalStrs.indexOf(key) != -1)
                continue
            if (typeof from[key] == "object" && !Array.isArray(from[key])) {
                if (!to[key]) to[key] = {}
                this.copyObject(from[key], to[key]);
            } else
                to[key] = from[key];
        }
    }

    addFuncItem(newItem) {
        if (!this.classData[this.className]) {
            console.error(`${this.className} is not ready!`)
            return
        }
        this._addFuncItem(this.classData[this.className], newItem);
    }

    _addFuncItem(clsJson, newItem) {
        let funcsArr = clsJson.funcs;
        if (!funcsArr) {
            funcsArr = clsJson.funcs = [];
        }

        funcsArr.push(newItem);
    }

    addPropItem(newItem) {
        if (!this.classData[this.className]) {
            console.error(`${this.className} is not ready!`)
            return
        }
        this._addPropItem(this.classData[this.className], newItem);
    }

    _addPropItem(clsJson, newItem) {
        let propsArr = clsJson.props;
        if (!propsArr) {
            propsArr = clsJson.props = [];
        }

        let out: any = this._getItem(clsJson, newItem.name);
        if (out) {
            if ((!newItem.modifiers || !newItem.modifiers.isStatic) && !out.member) {
                propsArr.push(newItem);
            } else if (newItem.modifiers.isStatic && !out.static) {
                propsArr.push(newItem);
            } else {
                //理论上不可能
                debugger
            }
        } else
            propsArr.push(newItem);
    }

    getItem(name, isFunc = false) {
        let clsJson = this.classData[this.className];
        if (!clsJson) return null;
        return this._getItem(clsJson, name, isFunc);
    }

    _getItem(clsJson, name, isFunc = false) {
        if(!clsJson) return null;
        /** @type {any[]} */
        let datas;
        if (isFunc) {
            datas = clsJson.funcs;
        } else
            datas = clsJson.props;

        if (!datas) return null;
        /** @type {{static?:any,member?:any,funcs?:any[]}} */
        let out: any = {};
        let needReturn = false;
        for (let i = 0, n = datas.length; i < n; i++) {
            let item = datas[i];
            if (item.name == name) {
                needReturn = true;
                if (isFunc) {
                    out.funcs ||= [];
                    out.funcs.push(item);
                } else {
                    if (item.modifiers && item.modifiers.isStatic) {
                        out.static = item;
                    } else out.member = item;
                }
            }
        }

        return needReturn ? out : null;
    }



    /**
     * 
     * @param {ts.ClassDeclaration} node 
     * @returns 
     */
    collectClassFunc(node) {
        this.className = node.name.getText();

        let obj: any = {
            module: this.moduleName,
            name: this.className,
        };
        //检查继承关系
        if (node.heritageClauses) {//没有继承对象的直接跳过
            for (let i = 0; i < node.heritageClauses.length; i++) {
                /** @type {ts.HeritageClause} */
                let nodeChild = node.heritageClauses[i];
                // let kind = nodeChild.getText();
                let nodes = [];
                for (let j = 0; j < nodeChild.types.length; j++) {
                    let type = nodeChild.types[j];
                    //对主类型判断
                    let typeText = type.expression.getText();
                    nodes.push(typeText);

                    //如果有进行检测 加
                    if (type.typeArguments) {
                        // for(let n = 0;n<type.typeArguments.length;n++){
                        //     let typenode = this.emitTsType(type.typeArguments[i]);
                        // }
                    }

                }

                if (nodeChild.token == ts.SyntaxKind.ExtendsKeyword) {
                    obj.extends = nodes;
                } else {
                    obj.implements = nodes;
                }
            }
        }

        if (this.classData[this.className]) {
            console.error("! 有同名类", this.className);
            return
        }
        this.classData[this.className] = obj;
    }

    /**
     * 
     * @param {ts.EnumDeclaration} node 
     * @returns 
     */
    collectEnum(node) {
        let nodeName = node.name.getText();
        //ts解析
        let obj = {
            module: this.moduleName,
            type: "Enum",
            name: nodeName
        }

        this.classData[nodeName] = obj;
    }

    /**
     * 
     * @param {ts.InterfaceDeclaration} node 
     */
    collectInterface(node) {
        let nodeName = node.name.getText();
        let obj = {
            module: this.moduleName,
            interface: true,
            name: nodeName
        };
        this.classData[nodeName] = obj;
    }

    /**
     * 
     * @param {ts.ModuleDeclaration} node 
     */
    collectModuleFunc(node) {
        this.moduleName = node.name.getText();
        let body = node.body;
        if (body) {
            this.collectClass(body.statements);
        }
        this.moduleName = "";
    }

    ////////////////////////////////////////////////////////////////////////

    /**
     * 
     * @param {ts.EnumDeclaration} node 
     */
    emitEunmFunc(node) {

        let nodeName = node.name.getText();
        let enumObject = this.classData[nodeName];

        let ext = {};
        this.emitJSDoc(node.jsDoc, ext);

        if (node.members) {
            let merbers = enumObject.merbers = [];
            for (let i = 0; i < node.members.length; i++) {

                let memberNode = node.members[i];

                let memberExt = {};
                this.emitJSDoc(memberNode.jsDoc, memberExt);

                //如果是数字
                let merber: any = {};
                merber.name = memberNode.name.getText();

                if (memberNode.initializer) {
                    let value = memberNode.initializer.getText();
                    switch (memberNode.initializer.kind) {
                        case ts.SyntaxKind.FirstLiteralToken:
                        case ts.SyntaxKind.PrefixUnaryExpression:
                            merber.value = parseFloat(value);
                            break;
                        case ts.SyntaxKind.StringLiteral:
                            merber.value = JSON.parse(value);
                            break;
                        default:
                            debugger
                            break;
                    }
                }
                merbers.push(merber);
                this.copyObject(memberExt, merber);
            }
        }

        this.copyObject(ext, enumObject);
    }

    /**
     * @param {ts.ClassDeclaration} node 
     * @returns 
     */
    emitClassFunc(node) {
        this.className = node.name.getText();

        let ext = {};
        this.emitJSDoc(node.jsDoc, ext);

        let cls = this.classData[this.className];

        //检查继承关系
        this.checkNodes(node.members);

        this.copyObject(ext, cls);

        if (node.typeParameters) {
            let tpObject = {};
            for (let i = 0, len = node.typeParameters.length; i < len; i++) {
                let typeParameter = node.typeParameters[i];
                let constraint = typeParameter.constraint;
                let typeName = typeParameter.name.getText()
                let ct: any = tpObject[typeName] = {};
                if (constraint) {
                    ct.extends = this.emitType(constraint).name;
                }
            }
            cls.typeParameters = tpObject;
        }

        this.className = "";
    }

    /**
     * 
     * @param {ts.ModifiersArray} nodes 
     * @param {any} out 
     */
    emitModifiers(nodes, out) {
        let data: any = { isPublic: true };
        if (nodes && nodes.length) {
            for (let i = 0, len = nodes.length; i < len; i++) {
                let childnode = nodes[i];
                switch (childnode.kind) {
                    // case ts.SyntaxKind.PublicKeyword:
                    //     out.isPublic = true;
                    //     break;
                    case ts.SyntaxKind.PrivateKeyword:
                        data.isPrivate = true;
                        delete data.isPublic;
                        break;
                    case ts.SyntaxKind.ReadonlyKeyword:
                        data.isReadonly = true;
                        break;
                    case ts.SyntaxKind.ProtectedKeyword:
                        data.isProtected = true;
                        delete data.isPublic;

                        break;
                    case ts.SyntaxKind.StaticKeyword:
                        data.isStatic = true;
                        break;
                }
            }
        }
        out.modifiers = data;
    }

    /**
     * 
     * @param {ts.NodeArray<ts.ParameterDeclaration>} nodes 
     * @param {any} func
     * @param {{paramTips?:string[],tips?:string}} ext
     */
    emitParameters(nodes, func, ext) {
        if (!nodes || !nodes.length) {
            return;
        }

        let params = [];
        for (let i = 0, len = nodes.length; i < len; i++) {
            let node = nodes[i];
            let type = this.emitType(node.type).name;
            let param: any = {
                name: node.name.getText(),
                type,
            };

            //是否可选
            if (node.questionToken) {
                param.optional = true;
            }

            if (node.dotDotDotToken) {//几乎没可能
                param.dotdotdot = true;
            }

            if (ext.paramTips && ext.paramTips[i]) {
                param.tips = ext.paramTips[i];
            }

            this.emitJSDoc(node.jsDoc, param);

            params.push(param);
        }

        func.params = params;
    }

    /**
     * @param {ts.TypeNode} node 
     * @returns {{name:string}}
     */
    emitType(node, force = false) {
        if (!node) {
            return { name: "any" };
        }
        /** @type {string , any ,any} */
        let type, item, out: any = {};
        switch (node.kind) {
            case ts.SyntaxKind.AnyKeyword:
            case ts.SyntaxKind.BooleanKeyword:
            case ts.SyntaxKind.NumberKeyword:
            case ts.SyntaxKind.StringKeyword:
            case ts.SyntaxKind.LiteralType:
            case ts.SyntaxKind.VoidKeyword:
            case ts.SyntaxKind.TypeQuery:
            case ts.SyntaxKind.SymbolKeyword:
            case ts.SyntaxKind.QualifiedName:
            case ts.SyntaxKind.NullKeyword:
            case ts.SyntaxKind.UndefinedKeyword:
            case ts.SyntaxKind.UnknownKeyword:
                type = node.getText();
                break;
            case ts.SyntaxKind.ThisType:
                type = this.className;
                break;
            case ts.SyntaxKind.TypeReference:
                let typeName = this.emitType(node.typeName, true);
                this.copyObject(typeName, out);
                type = typeName.name;

                if (node.typeArguments) {
                    let str = "";
                    for (let i = 0, len = node.typeArguments.length; i < len; i++) {
                        let typeone = this.emitType(node.typeArguments[i]);
                        if (typeone) {
                            if (typeone.name == "null" || typeone.name == "undefined")
                                continue
                            str += (i ? "|" : "") + typeone.name;
                        }
                    }

                    if (type) {
                        type = type + "<" + str + ">";
                    } else {
                        type = str;
                    }
                }
                break;

            case ts.SyntaxKind.UnionType:
                type = "";
                for (let i = 0; i < node.types.length; i++) {
                    let typeone = this.emitType(node.types[i]);
                    if (typeone) {
                        if (typeone.name == "null" || typeone.name == "undefined")
                            continue
                        type += (i ? "|" : "") + typeone.name;
                    }
                }
                break;
            case ts.SyntaxKind.Identifier:
                type = node.getText();
                if (type.indexOf("Readonly") != -1) {
                    out.isReadonly = true;
                    type = type.replace("Readonly", "");
                }
                break;
            case ts.SyntaxKind.ArrayType:
                type = "Array<" + this.emitType(node.elementType, out).name + ">";
                break;
            case ts.SyntaxKind.TypeLiteral:
                // type = node.getText();
                type = "{";
                let members = node.members;
                for (let i = 0, len = members.length; i < len; i++) {
                    let member = members[i];
                    switch (member.kind) {
                        case ts.SyntaxKind.PropertySignature:
                            type += member.getText();
                            break;
                        case ts.SyntaxKind.IndexSignature:
                            if (member.parameters) {
                                for (let j = 0, jlen = member.parameters.length; j < jlen; j++) {
                                    let parameter = member.parameters[j];
                                    let typeone = this.emitType(parameter.type);
                                    if (typeone) {
                                        type += "[key:" + typeone.name + "]"
                                    }
                                }
                            }

                            if (member.type) {
                                type += ":" + this.emitType(member.type).name;
                            }

                            break;
                        default:
                            debugger
                            break;
                    }
                }
                type = type + "}";
                break;
            case ts.SyntaxKind.LastTypeNode:
                type = node.qualifier.getText();
                // item = classData[type];
                // if (item) {
                //     type = item.module + "." + type;
                // }
                break;

            case ts.SyntaxKind.FunctionType:
                type = "(";
                if (node.parameters) {
                    for (let j = 0, jlen = node.parameters.length; j < jlen; j++) {
                        let parameter = node.parameters[j];
                        type += (j ? "," : "") + parameter.name.getText() + ":" + this.emitType(parameter.type).name + ""
                    }
                }
                type = type + ")=>";

                if (node.type) {
                    type += this.emitType(node.type).name;
                }

                break;
            case ts.SyntaxKind.TupleType:
                type = "[";
                if (node.elementTypes) {
                    for (let i = 0, len = node.elementTypes.length; i < len; i++) {
                        type += (i ? "," : "") + this.emitType(node.elementTypes[i]).name;
                    }
                }

                type = type + "]";
                break;
            case ts.SyntaxKind.ConstructorType:
                type = node.getText();
                type = type.replace(/\s+/g, "");
                break;
            case ts.SyntaxKind.ParenthesizedType:
                type = "(" + this.emitType(node.type, out).name + ")";
                break;
            case ts.SyntaxKind.IndexedAccessType:
                type = this.emitType(node.objectType, out).name;
                break;
            case ts.SyntaxKind.TypeOperator:
                type = this.emitType(node.type).name;
                break;
            case ts.SyntaxKind.IntersectionType:
                type = "";
                if (node.types) {
                    for (let i = 0, len = node.types.length; i < len; i++) {
                        type += (i ? "&" : "") + this.emitType(node.types[i]).name;
                    }
                }

                break;
            default:
                debugger
                break;
        }

        if (this.moduleName == "" && type.indexOf("Laya.") !== -1) {
            type = type.replace("Laya.", "");
        }

        if (!type && !force) {
            return null
        }

        out.name = type;
        return out;
    }


    /**
     * 
     * @param {ts.ConstructorDeclaration} node 
     */
    emitConstructorFunc(node) {
        let parameters = node.parameters
        if (parameters && parameters.length) {
            let ext = {};
            this.emitJSDoc(node.jsDoc, ext);

            let construct = {};
            this.emitParameters(parameters, construct, ext);

            if (!this.classData[this.className]) {
                console.error(`${this.className} is not ready!`)
                return
            }

            this.copyObject(ext, construct);

            let clsJson = this.classData[this.className];
            clsJson.construct = construct;
        }
    }

    /**
     * 
     * @param {ts.PropertyDeclaration} node 
     * @returns 
     */
    emitPropertyFunc(node) {

        let prop: any = {};
        prop.name = node.name.getText();

        let ext: any = {};
        this.emitJSDoc(node.jsDoc, ext);

        this.emitModifiers(node.modifiers, prop);

        let typeResult: any = this.emitType(node.type);
        prop.type = typeResult.name;
        if (typeResult.isReadonly) prop.modifiers.isReadonly = typeResult.isReadonly;

        if (ext.inheritDoc) {//如果继承注释
            this.inheritDocList.push({
                node: prop,
                className: this.className,
                isFunc: false
            });
            delete ext.inheritDoc;
        }

        this.copyObject(ext, prop);
        this.addPropItem(prop);
    }

    /**
     * 
     * @param {ts.SetAccessorDeclaration|ts.GetAccessorDeclaration} node 
     */
    emitGetSetFunc(node) {
        let propName = node.name.getText();

        let out = this.getItem(propName);
        let ext: any = {};
        if (!out) {
            this.emitJSDoc(node.jsDoc, ext);
        }

        let prop: any = {};
        this.emitModifiers(node.modifiers, prop);

        let key = "getter";
        if (node.kind == ts.SyntaxKind.SetAccessor) {
            key = "setter";
        }

        prop.name = propName;
        prop[key] = true;
        let typeResult: any = this.emitType(node.type);
        prop.type = typeResult.name;
        if (typeResult.isReadonly) prop.modifiers.isReadonly = typeResult.isReadonly;

        if (out) {
            if (prop.modifiers.isStatic && out.static) {
                out.static[key] = true;
            } else if (!prop.modifiers.isStatic && out.member) {
                out.member[key] = true;
            } else {
                this.addPropItem(prop);
            }
        }
        else {

            if (ext.inheritDoc) {//如果继承注释
                this.inheritDocList.push({
                    node: prop,
                    className: this.className,
                    isFunc: false
                });
                delete ext.inheritDoc;
            }

            this.copyObject(ext, prop);
            this.addPropItem(prop);
        }
    }

    /**
     * @param {ts.MethodDeclaration} node 
     */
    emitMethodFunc(node) {
        let funcName = node.name.getText();
        let ext: any = {};
        this.emitJSDoc(node.jsDoc, ext);

        let func: any = { name: funcName, type: "function" };

        this.emitModifiers(node.modifiers, func);

        if (node.typeParameters) {
            let tpObject = {};
            for (let i = 0, len = node.typeParameters.length; i < len; i++) {
                let typeParameter = node.typeParameters[i];
                let constraint = typeParameter.constraint;
                let typeName = typeParameter.name.getText()
                let ct: any = tpObject[typeName] = {};
                if (constraint) {
                    ct.extends = [];
                    if (constraint.types) {
                        for (let i = 0, len = constraint.types.length; i < len; i++) {
                            let conType = constraint.types[i];
                            ct.extends.push(this.emitType(conType).name);
                        }
                    } else {
                        ct.extends.push(this.emitType(constraint).name);
                    }

                }
            }
            func.typeParameters = tpObject;
        }

        this.emitParameters(node.parameters, func, ext);

        let typeResult = this.emitType(node.type);
        func.returnType = typeResult.name;

        if (ext.inheritDoc) {//如果继承注释
            this.inheritDocList.push({
                node: func,
                className: this.className,
                isFunc: true
            });
            delete ext.inheritDoc;
        }
        this.copyObject(ext, func);
        this.addFuncItem(func);
    }

    /**
     * 
     * @param {ts.ModuleDeclaration} node 
     */
    emitModuleFunc(node) {
        this.moduleName = node.name.getText();
        let body = node.body;
        if (body) {
            this.checkNodes(body.statements);
        }
        this.moduleName = "";
    }

    /**
     * @example
     * 解析注释
     * @param {ts.JSDoc[]} nodes
     * @param {any} out
     * @returns 
     */
    emitJSDoc(nodes, out) {
        let currentLang: string;
        if (nodes && nodes.length) {
            for (let i = 0, ilen = nodes.length; i < ilen; i++) {
                let node = nodes[i];
                if (node.tags) {//获取每一个tags 加一个空格好看
                    out.paramTips = [];
                    for (let j = 0, jlen = node.tags.length; j < jlen; j++) {
                        let tag = node.tags[j];
                        if (tag.tagName) {
                            let text = tag.tagName.escapedText;
                            switch (text) {
                                case "private":
                                    out.modifiers || (out.modifiers = {});
                                    out.modifiers.isPrivate = true;
                                    out.modifiers.isPublic = false;
                                    break;
                                case "inheritDoc":
                                    out.inheritDoc = true;
                                    break;
                                case "return":
                                    out.returnTips = tag.comment;
                                    break;
                                case "en":
                                    out.enTips = tag.comment;
                                    out.enParamTips = [];
                                    currentLang = 'en';
                                    break;
                                case "zh":
                                    out.zhTips = tag.comment;
                                    out.zhParamTips = [];
                                    currentLang = 'zh';
                                    break;
                                default:
                                    if (currentLang == "en") {
                                        out.enParamTips.push(tag.comment);
                                    } else if (currentLang == "zh") {
                                        out.zhParamTips.push(tag.comment);
                                    } else {
                                        out.paramTips.push(tag.comment);
                                    }
                            }
                        }
                    }
                    if(out.paramTips?.length == 0){
                        delete out.paramTips;
                    }
                    if(out.enParamTips?.length == 0){
                        delete out.enParamTips;
                    }
                    if(out.zhParamTips?.length == 0){
                        delete out.zhParamTips;
                    }
                }
                out.tips = node.comment;
            }
        }
    }

    /**
     * 
     * @param {ts.Statement[]} nodes 
     */
    checkNodes(nodes) {
        if (!nodes)
            return

        for (let i = 0, len = nodes.length; i < len; i++) {
            const node = nodes[i];
            let type = ts.SyntaxKind[node.kind];
            let fun = this.VISITORS[type];

            if (fun) {
                fun.apply(this, [node]);
            } else {
                // console.log("这种类型没有准备对应的方法",type)
            }
        }
    }

    /**
     * @param {ts.Statement[]} nodes 
     */
    collectClass(nodes) {
        if (!nodes) return
        for (let i = 0, len = nodes.length; i < len; i++) {
            const node = nodes[i];
            let type = ts.SyntaxKind[node.kind];
            let fun = this.COLLECT[type];
            fun && fun.apply(this, [node]);
        }
    }

    getParentClassType(name) {
        // if (classData[name]) {
        //     return  "Laya." + name;
        // }
        return name;
    }

    checkModifier(a, b) {
        if (a && b) {
            let keysA = Object.keys(a);
            let keysB = Object.keys(b);

            let keySet = new Set();
            keySet.add(keysA);
            keySet.add(keysB);

            let result = true;
            keySet.forEach((key: any) => {
                if (baseModifers.indexOf(key) !== -1)
                    if (a[key] != b[key]) {
                        result = false;
                    }
            })

            return result;
        }
        else if (!a && !b) {
            return false;
        }
        else if ((!a && !b.isStatic) || (!b && !a.isStatic)) {
            return true;
        } else
            return false;
    }

    checkParams(paramA, paramB) {
        if (!!paramA != !!paramB) {
            return false
        }

        if (!paramA && !paramB) {
            return true;
        }

        if (paramA.length != paramB.length) {
            return false;
        }

        let len = paramA.length;
        for (let i = 0; i < len; i++) {
            let pa = paramA[i];
            let pb = paramB[i];
            if (pa.type != pb.type) {
                return false;
            }
        }
        return true;

    }

    cloneParent(item, parentName) {
        let parent = this.classData[parentName];

        if (!item.construct && parent.construct) {
            item.construct = this.cloneObject(parent.construct);
        }

        // if (parent.funcs) {
        //     //方法先不排重  
        //     for (let i = 0, len = parent.funcs.length; i < len; i++) {
        //         let originFunc = parent.funcs[i]
        //         let func = this.cloneObject(originFunc);
        //         func.fromParent = this.getParentClassType(parentName);
        //         let funcRes = this._getItem(item, func.name, true);
        //         if (funcRes) {
        //             for (let j = 0; j < funcRes.funcs.length; j++) {
        //                 let parentFunc = funcRes.funcs[j];
        //                 if (
        //                     !this.checkModifier(parentFunc.modifiers, func.modifiers)
        //                     || !this.checkParams(parentFunc.params, func.params)
        //                 ) {
        //                     this._addFuncItem(item, func);
        //                 }

        //             }
        //         } else {
        //             this._addFuncItem(item, func);
        //         }
        //     }
        // }

        // if (parent.props) {
        //     for (let i = 0, len = parent.props.length; i < len; i++) {
        //         let originProp = parent.props[i];
        //         let prop = this.cloneObject(originProp);
        //         let cItemRes = this._getItem(item, prop.name);
        //         if (
        //             !cItemRes
        //             || (prop.modifiers && prop.modifiers.isStatic && !cItemRes.static)
        //             || ((!prop.modifiers || !prop.modifiers.isStatic) && !cItemRes.member)
        //         ) {
        //             prop.fromParent = this.getParentClassType(parentName);
        //             this._addPropItem(item, prop);
        //         }
        //     }
        // }

        if (parent.extends) {
            let nextName;
            for (let i = 0, len = parent.extends.length; i < len; i++) {
                nextName = parent.extends[i]
                item.extends.push(nextName);
            }
            return nextName
        }
        return null;
    }

    clearItem(item) {
        /**
         * 
         * @param {any[]} arr 
         */
        let clearArr = (arr) => {
            if (!arr) return
            for (let i = arr.length - 1; i > -1; i--) {
                let one = arr[i];
                let modifiers = one.modifiers;
                if (modifiers) {
                    if (this.removePrivate && modifiers.isPrivate) {
                        arr.splice(i, 1);
                    }

                    // delete one.isPublic;
                    // let keys = Object.keys(modifiers);
                    // if (!keys.length) {
                    //     delete one.modifiers
                    // }
                }
            }
        }

        clearArr(item.props);
        clearArr(item.funcs);
    }

    /**
     * 解析继承注释
     */
    emitInheritDoc() {
        for (let i = 0, len = this.inheritDocList.length; i < len; i++) {
            let one = this.inheritDocList[i];

            let data = one.node;
            let dataName = data.name;
            let className = one.className;
            let isFunc = one.isFunc;

            let classJson = this.classData[className];
            if (classJson.extends) {

                let parentName = classJson.extends[0];
                let extendData;
                while (parentName && !extendData) {
                    let parentData = this.classData[parentName];
                    let res = this._getItem(parentData, dataName, isFunc);
                    if (res) {
                        if (isFunc) {
                            for (let j = 0, jlen = res.funcs.length; j < jlen; j++) {
                                let parentFunc = res.funcs[j];
                                if (
                                    this.checkParams(parentFunc.params, data.params)
                                    && parentFunc.modifiers.isStatic == data.modifiers.isStatic
                                ) {
                                    //参数构成完全相同
                                    //todo 拷贝注释
                                    extendData = parentFunc;
                                    break;
                                }
                            }
                        } else {
                            //结果
                            if (data.modifiers) {
                                if (data.modifiers.isStatic && res.static) {
                                    extendData = res.static;
                                    break;
                                } else if (res.member && !data.modifiers.isStatic) {
                                    extendData = res.member;
                                    break;
                                }
                            } else {
                                if (res.member) {
                                    extendData = res.member;
                                    break;
                                }
                            }
                        }
                    }
                    if (!extendData) {
                        if (!parentData || !parentData.extends) {
                            break;
                        } else {
                            parentName = parentData.extends[0];
                        }
                    }
                }

                if (extendData) {
                    data.modifiers = extendData.modifiers;
                }
            }
        }
    }
    /**
     * 解析所有的继承方法，属性
     */
    parseExtends() {
        //优先处理继承注释
        this.emitInheritDoc();

        let classData = this.classData;
        //优先处理一遍结构体
        for (const key in classData) {
            let item = classData[key];
            this.clearItem(item);
        }

        for (const key in classData) {
            this.className = key;

            let originItem = classData[key];

            if (originItem.isExport) {
                delete originItem.isExport;

                let item = this.cloneObject(originItem);

                if (item.extends) {
                    let parentName = item.extends[0];
                    while (parentName) {
                        parentName = this.cloneParent(item, parentName);
                    }

                    if (item.extends.indexOf("Node") != -1) {
                        item.type = "Node";
                    } else if (item.extends.indexOf("Component") != -1) {
                        item.type = "Component";
                    } else {
                        item.type = "Others";
                    }
                }
                else if (item.implements) {
                    item.type = "Others";
                }

                this.outJson[key] = item;
            }
        }
    }

    checkDir(dirPath) {
        let stat;
        try {
            stat = fs.statSync(dirPath);
            if (!stat.isDirectory()) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        } catch (err) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }


    createTipFile(json, fileName) {
        let out = {};
        let mark = 0;
        for (const key in json) {
            let data = json[key];
            if (!data.props && !data.funcs)
                continue

            let allprops = [];
            let allfuncs = [];

            if (data.props) {
                let props = data.props;

                for (let i = 0, len = props.length; i < len; i++) {
                    let prop = props[i];
                    if (!prop.tips) {
                        allprops.push(prop.name);
                    }
                }
            }

            if (data.funcs) {
                let funcs = data.funcs;
                for (let i = 0, len = funcs.length; i < len; i++) {
                    let func = funcs[i];
                    let funcData: any = {
                        name: func.name
                    };
                    let missTips = false;
                    if (!func.tips) {
                        missTips = true;
                    }

                    let params = func.params;
                    if (params) {
                        for (let j = 0, jlen = params.length; j < jlen; j++) {
                            if (!params[j].tips) {
                                let mts = funcData.paramMissTips = funcData.paramMissTips || [];
                                mts.push(params[j].name);
                                missTips = true;
                            }
                        }
                    }

                    if (missTips) {
                        allfuncs.push(funcData);
                    }

                }
            }

            if (allfuncs.length || allprops.length) {
                let module = out[data.module] = out[data.module] || {};

                module[key] = {
                    props: allprops,
                    funcs: allfuncs
                }
                mark++;
            }
        }

        if (mark) {
            fs.writeFileSync(path.join(this.outDir, fileName + ".json"), JSON.stringify(out), "utf-8");
        }
    }

    /**
     * 
     * @param {*} prop 
     * @param {string[][]} out 0 读写 1 只读 2 只写
     * @returns 
     */
    _txt_getPropDec(prop, out) {
        let modifiers = prop.modifiers;
        let arr;
        if (modifiers.isReadonly) {
            arr = out[1];
        } else {
            if (prop.getter == prop.setter) {
                arr = out[0];
            } else if (!prop.getter) {
                arr = out[2];
            } else {
                arr = out[1];
            }
        }
        let name = prop.name;
        if (arr.indexOf(name) == -1) {
            arr.push(name);
        }
    }

    _txt_Array2Str(arr) {
        let out = "";
        let len = arr.length;
        if (len > 1) {
            for (let i = 0; i < len; i++) {
                out += arr[i];
                if (i && i != len - 1) {
                    out += ",";
                }
            }
            out += "\n";
        }
        // else{
        //     out += arr[0] + "无\n";
        // }
        return out;
    }

    createTxt() {
        let index = 1;
        let text = "";
        for (const key in this.classData) {
            let data = this.classData[key];
            if (!data.props && !data.funcs)
                continue

            let dataText = "";

            if (data.extends) {
                dataText += `继承:${data.extends[0]}\n`;
            }

            if (data.props) {
                let props = data.props;

                let normals = [["公有属性:"], ["只读属性:"], ["只写属性:"]];
                let statics = [["静态属性:"], ["静态只读属性:"], ["静态只写属性:"]];

                for (let i = 0, len = props.length; i < len; i++) {
                    let prop = props[i];
                    let modifiers = prop.modifiers;
                    if (modifiers && modifiers.isStatic) {
                        this._txt_getPropDec(prop, statics);
                    } else {
                        this._txt_getPropDec(prop, normals);
                    }
                }

                let staticStr = "";
                let normalStr = "";
                for (let i = 0; i < 3; i++) {
                    staticStr += this._txt_Array2Str(statics[i]);
                    normalStr += this._txt_Array2Str(normals[i]);
                }

                dataText += staticStr;
                dataText += normalStr;
            }

            if (data.funcs) {
                let funcs = data.funcs;
                let statics = ["静态函数:"];
                let normals = ["公有函数:"];
                for (let i = 0, len = funcs.length; i < len; i++) {
                    let func = funcs[i];
                    let modifiers = func.modifiers;
                    if (modifiers && modifiers.isStatic) {
                        if (statics.indexOf(func.name) == -1)
                            statics.push(func.name);
                    } else {
                        if (normals.indexOf(func.name) == -1)
                            normals.push(func.name);
                    }
                }

                dataText += this._txt_Array2Str(statics);
                dataText += this._txt_Array2Str(normals);
            }

            if (dataText.length > 0) {
                text += `${index}.${key}\n` + dataText;
                index++;
            }
        }

        fs.writeFileSync(path.join(this.outDir, "class.txt"), text, "utf-8");
    }

    start(dtsPath) {
        if (!dtsPath) {
            return
        }
        this.init(dtsPath);
        //优先收集一遍
        this.collectClass(this.sc.statements);//先生成查询用表格
        this.checkNodes(this.sc.statements);
        this.parseExtends()
    }

    init(dtsPath) {
        let code = fs.readFileSync(dtsPath, "utf-8");
        this.sc = ts.createSourceFile(dtsPath, code, ts.ScriptTarget.Latest, true);
    }

}
