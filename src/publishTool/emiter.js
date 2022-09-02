"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emiter = void 0;
const ts = require("typescript");
const path = require("path");
class emiter {
    constructor() {
        /***方法的泛型列表 */
        this.generList = [];
        /**
         * 枚举类型
         */
        this.enumType = [];
        this.outString = "";
        //中转用ts 数据
        this.copyTSdata = "";
        /**import待替换结构 */
        this.importArr = {};
        /**as引用数据 */
        this.needimportArr = [];
        /**内部类的引用 */
        // private innerImportStr = "";
        /** 当前类名 */
        this.classNameNow = "";
        /** 输出结构 */
        this.outputObj = [];
        /** 记录命名空间 */
        this.nameSpace = {};
        this.VISITORS = {
            "ImportDeclaration": this.emitImport,
            "ClassDeclaration": this.emitClass,
            "PropertyDeclaration": this.emitProperty,
            "MethodDeclaration": this.emitMethod,
            "Constructor": this.emitConstructor,
            "InterfaceDeclaration": this.emitInterface,
            "MethodSignature": this.emitMethodSig,
            "PropertySignature": this.emitPropertySing,
            "ImportEqualsDeclaration": this.emitImportEquals,
            "EnumDeclaration": this.emitEnum,
            "GetAccessor": this.emitGetset,
            "SetAccessor": this.emitGetset,
            "CallSignature": this.emitCallSignature
        };
    }
    static get BaseURL() {
        return emiter._BaseURL || "../bin/layaAir/";
    }
    static set BaseURL(v) {
            emiter._BaseURL = v;
        }
        /**
         *
         * @param source 构成的数据源
         * @param tsData ts代码原数据
         */
    createCode(source, data, _url) {
            this.url = _url;
            this.tsData = data;
            //遍历节点
            let nodes = source.statements;
            let node;
            for (let i = 0; i < nodes.length; i++) {
                node = nodes[i];
                let str = this.checkNodes(node);
                //内部类
                this.outString += str[0];
                this.copyTSdata += str[1];
                if (str[0].indexOf("public class") != -1 || str[0].indexOf("interface") != -1) {
                    if (!this.innerClass) {
                        this.innerClass = true;
                    }
                    if (this.needimportArr.length) {
                        for (let i = 0; i < this.needimportArr.length; i++) {
                            let key = this.needimportArr[i];
                            if (this.importArr[key] && this.importArr[key] != key) {
                                //检测是否需要添加引用
                                this.outString = "\timport " + this.importArr[key] + ";\r\n" + this.outString;
                            }
                        }
                    }
                    this.outString = "package " + _url.replace(new RegExp("\\\\", "g"), ".") + " {\r\n" + this.outString + "\r\n}\r\n";
                    let url = _url == "" ? "" : this.url + "\\";
                    this.outputObj.push({ "asCode": this.outString, "url": url + this.classNameNow + ".as" });
                    this.outString = "";
                    this.needimportArr = []; //清空
                }
            }
            if (this.copyTSdata == "")
                return "";
            //对ts构成重写
            if (_url != "") {
                let packageUrl = _url.replace(new RegExp("\\\\", "g"), ".");
                this.copyTSdata = "\r\ndeclare module " + packageUrl + " {\r\n" + this.copyTSdata + "\r\n}\r\n";
            } else {
                //没有在module内
                this.copyTSdata = this.copyTSdata.replace("class", "declare class");
            }
            // if(Object.keys(this.importArr).length){
            //     for(let key in this.importArr){
            //         this.copyTSdata.replace(new RegExp(key,"g"),this.importArr[key]);
            //     }
            // }
            // return this.outString;
        }
        /**
         * 生成枚举
         * @param node
         * @return 不生成全包代码
         */
    emitEnum(node) {
            let nodeName = node.name.getText();
            //ts解析
            let tsstr = node.getText().replace(new RegExp("export declare |declare ", "g"), "");
            this.enumType.push(node.name.getText());
            let asCode = "";
            if (node.members) {
                for (let i = 0; i < node.members.length; i++) {
                    let memberStr = "\t\t";
                    let memberNode = node.members[i];
                    //如果是数字
                    let isNumber = memberNode.initializer.kind == 8;
                    memberStr += "public static var " + memberNode.name.getText() + ":" + (isNumber ? "Number = " : "String = ") + memberNode.initializer.getText() + ";\r\n";
                    asCode += this.changeIndex(memberNode, "\r\n\t\t") + memberStr;
                }
            }
            let packageName = this.url.replace(new RegExp("\\\\", "g"), ".");
            emiter.dtsData += "\r\n" + tsstr + "\r\n";
            //拼package & class
            asCode = "\r\n\tpublic class " + nodeName + " {\r\n" + asCode + "\r\n\t}";
            asCode = this.changeIndex(node, "\r\n") + "package " + packageName + " {\r\n" + asCode + "\r\n}";
            this.outputObj.push({ "asCode": asCode, "url": this.url + "\\" + nodeName + ".as" });
            return ["", ""];
        }
        /**
         * 生成import
         * @param node
         */
    emitImport(node) {
            let classPath;
            let nodes = node.getChildren();
            let _node, type;
            let importName = [];
            let namespace = [];
            for (let i = 0; i < nodes.length; i++) {
                _node = nodes[i];
                type = ts.SyntaxKind[_node.kind];
                if (type == "StringLiteral") {
                    let _nodeText = JSON.parse(_node.getText());
                    if (_nodeText.charAt(0) == ".") {
                        let thisPath = path.join(emiter.BaseURL, this.url);
                        let realPath = path.resolve(thisPath, _nodeText);
                        classPath = path.relative(emiter.BaseURL, realPath);
                    } else {
                        classPath = _nodeText.replace(new RegExp("(/)", "g"), "\\");
                    }
                } else if (type == "ImportClause") {
                    let importNode = _node.namedBindings; // as ts.NamedImports;
                    type = ts.SyntaxKind[importNode.kind];
                    if (type == "NamespaceImport") {
                        namespace.push(importNode.name.getText() + ".");
                    } else {
                        let elements = importNode.elements;
                        if (elements) {
                            for (let j = 0; j < elements.length; j++) {
                                importName.push(elements[j].getText());
                            }
                        }
                    }
                }
            }
            //优先检测class路径
            if (classPath.indexOf("\\") == -1 && classPath.indexOf("/") == -1)
                return ["\r\n", ""];
            let topPath = path.join(classPath, "../").replace(new RegExp("\\\\|/", "g"), ".");
            classPath = classPath.replace(new RegExp("\\\\|/", "g"), ".");
            var asstr = "";
            if (namespace.length) {
                for (let i = 0; i < namespace.length; i++) {
                    this.nameSpace[namespace[i]] = topPath;
                }
            }
            if (importName.length) {
                for (let i = 0; i < importName.length; i++) {
                    this.importArr[importName[i]] = topPath + importName[i];
                    asstr += "\timport " + topPath + importName[i] + ";\r\n";
                }
            } else {
                asstr = "\timport " + classPath + ";\r\n";
            }
            return [asstr, ""];
        }
        /**
         * 对 = 的import解析
         * @param  node
         */
    emitImportEquals(node) {
        this.importArr[node.name.getText()] = node.moduleReference.getText();
        emiter.jscObj[node.name.getText()] = "*";
        return ["", ""];
    }
    emitCallSignature(node) {
            let tsstr;
            let note = this.changeIndex(node, "\r\n\t");
            let result = this.emitParameters(node.parameters, false, false);
            let idtype = "";
            this.generList.length = 0;
            if (node.typeParameters) {
                for (let i = 0; i < node.typeParameters.length; i++) {
                    let elemnt = node.typeParameters[i];
                    let name = elemnt.getText();
                    this.generList.push(name);
                    idtype += (i ? "," : "") + name;
                }
                idtype = "<" + idtype + ">";
            }
            tsstr = idtype + "(" + result[1] + ")" + ":" + this.emitTsType(node.type);
            return ["", tsstr];
        }
        /**
         * 生成class
         * @param node
         */
    emitClass(node) {
            let nodeName = this.classNameNow = node.name.getText();
            this.importArr[nodeName] = nodeName;
            let nodes = node.members;
            let str = "";
            let tstr = "";
            let i = 0;
            for (i = 0; i < nodes.length; i++) {
                let result = this.checkNodes(nodes[i]);
                str += result[0];
                tstr += result[1];
            }
            let extendstr = "";
            let tsExtend = "";
            //检查继承关系
            if (node.heritageClauses) {
                for (i = 0; i < node.heritageClauses.length; i++) {
                    let nodeChild = node.heritageClauses[i];
                    let kind = nodeChild.getText();
                    let nodetext = "";
                    let nodetextAS = "";
                    for (let j = 0; j < nodeChild.types.length; j++) {
                        let type = nodeChild.types[j];
                        //对主类型判断
                        let typeText = type.expression.getText();
                        let argtext = "";
                        //如果有进行检测 加
                        if (type.typeArguments) {
                            for (let n = 0; n < type.typeArguments.length; n++) {
                                let typenode = this.emitTsType(type.typeArguments[i]);
                                argtext += (n ? "|" : "<") + typenode;
                            }
                            argtext += ">";
                        }
                        nodetextAS += (j ? "," : "") + typeText;
                        if (this.importArr[typeText] && !this.url)
                            typeText = "Laya." + typeText;
                        nodetext += (j ? "," : "") + typeText + argtext;
                    }
                    if (kind.indexOf("extends") == -1)
                        kind = "implements ";
                    else
                        kind = "extends ";
                    extendstr += kind + nodetextAS + " ";
                    tsExtend += kind + nodetext + " ";
                }
            }
            let typestr = "";
            if (node.typeParameters) {
                for (i = 0; i < node.typeParameters.length; i++) {
                    let typenode = node.typeParameters[i];
                    typestr += (i ? "|" : "<") + typenode.getText();
                }
                typestr += ">";
            }
            str = "\tpublic class " + nodeName + " " + extendstr + "{\r\n" + str + "\t}\r\n";
            tstr = "\tclass " + nodeName + typestr + " " + tsExtend + " {\r\n" + tstr + "\t}\r\n";
            let note = this.changeIndex(node, "\r\n\t");
            let tsreturn = note + tstr;
            if (this.url != "") {
                emiter.dtsData += tsreturn; //note + "\r\n\tclass " + nodeName + typestr  + " extends " + this.url.replace(new RegExp("\\\\","g"),".") + "." + nodeName + typestr + " {}\r\n"
                tsreturn = "";
            }
            return [note + str, tsreturn];
        }
        /**
         * 生成接口文件
         * @param node
         */
    emitInterface(node) {
            let str = "";
            let tstr = "";
            let nodes = node.members;
            for (let i = 0; i < nodes.length; i++) {
                let result = this.checkNodes(nodes[i]);
                str += result[0];
                tstr += result[1];
            }
            let tsExtend = "";
            if (node.heritageClauses) {
                for (let i = 0; i < node.heritageClauses.length; i++) {
                    let nodeChild = node.heritageClauses[i];
                    let nodetext = "";
                    for (let j = 0; j < nodeChild.types.length; j++) {
                        let type = nodeChild.types[j];
                        //对主类型判断
                        let typeText = type.expression.getText();
                        let argtext = "";
                        //如果有进行检测 加
                        if (type.typeArguments) {
                            for (let n = 0; n < type.typeArguments.length; n++) {
                                let typenode = this.emitTsType(type.typeArguments[i]);
                                argtext += (n ? "|" : "<") + typenode;
                            }
                            argtext += ">";
                        }
                        if (this.importArr[typeText] && !this.url)
                            typeText = "Laya." + typeText;
                        nodetext += (j ? "," : "") + typeText + argtext;
                    }
                    tsExtend += " extends " + nodetext + " ";
                }
            }
            let nodeName = this.classNameNow = node.name.getText();
            str = "\tpublic interface " + nodeName + " {\r\n" + str + "\t}\r\n";
            tstr = "\tinterface " + nodeName + tsExtend + "{\r\n" + tstr + "\t}\r\n";
            let note = this.changeIndex(node, "\r\n\t");
            emiter.dtsData += "\r\n" + tstr + "\r\n";
            // this.outputObj.push({"asCode":note + str,"url":this.url + "\\" + nodeName + ".as"});
            return [note + str, ""];
        }
        /**
         * 生成接口方法
         * @param node
         */
    emitMethodSig(node) {
            let methodstr = "\t\tfunction ";
            let tsMethod = "\t\t";
            let paramstr = "";
            let tsparam = "";
            if (node.parameters) {
                // for(let i = 0;i<node.parameters.length;i++){
                //     let param = node.parameters[i] as ts.ParameterDeclaration;
                //     let isdotdotdot = false;
                //     if(param.dotDotDotToken)
                //         isdotdotdot = true;
                //     paramstr += (i ? "," : "") + (isdotdotdot?"...":"") + param.name.getText() + (isdotdotdot?"":( ":" + this.emitType(param.type) + (param.questionToken ? " = null" : "")));
                //     tsparam += (i ? "," : "") + (isdotdotdot?"...":"") + param.name.getText() + (param.questionToken ? "?" : "") + ":" + this.emitTsType(param.type);
                // }
                let result = this.emitParameters(node.parameters);
                paramstr += result[0];
                tsparam += result[1];
            }
            let idtype = "";
            this.generList.length = 0;
            if (node.typeParameters) {
                for (let i = 0; i < node.typeParameters.length; i++) {
                    let elemnt = node.typeParameters[i];
                    let name = elemnt.getText();
                    this.generList.push(name);
                    idtype += (i ? "," : "") + name;
                }
                idtype = "<" + idtype + ">";
            }
            methodstr += node.name.getText() + "(" + paramstr + "):" + this.emitType(node.type) + ";";
            tsMethod += node.name.getText() + idtype + "(" + tsparam + "):" + this.emitTsType(node.type) + ";";
            let note = this.changeIndex(node, "\r\n\t\t");
            return [note + methodstr + "\r\n", note + tsMethod + "\r\n"];
        }
        /**
         * 生成属性
         * @param node
         */
    emitProperty(node) {
            let propertystr = "";
            let tspropert = "\t\t";
            let asText = "";
            let note = this.changeIndex(node, "\r\n\t\t");
            if (node.modifiers) { //单独处理ts
                for (let i = 0; i < node.modifiers.length; i++) {
                    let childnode = node.modifiers[i];
                    tspropert += childnode.getText() + " ";
                }
            }
            let isReadonlyKeyword = false;
            if (note.indexOf("@override") == -1) { //属性重写直接忽略
                propertystr = "\t\t";
                //检测是否重写接口
                let isGetset = false;
                if (note.indexOf("@implements") != -1) { //如果是实现接口
                    isGetset = true;
                    propertystr += "public function get ";
                } else {
                    if (node.modifiers) {
                        for (let i = 0; i < node.modifiers.length; i++) {
                            let childnode = node.modifiers[i];
                            let type = ts.SyntaxKind[childnode.kind];
                            if (type == "ReadonlyKeyword")
                                isReadonlyKeyword = true;
                            asText += this.resolvingModifier(type, i, childnode);
                        }
                    } else {
                        asText += "public ";
                    }
                    propertystr += asText;
                    isGetset = asText.indexOf("function get") != -1;
                }
                propertystr += (isGetset ? "" : "var ") + node.name.getText() + (isGetset ? "()" : "") + ":" + this.emitType(node.type) + (isGetset ? "{\r\n\t\t\t\treturn null;\r\n\t\t}" : ";");
                if (isGetset && !isReadonlyKeyword) //检测是geset 简单写一个set
                    propertystr += "\r\n\t\tpublic " + (asText.indexOf(" static ") != -1 ? "static" : "") + " function set " + node.name.getText() + "(value:" + this.emitType(node.type) + "):void" + "{}";
                propertystr = note + propertystr + "\r\n";
            }
            //再次检测
            tspropert += node.name.getText() + ":" + this.emitTsType(node.type) + ";";
            return [propertystr, note + tspropert + "\r\n"];
        }
        /**
         * 生成接口类型属性
         * @param node
         */
    emitPropertySing(node) {
            let propertystr = "\t\t";
            let tspro = "\t\t";
            if (node.modifiers) {
                for (let i = 0; i < node.modifiers.length; i++) {
                    let childnode = node.modifiers[i];
                    // let type = ts.SyntaxKind[childnode.kind];
                    // i + 1确保不会加public
                    // propertystr += this.resolvingModifier(type,i + 1,childnode);
                    tspro += childnode.getText() + " ";
                }
            }
            propertystr += "var ";
            // let isGetset = propertystr.indexOf("function get") != -1;
            let note = this.changeIndex(node, "\r\n\t\t");
            propertystr += node.name.getText() + ":" + this.emitType(node.type);
            tspro += node.name.getText() + (node.questionToken ? "?" : "") + ":" + this.emitTsType(node.type);
            return [note + propertystr + ";\r\n", note + tspro + ";\r\n"];
        }
        /**
         * 生成方法
         * @param node
         */
    emitMethod(node) {
            let methodstr = "\t\t";
            let tsmethod = "\t\t";
            let note = this.changeIndex(node, "\r\n\t\t");
            if (note.indexOf("@override") != -1) {
                methodstr += "override ";
            }
            if (node.modifiers) {
                for (let i = 0; i < node.modifiers.length; i++) {
                    let childnode = node.modifiers[i];
                    let type = ts.SyntaxKind[childnode.kind];
                    methodstr += this.resolvingModifier(type, i, childnode);
                    tsmethod += childnode.getText() + " ";
                }
                methodstr += "function ";
            } else {
                methodstr += "public function ";
            }
            this.generList.length = 0;
            let paramstr = "";
            let tsparam = "";
            let isImplements = false;
            let idtype = "";
            if (node.typeParameters) {
                for (let i = 0; i < node.typeParameters.length; i++) {
                    let elemnt = node.typeParameters[i];
                    let name = elemnt.getText();
                    this.generList.push(name);
                    idtype += (i ? "," : "") + name;
                }
                idtype = "<" + idtype + ">";
            }
            //检测是否重写接口
            if (note.indexOf("@implements") != -1)
                isImplements = true;
            if (node.parameters) { //此处是特殊处理
                // for(let i = 0;i<node.parameters.length;i++){
                //     let param = node.parameters[i] as ts.ParameterDeclaration;
                //     let isdotdotdot = false;
                //     if(param.dotDotDotToken)
                //         isdotdotdot = true;
                //     paramstr += (i ? "," : "") + (isdotdotdot?"...":"") + param.name.getText() + (isdotdotdot?"":( ":" + this.emitType(param.type) + (!isImplements&&param.questionToken ? " = null" : "")));
                //     tsparam += (i ? "," : "") + (isdotdotdot?"...":"") + param.name.getText() + (param.questionToken ? "?" : "") + ":" + this.emitTsType(param.type);
                // }
                let result = this.emitParameters(node.parameters, false, isImplements);
                paramstr += result[0];
                tsparam += result[1];
            }
            let nodetype = this.emitType(node.type);
            methodstr += node.name.getText() + "(" + paramstr + "):" + nodetype + "{" + (["*", "void"].indexOf(nodetype) != -1 ? "" : ("\r\n\t\t\treturn null;\r\n\t\t")) + "}";
            tsmethod += node.name.getText() + idtype + "(" + tsparam + "):" + this.emitTsType(node.type) + ";";
            return [note + methodstr + "\r\n", note + tsmethod + "\r\n"];
        }
        /**
         * 生成构造函数
         * @param node
         */
    emitConstructor(node) {
            let asstr = "";
            let tsstr = "";
            let note = this.changeIndex(node, "\r\n\t\t");
            if (node.parameters && node.parameters.length) {
                // for(let i = 0;i<node.parameters.length;i++){
                //     let param = node.parameters[i] as ts.ParameterDeclaration;
                //     asstr += (i?",":"") + param.name.getText() + ":" + this.emitType(param.type) + " = undefined";
                //     tsstr += (i?",":"") + param.name.getText()  + ( param.questionToken?"?":"")  + ":"+ this.emitTsType(param.type);
                // }
                let result = this.emitParameters(node.parameters, true);
                asstr += result[0];
                tsstr += result[1];
            }
            asstr = "\r\n\t\tpublic function " + node.parent.name.getText() + "(" + asstr + "){}\r\n";
            tsstr = "\r\n\t\tconstructor(" + tsstr + ");\r\n";
            return [note + asstr, note + tsstr];
        }
        /**
         * 解析get set函数
         * @param node
         */
    emitGetset(node) {
            let note = this.changeIndex(node, "\r\n\t\t");
            let asstr = "";
            let tsstr = "";
            if (node.modifiers) {
                for (let i = 0; i < node.modifiers.length; i++) {
                    let childnode = node.modifiers[i];
                    let type = ts.SyntaxKind[childnode.kind];
                    asstr += this.resolvingModifier(type, i, childnode);
                    tsstr += childnode.getText() + " ";
                }
                asstr += "function ";
            } else {
                asstr += "public function ";
            }
            if (note.indexOf("@override") != -1) {
                asstr = "override " + asstr;
            }
            let name = node.name.getText();
            if (node.parameters.length) { //set
                let result = this.emitParameters(node.parameters);
                tsstr += "set " + name + "(" + result[1] + ");\r\n";
                asstr += "set " + name + "(" + result[0] + "):void{}\r\n";
            } else {
                //get
                tsstr += "get " + name + "():" + this.emitTsType(node.type) + ";\r\n";
                asstr += "get " + name + "():" + this.emitType(node.type) + "{return null;}\r\n";
            }
            return [note + "\t\t" + asstr, note + "\t\t" + tsstr];
        }
        /**
         * 解析方法中的参数
         * @param params
         * @param isCon 是否是构造函数
         */
    emitParameters(params, isCon = false, isImp = false) {
            let asResult = "";
            let tsResult = "";
            let defaultStr = isCon ? " = undefined" : " = null";
            for (let index = 0; index < params.length; index++) {
                let element = params[index];
                asResult += (index ? "," : "") + (element.dotDotDotToken ? "..." : "") + element.name.getText() + (element.dotDotDotToken ? "" : (":" + this.emitType(element.type) + ((!isImp && element.questionToken) || isCon ? defaultStr : "")));
                tsResult += (index ? "," : "") + (element.dotDotDotToken ? "..." : "") + element.name.getText() + (element.questionToken ? "?" : "") + ":" + this.emitTsType(element.type);
            }
            return [asResult, tsResult];
        }
        /**
         * 解析单个Modifier的类型
         * @param type
         */
    resolvingModifier(type, i, node) {
            let str;
            if (type == "ProtectedKeyword") {
                str = "protected ";
            } else if (type == "StaticKeyword") {
                if (!i)
                    str = "public static ";
                else
                    str = "static ";
            } else if (type == "PrivateKeyword") {
                str = "private ";
            } else if (type == "ReadonlyKeyword") {
                if (!i)
                    str = "public function get ";
                else
                    str = "function get ";
            } else if (type == "PublicKeyword") {
                str = "public ";
            } else {
                str = "property todo " + type;
            }
            return str;
        }
        /**
         * 生成数据类型
         * @param node
         * @param isDef 是否有默认值
         */
    emitType(node) {
        if (!node)
            return "*";
        let type = ts.SyntaxKind[node.kind];
        if (emiter.tsToasTypeObj[type])
            return emiter.tsToasTypeObj[type];
        switch (type) {
            case "TypeReference":
                //自定义类型
                type = node.typeName.getText();
                if (type == "ArrayLike") {
                    type = "Array";
                } else if (type == "Readonly") {
                    type = "";
                    for (let i = 0; i < node.typeArguments.length; i++) {
                        type += (i ? "|" : "") + this.emitType(node.typeArguments[i]);
                    }
                } else if (this.enumType.indexOf(type) != -1 || this.generList.indexOf(type) != -1) { //检测内部枚举是否是枚举类型，或者是泛型<T>
                    return "*";
                }
                //如果是内部类且有引用
                // if(this.innerClass&&this.importArr[type]&&this.classNameNow!=type){
                //     if(this.innerImportStr.indexOf(this.importArr[type])==-1){
                //         this.innerImportStr +=  "\r\n\timport " + this.importArr[type] + ";";
                //     }
                // }
                //检测tsc类型
                if (emiter.jscObj && emiter.jscObj[type]) {
                    type = emiter.jscObj[type];
                }
                if (Object.keys(this.nameSpace).length) {
                    type = this.emitNameSpace(type);
                }
                this.needimportArr.indexOf(type) == -1 && this.needimportArr.push(type);
                return type;
            case "TypeQuery":
                // console.log("console test:",node.exprName.getText());
                return "*";
            case "UnionType":
                type = "";
                node = node;
                for (let i = 0; i < node.types.length; i++) {
                    type += (i ? "|" : "") + this.emitType(node.types[i]);
                }
                type = type.replace(/\|\s*null|\|\s*undefined/gm, "");
                if (type.indexOf("|") != -1)
                    type = "*";
                this.needimportArr.indexOf(type) == -1 && this.needimportArr.push(type);
                return type;
            default:
                console.log("TODO :", type, this.url + "/" + this.classNameNow);
                return "*";
        }
    }

