"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const path = require("path");
class emiter {
    constructor() {
        this.outString = "";
        //中转用ts 数据
        this.copyTSdata = "";
        //import待替换结构
        this.importArr = {};
        this.VISITORS = {
            "ImportDeclaration": this.emitImport,
            "ClassDeclaration": this.emitClass,
            "PropertyDeclaration": this.emitProperty,
            "MethodDeclaration": this.emitMethod,
            "Constructor": this.emitConstructor,
            "InterfaceDeclaration": this.emitInterface,
            "MethodSignature": this.emitMethodSig,
            "PropertySignature": this.emitPropertySing //生成interface属性
        };
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
        let isAdd = false;
        let node;
        for (let i = 0; i < nodes.length; i++) {
            node = nodes[i];
            let str = this.checkNodes(node);
            this.outString += str[0];
            this.copyTSdata += str[1];
            if (!isAdd && str[0].indexOf("public class") != -1 || str[0].indexOf("interface") != -1) {
                isAdd = true;
                this.outString = "package " + _url.replace(new RegExp("\\\\", "g"), ".") + " {\r\n" + this.outString + "\r\n}\r\n";
            }
        }
        //对ts构成重写
        if (_url != "") {
            let packageUrl = _url.replace(new RegExp("\\\\", "g"), ".");
            this.copyTSdata = "\r\ndeclare module " + packageUrl + " {\r\n" + this.copyTSdata + "\r\n}\r\n";
        }
        else {
            //没有在module内
            this.copyTSdata = this.copyTSdata.replace("class", "declare class");
        }
        // if(Object.keys(this.importArr).length){
        //     for(let key in this.importArr){
        //         this.copyTSdata.replace(new RegExp(key,"g"),this.importArr[key]);
        //     }
        // }
        return this.outString;
    }
    /**
     * 生成import
     * @param node
     */
    emitImport(node) {
        let classPath;
        let nodes = node.getChildren();
        let _node, type;
        let importName;
        for (let i = 0; i < nodes.length; i++) {
            _node = nodes[i];
            type = ts.SyntaxKind[_node.kind];
            if (type == "StringLiteral") {
                let _nodeText = JSON.parse(_node.getText());
                if (_nodeText.charAt(0) == ".") {
                    let thisPath = path.join(emiter.BaseURL, this.url);
                    let realPath = path.resolve(thisPath, _nodeText);
                    classPath = path.relative(emiter.BaseURL, realPath);
                }
                else {
                    classPath = _nodeText.replace(new RegExp("(/)", "g"), "\\");
                }
            }
            else if (type == "ImportClause") {
                importName = _node.namedBindings.elements[0].getText();
            }
        }
        if (classPath.indexOf("\\") == -1 && classPath.indexOf("/") == -1)
            return ["\r\n", ""];
        classPath = classPath.replace(new RegExp("\\\\", "g"), ".");
        classPath = classPath.replace(new RegExp("/", "g"), ".");
        this.importArr[importName] = classPath;
        return ["\timprot " + classPath + ";\r\n", ""];
    }
    /**
     * 生成class
     * @param node
     */
    emitClass(node) {
        let nodeName = node.name.getText();
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
                    if (this.importArr[typeText])
                        typeText = this.importArr[typeText];
                    let argtext = "";
                    //如果有进行检测 加
                    if (type.typeArguments) {
                        for (let n = 0; n < type.typeArguments.length; n++) {
                            let typenode = type.typeArguments[n].getText();
                            if (this.importArr[typenode])
                                typenode = this.importArr[typenode];
                            argtext += (n ? "|" : "<") + typenode;
                        }
                        argtext += ">";
                    }
                    nodetextAS += (j ? "," : "") + typeText;
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
        if (this.url != "")
            emiter.dtsData += note + "\r\n\tclass " + nodeName + typestr + " extends " + this.url.replace(new RegExp("\\\\", "g"), ".") + "." + nodeName + typestr + " {}\r\n";
        return [note + str, note + tstr];
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
        str = "\tpublic interface " + node.name.getText() + " {\r\n" + str + "\t}\r\n";
        tstr = "\tinterface " + node.name.getText() + "{\r\n" + tstr + "\t}\r\n";
        let note = this.changeIndex(node, "\r\n\t");
        return [note + str, note + tstr];
    }
    /**
     * 生成接口方法
     * @param node
     */
    emitMethodSig(node) {
        let methodstr = "\t\tfunction ";
        let tsMethod = "\t\t";
        let paramstr = "";
        if (node.parameters && node.parameters.length) {
            for (let i = 0; i < node.parameters.length; i++) {
                let param = node.parameters[i];
                paramstr += (i ? "," : "") + param.name.getText() + ":" + this.emitType(param.type);
            }
        }
        methodstr += node.name.getText() + "(" + paramstr + "):" + this.emitType(node.type);
        let note = this.changeIndex(node, "\r\n\t\t");
        return [note + methodstr + "\r\n", note + "\r\n\t\t" + tsMethod];
    }
    /**
     * 生成属性
     * @param node
     */
    emitProperty(node) {
        let propertystr = "\t\t";
        let tspropert = "\t\t";
        if (node.modifiers) {
            for (let i = 0; i < node.modifiers.length; i++) {
                let childnode = node.modifiers[i];
                let type = ts.SyntaxKind[childnode.kind];
                propertystr += this.resolvingModifier(type, i, childnode);
                tspropert += childnode.getText() + " ";
            }
        }
        else {
            propertystr += "public ";
        }
        let isGetset = propertystr.indexOf("function get") != -1;
        propertystr += (isGetset ? "" : "var ") + node.name.getText() + (isGetset ? "()" : "") + ":" + this.emitType(node.type) + (isGetset ? "{}" : "");
        tspropert += node.name.getText() + ":" + this.emitTsType(node.type) + ";";
        let note = this.changeIndex(node, "\r\n\t\t");
        return [note + propertystr + ";\r\n", note + tspropert + "\r\n"];
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
                let type = ts.SyntaxKind[childnode.kind];
                // i + 1确保不会加public
                propertystr += this.resolvingModifier(type, i + 1, childnode);
                tspro += childnode.getText() + " ";
            }
        }
        let isGetset = propertystr.indexOf("function get") != -1;
        propertystr += (isGetset ? "" : "var ") + node.name.getText() + (isGetset ? "()" : "") + ":" + this.emitType(node.type);
        tspro += node.name.getText() + ":" + this.emitTsType(node.type);
        let note = this.changeIndex(node, "\r\n\t\t");
        return [note + propertystr + ";\r\n", note + tspro + ";\r\n"];
    }
    /**
     * 生成方法
     * @param node
     */
    emitMethod(node) {
        let methodstr = "\t\t";
        let tsmethod = "\t\t";
        if (node.modifiers) {
            for (let i = 0; i < node.modifiers.length; i++) {
                let childnode = node.modifiers[i];
                let type = ts.SyntaxKind[childnode.kind];
                methodstr += this.resolvingModifier(type, i, childnode);
                tsmethod += childnode.getText() + " ";
            }
            methodstr += "function ";
        }
        else {
            methodstr += "public function ";
        }
        let paramstr = "";
        let tsparam = "";
        if (node.parameters) {
            for (let i = 0; i < node.parameters.length; i++) {
                let param = node.parameters[i];
                paramstr += (i ? "," : "") + param.name.getText() + ":" + this.emitType(param.type) + (param.questionToken ? " = null" : "");
                tsparam += (i ? "," : "") + param.name.getText() + (param.questionToken ? "?" : "") + ":" + this.emitTsType(param.type);
            }
        }
        methodstr += node.name.getText() + "(" + paramstr + "):" + this.emitType(node.type) + "{}";
        tsmethod += node.name.getText() + "(" + tsparam + "):" + this.emitTsType(node.type) + ";";
        let note = this.changeIndex(node, "\r\n\t\t");
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
            for (let i = 0; i < node.parameters.length; i++) {
                let param = node.parameters[i];
                asstr += (i ? "," : "") + param.name.getText() + ":" + this.emitType(param.type) + (param.questionToken ? " = null" : "");
                tsstr += (i ? "," : "") + param.name.getText() + (param.questionToken ? "?" : "") + ":" + this.emitTsType(param.type);
            }
        }
        asstr = "\r\n\t\tpublic function " + node.parent.name.getText() + "(" + asstr + "){}\r\n";
        tsstr = "\r\n\t\tconstructor(" + tsstr + ");\r\n";
        return [note + asstr, note + tsstr];
    }
    /**
     * 解析单个Modifier的类型
     * @param type
     */
    resolvingModifier(type, i, node) {
        let str;
        if (type == "ProtectedKeyword") {
            str = "protected ";
        }
        else if (type == "StaticKeyword") {
            if (!i)
                str = "public static ";
            else
                str = "static ";
        }
        else if (type == "PrivateKeyword") {
            str = "private ";
        }
        else if (type == "ReadonlyKeyword") {
            if (!i)
                str = "public function get ";
            else
                str = "function get ";
        }
        else {
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
        switch (type) {
            case "ArrayType":
                return "Array";
            case "StringKeyword":
                return "String";
            case "AnyKeyword":
                return "*";
            case "BooleanKeyword":
                return "Boolean";
            case "NumberKeyword":
                return "Number";
            case "VoidKeyword":
                return "void";
            case "TypeReference":
                //自定义类型
                let type = node.typeName.getText();
                if (type == "ArrayLike")
                    type = "Array";
                //检测是否是枚举类型
                if (emiter.enumType.indexOf(type) != -1)
                    return "*";
                return type;
            case "ConstructorType":
                return "Class";
            case "TypeQuery":
                return node.exprName.getText();
            case "UnionType":
                return "*";
            case "FunctionType":
                return "Function";
            default:
                console.log("TODO :", type);
                return "";
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
            type = node.exprName.getText();
        }
        else if (node.typeName) {
            type = node.typeName.getText();
            if (type == "ArrayLike") {
                type = "ArrayLike<" + this.emitArray(node) + ">";
            }
            else if (type == "Array") {
                type = "Array<" + this.emitArray(node) + ">";
            }
            else if (this.importArr[type])
                type = this.importArr[type];
        }
        else {
            type = ts.SyntaxKind[node.kind];
            if (type == "ArrayType") {
                let ele = node.elementType;
                if (ts.SyntaxKind[ele.kind] == "TypeReference") {
                    type = ele.getText();
                    if (this.importArr[type]) {
                        return this.importArr[type] + "[]";
                    }
                    else {
                        if (emiter._typeArr.indexOf(type) == -1)
                            console.log("未知类型", type);
                        return type + "[]";
                    }
                }
                else
                    type = node.getText();
            }
            else if (type == "UnionType") {
                type = "";
                for (let i = 0; i < node.types.length; i++) {
                    let typeone = node.types[i];
                    typeone = typeone.getText();
                    if (this.importArr[typeone])
                        typeone = this.importArr[typeone];
                    type += typeone + (i == node.types.length - 1 ? "" : "|");
                }
            }
            else
                type = node.getText();
        }
        if (this.importArr[type])
            return this.importArr[type];
        return type;
    }
    emitArray(node) {
        let arrstr = "";
        //检测数据类型
        for (let i = 0; i < node.typeArguments.length; i++) {
            let typeText = node.typeArguments[i].getText();
            if (this.importArr[typeText])
                typeText = this.importArr[typeText];
            arrstr += (i ? "|" : "") + typeText;
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
        }
        else {
            let str = "";
            if (type == "EnumDeclaration") {
                str = node.getText().replace("export declare ", "");
                emiter.enumType.push(node.name.getText());
            }
            else {
                if (emiter._typeArr.indexOf(type) != -1) {
                    // str = node.getText().replace("export ","\r\n");
                }
                else
                    console.log("这种类型没有准备对应的方法", type);
            }
            return ["", str];
        }
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
                doc += tabNum + "/*" + oneDoc + tabNum + " */\r\n";
                // doc += oneDoc;
            }
            // doc += tabNum + " */\r\n"
            //  doc = this.tsData.slice(docs[0].pos,docs[docs.length - 1].end) as string;
            return doc;
        }
        return "";
    }
}
/**所有已经识别的没有准备的方法 */
emiter._typeArr = ["VariableStatement", "ExportDeclaration", "Uint16Array", "Float32Array",
    "FunctionDeclaration"];
/**
 * 枚举类型
 */
emiter.enumType = [];
/**构成的d.ts数据 */
emiter.dtsData = "";
exports.emiter = emiter;
