import { Component } from "../components/Component";
import { Node } from "../display/Node";
import { Loader, ILoadURL } from "../net/Loader";
import { URL } from "../net/URL";
import { HierarchyResource } from "../resource/HierarchyResource";
import { ClassUtils } from "../utils/ClassUtils";
import { SerializeUtil } from "./SerializeUtil";

export class HierarchyParser {
    public static parse(data: any, options?: Record<string, any>, errors?: Array<any>): Array<Node> {
        let nodeMap: Record<string, Node> = {};
        let dataList: Array<any> = [];
        let allNodes: Array<Node> = [];
        let outNodes: Array<Node> = [];
        let inPrefab = options && options.inPrefab;
        let prefabNodeDict: Map<Node, Record<string, Node>>;
        if (inPrefab)
            prefabNodeDict = options.prefabNodeDict;

        function createChildren(data: any, prefab: Node) {
            for (let child of data._$child) {
                if (child._$child) {
                    let node = createNode(child, prefab);
                    createChildren(child, child._$prefab ? node : prefab);

                    dataList.push(child);
                    allNodes.push(node);
                }
                else {
                    let node = createNode(child, prefab);
                    dataList.push(child);
                    allNodes.push(node);
                }
            }
        }

        function createNode(nodeData: any, prefab: Node): Node {
            let node: Node;
            let pstr: string;
            if (pstr = nodeData._$override) { //prefab里的override节点
                if (prefab && prefabNodeDict) {
                    if (Array.isArray(pstr)) {
                        node = prefab;
                        for (let i = 0, n = pstr.length; i < n; i++) {
                            let map = prefabNodeDict.get(node);
                            node = map?.[pstr[i]];
                            if (!node)
                                break;
                        }
                    }
                    else {
                        let map = prefabNodeDict.get(prefab);
                        if (map)
                            node = map[nodeData._$override];
                    }
                }
            }
            else {
                if (pstr = nodeData._$prefab) { //prefab根节点
                    let res = <HierarchyResource>Loader.getRes(pstr, Loader.HIERARCHY);
                    if (res) {
                        if (!prefabNodeDict)
                            prefabNodeDict = new Map();
                        node = res.createNodes({ inPrefab: true, prefabNodeDict: prefabNodeDict }, errors);
                    }
                }
                else if (pstr = nodeData._$type) {
                    let cls: any = ClassUtils.getClass(pstr);
                    if (cls) {
                        try {
                            node = new cls();
                        }
                        catch (err: any) {
                            if (errors)
                                errors.push(err);
                        }
                    }
                    else {
                        if (errors)
                            errors.push(new Error(`missing '${pstr}'`));
                    }
                }

                if (node)
                    nodeMap[nodeData._$id] = node;
            }
            return node;
        }

        function findNode(idPath: string | string[]) {
            if (Array.isArray(idPath)) {
                let prefab = nodeMap[idPath[0]];
                if (prefab && idPath.length > 1)
                    return findNodeInPrefab(prefab, idPath, 1);
                else
                    return prefab;
            }
            else
                return nodeMap[idPath];
        }

        function findNodeInPrefab(prefab: Node, idPath: string | string[], startIndex: number = 0) {
            if (!idPath)
                return prefab;

            let map = prefabNodeDict?.get(prefab);
            if (!map)
                return null;

            if (Array.isArray(idPath)) {
                let node: Node;
                for (let i = startIndex, n = idPath.length; i < n; i++) {
                    if (!map)
                        return null;

                    node = map[idPath[i]];
                    if (!node)
                        break;

                    map = prefabNodeDict.get(node);
                }
                return node;
            }
            else
                return map[idPath];
        }

        //创建所有节点对象，反向，先生成父再生成子，预制体需要这样
        if (data._$child)
            createChildren(data, null);

        //兼容单节点入口模式
        if (data._$type) {
            let node = createNode(data, null);
            if (node) {
                dataList.push(data);
                allNodes.push(node);
            }
        }

        let cnt = dataList.length;

        //设置属性
        for (let i = 0; i < cnt; i++) {
            let nodeData = dataList[i];
            let node = allNodes[i];
            if (node) {
                SerializeUtil.decodeObj(nodeData, node, null, findNode, errors);
            }
        }

        //生成树
        let k = 0;
        for (let i = 0; i < cnt; i++) {
            let nodeData = dataList[i];
            let node = allNodes[i];

            let children: Array<any> = nodeData._$child;
            if (children) {
                let num = children.length;
                if (node) {
                    if (nodeData._$prefab) {
                        for (let j = 0; j < num; j++) {
                            let m = k - num + j;
                            let n = outNodes[m];
                            if (n && !n.parent) { //是预制体新增
                                let nodeData2 = dataList[i - num + j];
                                let parentNode = findNodeInPrefab(node, nodeData2._$parent);
                                if (parentNode) {
                                    let pos = nodeData2._$index;
                                    if (pos != null)
                                        parentNode.addChildAt(n, pos);
                                    else
                                        parentNode.addChild(n);
                                }
                                else {
                                    //挂接的节点可能被删掉了
                                    node.addChildAt(n, 0);
                                }
                            }
                        }
                    }
                    else {
                        for (let j = 0; j < num; j++) {
                            let n = outNodes[k - num + j];
                            if (n)
                                node.addChild(n);
                        }
                    }
                }
                k -= num;
            }

            outNodes[k] = node;
            k++;
        }
        outNodes.length = k;
        outNodes = outNodes.filter(n => n != null);

        //加载所有组件
        for (let i = 0; i < cnt; i++) {
            let components = dataList[i]._$comp;
            if (!components)
                continue;

            let node = allNodes[i];
            if (!node)
                continue;

            for (let compData of components) {
                let comp: Component;
                if (compData._$override) {
                    let cls: any = ClassUtils.getClass(compData._$override);
                    if (cls)
                        comp = node.getComponent(cls);
                }
                else {
                    let cls: any = ClassUtils.getClass(compData._$type);
                    if (cls) {
                        comp = node.getComponent(cls);
                        if (!comp) {
                            try {
                                comp = node.addComponent(cls);
                            }
                            catch (err: any) {
                                if (errors)
                                    errors.push(err);
                            }
                        }
                    }
                }

                if (comp)
                    SerializeUtil.decodeObj(compData, comp, null, findNode, errors);
            }
        }

        if (inPrefab && prefabNodeDict && outNodes.length > 0) //记录下nodeMap，上层创建prefab时使用
            prefabNodeDict.set(outNodes[0], nodeMap);

        return outNodes;
    }

