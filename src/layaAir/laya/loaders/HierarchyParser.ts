import { Component } from "../components/Component";
import { Node } from "../display/Node";
import { Loader, ILoadURL } from "../net/Loader";
import { HierarchyResource } from "../resource/HierarchyResource";
import { ClassUtils } from "../utils/ClassUtils";
import { SerializeUtil } from "./SerializeUtil";

export class HierarchyParser {
    public static parse(data: any, options?: Record<string, any>, errors?: Array<any>): Array<Node> {
        let nodeMap: Record<string, Node> = {};
        let dataList: Array<any> = [];
        let allNodes: Array<Node> = [];
        let outNodes: Array<Node> = [];

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
                if (prefab) {
                    let map = (<any>prefab).$prefabNodeMap;
                    if (map) {
                        if (Array.isArray(pstr)) {
                            for (let i = 0, n = pstr.length - 1; i < n; i++) {
                                if (!map) {
                                    node = null;
                                    break;
                                }
                                node = map[pstr[i]];
                                if (!node)
                                    break;

                                map = (<any>node).$prefabNodeMap;
                            }
                        }
                        else
                            node = map[nodeData._$override];
                    }
                }
            }
            else {
                if (pstr = nodeData._$prefab) { //prefab根节点
                    let res = <HierarchyResource>Loader.getRes("res://" + pstr, Loader.HIERARCHY);
                    if (res)
                        node = res.createNodes(null, errors);
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
                    return HierarchyParser.findNodeInPrefab(prefab, idPath, 1);
                else
                    return prefab;
            }
            else
                return nodeMap[idPath];
        }

        //创建所有节点对象，反向，先生成父再生成子，预制体需要这样
        if (data._$child)
            createChildren(data, null);

        //兼容单节点入口模式
        if (data._$type)
            createNode(data, null);

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
                                let parentNode = HierarchyParser.findNodeInPrefab(node, nodeData2._$parent);
                                if (parentNode) {
                                    let pos = nodeData2._$index;
                                    if (pos != null)
                                        parentNode.addChildAt(n, pos);
                                    else
                                        parentNode.addChild(n);
                                }
                                else {
                                    //预制体的节点可能被删掉了
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

        if (outNodes.length == 1) { //记录下nodeMap，上层创建prefab时使用
            (<any>outNodes[0]).$prefabNodeMap = nodeMap;
            //todo: 需要找时机清除
        }

        return outNodes;
    }

    private static findNodeInPrefab(prefab: Node, idPath: string | string[], startIndex: number = 0) {
        if (!idPath)
            return prefab;

        let map = (<any>prefab).$prefabNodeMap;
        if (!map)
            return null;

        if (Array.isArray(idPath)) {
            let node: Node;
            for (let i = startIndex, n = idPath.length - 1; i < n; i++) {
                if (!map)
                    return null;

                node = map[idPath[i]];
                if (!node)
                    break;

                map = (<any>node).$prefabNodeMap;
            }
            return node;
        }
        else
            return map[idPath];
    }

    public static collectResourceLinks(data: any) {
        let test = new Set();
        let innerUrls: ILoadURL[] = [];

        function addInnerUrl(uuid: string, type: string) {
            if (!test.has(uuid)) {
                test.add(uuid);
                innerUrls.push({ url: "res://" + uuid, type: type });
            }
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
                                addInnerUrl(item._$uuid, item._$type == "Laya.Texture2D" ? "Laya.Texture2D" : null);
                            else if (item._$prefab != null) {
                                addInnerUrl(item._$prefab, Loader.HIERARCHY);
                                check(item);
                            }
                            else
                                check(item);
                        }
                    }
                }
                else if (typeof (child) === "object") {
                    if (child._$uuid != null)
                        addInnerUrl(child._$uuid, child._$type == "Laya.Texture2D" ? "Laya.Texture2D" : null);
                    else if (child._$prefab != null) {
                        addInnerUrl(child._$prefab, Loader.HIERARCHY);
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