    /**
     * 获取ts数据类型
     */
    emitTsType(node) {
        let type;
        if (!node)
            return "any";
        if (node.exprName) {
            return "typeof " + this.emitTsType(node.exprName);
        } else if (node.typeName) {
            type = node.typeName.getText();
            //解析基础类型
            if (Object.keys(this.nameSpace).length) {
                let newtype = this.emitNameSpace(type);
                if (type != newtype) {
                    let arr = newtype.split(".");
                    type = arr[arr.length - 1];
                }
            } else if (this.importArr[type]) {
                type = this.importArr[type];
            }

            if (node.typeArguments && node.typeArguments.length) {
                type = type + "<";
                for (let i = 0; i < node.typeArguments.length; i++) {
                    type += (i ? "," : "") + this.emitTsType(node.typeArguments[i]);
                }
                type += ">";
            }
        } else {
            type = ts.SyntaxKind[node.kind];
            if (type == "ArrayType") {
                let ele = node.elementType;
                return this.emitTsType(ele) + "[]";
            } else if (type == "UnionType") {
                type = "";
                for (let i = 0; i < node.types.length; i++) {
                    let typeone = this.emitTsType(node.types[i]);
                    type += (i ? "|" : "") + typeone;
                }
            } else if (type == "TypeLiteral") {
                let _node = node;
                let typestr = "{\n\t";
                if (_node.members) {
                    for (let i = 0; i < _node.members.length; i++) {
                        let __node = _node.members[i];
                        if (__node.parameters) { //检测param
                            for (let j = 0; j < __node.parameters.length; j++) {
                                let ___node = __node.parameters[j];
                                typestr += "[ " + ___node.name.getText() + ":" + this.emitTsType(___node.type) + "]:";
                            }
                            typestr += this.emitTsType(__node.type) + ";";
                        } else {
                            let result = this.checkNodes(__node);
                            typestr += result[1] + "\n\t";
                        }
                    }
                }
                type = typestr + "}";
            } else if (type == "FunctionType") {
                let _node = node;
                type = "(";
                //方法类型
                if (_node.parameters) {
                    for (let i = 0; i < _node.parameters.length; i++) {
                        let paramNode = _node.parameters[i];
                        type += (i ? "," : "") + paramNode.name.getText() + ":" + this.emitTsType(paramNode.type);
                    }
                }
                type += ") =>" + this.emitTsType(_node.type);
            } else if (type == "TupleType") {
                type = "[";
                if (node.elements) {
                    for (let i = 0, len = node.elements.length; i < len; i++) {
                        let ele = node.elements[i];
                        type += (i ? "," : "") + this.emitTsType(ele);
                    }
                }
                type += "]";
            } else {
                type = node.getText();
            }
        }
        if (this.importArr[type])
            return this.importArr[type];
        return type;
    }