    public static collectResourceLinks(data: any, basePath: string) {
        let test: Record<string, string> = {};
        let innerUrls: ILoadURL[] = [];

        function addInnerUrl(url: string, type: string) {
            let url2 = test[url];
            if (url2 === undefined) {
                if (url.length >= 36 && url.charCodeAt(8) === 45 && url.charCodeAt(13) === 45) //uuid xxxxxxxx-xxxx-...
                    url2 = "res://" + url;
                else
                    url2 = URL.join(basePath, url);
                innerUrls.push({ url: url2, type: type });
                test[url] = url2;
            }
            return url2;
        }

        function check(data: any) {
            for (let key in data) {
                let child = data[key];
                if (child == null)
                    continue;
                if (Array.isArray(child)) {
                    for (let item of child) {
                        if (item == null)
                            continue;

                        if (typeof (item) === "object") {
                            if (item._$uuid != null)
                                item._$uuid = addInnerUrl(item._$uuid, SerializeUtil.getLoadTypeByEngineType(item._$type));
                            else if (item._$prefab != null) {
                                item._$prefab = addInnerUrl(item._$prefab, Loader.HIERARCHY);
                                check(item);
                            }
                            else
                                check(item);
                        }
                    }
                }
                else if (typeof (child) === "object") {
                    if (child._$uuid != null)
                        child._$uuid = addInnerUrl(child._$uuid, SerializeUtil.getLoadTypeByEngineType(child._$type));
                    else if (child._$prefab != null) {
                        child._$prefab = addInnerUrl(child._$prefab, Loader.HIERARCHY);
                        check(child);
                    }
                    else
                        check(child);
                }
            }
        }

        check(data);

        return innerUrls;
    }
}