    emitArray(node) {
            let arrstr = "";
            //检测数据类型
            for (let i = 0; i < node.typeArguments.length; i++) {
                let type = this.emitTsType(node.typeArguments[i]);
                arrstr += (i ? "|" : "") + type;
            }
            return arrstr;
        }
        /**
         * 遍历节点时执行的方法
         * @param node
         */
    checkNodes(node) {
            let type = ts.SyntaxKind[node.kind];
            let fun = this.VISITORS[type];
            if (fun) {
                return fun.apply(this, [node]);
            } else {
                let str = "";
                if (emiter._typeArr.indexOf(type) != -1) {
                    // str = node.getText().replace("export ","\r\n");
                } else
                    console.log("这种类型没有准备对应的方法", type);
                // }
                return ["", str];
            }
        }
        /**
         * 编译namespace相关类型
         * @param type
         */
    emitNameSpace(type) {
            for (const key in this.nameSpace) {
                if (type.indexOf(key) === 0) {
                    let needtype = type.replace(key, this.nameSpace[key]);
                    type = type.replace(key, "");
                    this.importArr[type] = needtype;
                    return type;
                }
            }
            return type;
        }
        /**
         * 添加注释
         * @param node 节点
         * @param tabNum tab格式
         */
    changeIndex(node, tabNum) {
        let docs = node.jsDoc;
        if (docs && docs.length) {
            //第一行
            /*
             * @par...
             */
            let doc = "";
            //如果有doc记录
            for (let i = 0; i < docs.length; i++) {
                let docItem = docs[i];
                let oneDoc = "";
                if (docItem.tags) { //获取每一个tags 加一个空格好看
                    oneDoc = "";
                    for (let j = 0; j < docItem.tags.length; j++) {
                        let tag = docItem.tags[j];
                        oneDoc += tabNum + " * @" + tag.tagName.getText() + " ";
                        oneDoc += tag.name ? tag.name.getText() + " " : "";
                        oneDoc += tag.comment ? tag.comment.replace(new RegExp("\r\n", "g"), tabNum) : "";
                    }
                }
                if (docItem.comment)
                    oneDoc = tabNum + " * " + docItem.comment.replace(new RegExp("\r\n", "g"), (tabNum + " * ")) + oneDoc;
                // oneDoc += docItem.comment.replace(new RegExp("\r\n","g"),(tabNum + " * "));
                doc += tabNum + "/**" + oneDoc + tabNum + " */\r\n";
                // doc += oneDoc;
            }
            // doc += tabNum + " */\r\n"
            //  doc = this.tsData.slice(docs[0].pos,docs[docs.length - 1].end) as string;
            return doc;
        }
        return "";
    }
}
exports.emiter = emiter;
/**所有已经识别的没有准备的方法 */
emiter._typeArr = ["VariableStatement", "ExportDeclaration", "Uint16Array", "Float32Array",
    "FunctionDeclaration", "loadItem"
];
/**
 * 已知 的简单对应表
 */
emiter.tsToasTypeObj = {
    "ArrayType": "Array",
    "StringKeyword": "String",
    "BooleanKeyword": "Boolean",
    "NumberKeyword": "Number",
    "VoidKeyword": "void",
    "ConstructorType": "Class",
    "TypeLiteral": "*",
    "AnyKeyword": "*",
    "FunctionType": "Function",
    "ObjectKeyword": "Object",
    "NullKeyword": "null",
    "UndefinedKeyword": "undefined"
};
/**jsc对应的astype */
emiter.jscObj = {};
/**构成的d.ts数据 */
emiter.dtsData = "";