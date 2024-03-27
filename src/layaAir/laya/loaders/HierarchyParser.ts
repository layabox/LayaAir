import { Component } from "../components/Component";
import { Node } from "../display/Node";
import { Scene } from "../display/Scene";
import { Sprite } from "../display/Sprite";
import { Loader, ILoadURL } from "../net/Loader";
import { URL } from "../net/URL";
import { Prefab } from "../resource/HierarchyResource";
import { ClassUtils } from "../utils/ClassUtils";
import { IDecodeObjOptions, SerializeUtil } from "./SerializeUtil";

const errorList: Array<any> = [];

export class HierarchyParser {
    public static parse(data: any, options?: Record<string, any>, errors?: Array<any>): Array<Node> {
        errors = errors || errorList;
        let nodeMap: Record<string, Node> = {};
        let dataList: Array<any> = [];
        let allNodes: Array<Node> = [];
        let outNodes: Array<Node> = [];
        let scene: Scene;

        let inPrefab: boolean;
        let prefabNodeDict: Map<Node, Record<string, Node>>;
        let skinBaseUrl: string;
        let overrideData: Array<Array<any>>;

        if (options) {
            inPrefab = options.inPrefab;
            if (inPrefab)
                prefabNodeDict = options.prefabNodeDict;
            skinBaseUrl = options.skinBaseUrl;
            overrideData = options.overrideData;
        }

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

        function createNode(nodeData: any, prefab: Node, runtime?: any): Node {
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
                    let res = <Prefab>Loader.getRes(URL.getResURLByUUID(pstr), Loader.HIERARCHY);
                    if (res) {
                        if (!prefabNodeDict)
                            prefabNodeDict = new Map();

                        let overrideData2: Array<any> = [];
                        let testId = nodeData._$id;
                        if (overrideData) {
                            for (let i = 0, n = overrideData.length; i < n; i++) {
                                let arr = overrideData[i];
                                if (arr && arr.length > 0) {
                                    overrideData2[i] = arr.filter(d => {
                                        let od = d._$override || d._$parent;
                                        return Array.isArray(od) && od.length > n - i && od[n - i - 1] == testId;
                                    });
                                }
                                else
                                    overrideData2[i] = arr;
                            }
                        }

                        overrideData2.push(nodeData._$child);

                        node = res.create({ inPrefab: true, prefabNodeDict: prefabNodeDict, overrideData: overrideData2 }, errors);
                    }
                }
                else if (pstr = nodeData._$type) {
                    let cls: any = runtime ?? ClassUtils.getClass(pstr);
                    if (cls) {
                        try {
                            node = new cls();
                        }
                        catch (err: any) {
                            errors.push(err);
                        }
                    }
                    else {
                        errors.push(new Error(`unknown type '${pstr}'`));
                    }
                }

                if (node)
                    nodeMap[nodeData._$id] = node;
            }

            return node;
        }

        function getNodeByRef(idPath: string | string[]) {
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

        let bakedOverrideData: Record<string, Array<any>>;
        function getNodeData(node: Node) {
            (<Sprite>node).visible = false;

            let i = allNodes.indexOf(node);
            let nodeData = dataList[i];

            if (!overrideData)
                return nodeData;

            if (bakedOverrideData === undefined)
                bakedOverrideData = SerializeUtil.bakeOverrideData(overrideData);

            if (bakedOverrideData)
                return SerializeUtil.applyOverrideData(nodeData, bakedOverrideData);
            else
                return nodeData;
        }

        let runtime: any;
        if (data._$type || data._$prefab) {
            if (runtime = data._$runtime) {
                if (runtime.startsWith("res://"))
                    runtime = runtime.substring(6);
                let cls = ClassUtils.getClass(runtime);
                if (cls) {
                    if (!(cls instanceof Node)) {
                        errors.push(new Error(`runtime class invalid - '${runtime}', must derive from Node`));
                        cls = null;
                    }
                }
                else
                    errors.push(new Error(`runtime class not found - '${runtime}'`));
                runtime = cls;
            }

            let node = createNode(data, null, runtime);
            if (node) {
                if (data._$child)
                    createChildren(data, data._$prefab ? node : null);

                dataList.push(data);
                allNodes.push(node);

                if (node instanceof Scene)
                    scene = node;
            }
        }
        else {
            if (data._$child)
                createChildren(data, null);
        }

        let cnt = dataList.length;

        //生成树
        let k = 0;
        let outNodeData: Array<any> = [];
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
                                let nodeData2 = outNodeData[m];
                                let parentNode = findNodeInPrefab(node, nodeData2._$parent);
                                if (parentNode) {
                                    let pos = nodeData2._$index;
                                    if (pos != null && pos < parentNode.numChildren)
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
                            if (n) {
                                if (node === scene && n._is3D)
                                    scene._scene3D = <any>n;
                                else
                                    node.addChild(n);
                            }
                        }
                    }
                }
                k -= num;
            }

            outNodes[k] = node;
            outNodeData[k] = nodeData;
            k++;
        }
        outNodes.length = k;
        outNodes = outNodes.filter(n => n != null);
        let topNode = outNodes[0];

        //加载所有组件
        let compInitList: Array<any> = [];
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
                                errors.push(err);
                            }
                        }
                    }
                }

                if (comp)
                    compInitList.push(compData, comp);
            }
        }

        //设置节点属性
        const decodeOptions: IDecodeObjOptions = { outErrors: errors, getNodeByRef, getNodeData };
        for (let i = 0; i < cnt; i++) {
            let nodeData = dataList[i];
            let node = allNodes[i];
            if (node) {
                if (skinBaseUrl != null && (node instanceof Sprite))
                    node._skinBaseUrl = skinBaseUrl;

                SerializeUtil.decodeObj(nodeData, node, decodeOptions);

                if (runtime && nodeData._$var && node.name) {
                    try {
                        (<any>topNode)[node.name] = node;
                    }
                    catch (err: any) {
                        errors.push(err);
                    }
                }
            }
        }

        //设置组件属性
        cnt = compInitList.length;
        for (let i = 0; i < cnt; i += 2) {
            SerializeUtil.decodeObj(compInitList[i], compInitList[i + 1], decodeOptions);
        }

        if (inPrefab && prefabNodeDict && topNode) //记录下nodeMap，上层创建prefab时使用
            prefabNodeDict.set(topNode, nodeMap);

        if (errors == errorList)
            errorList.length = 0;

        return outNodes;
    }

    public static collectResourceLinks(data: any, basePath: string) {
        let test: Record<string, string[]> = {};
        let innerUrls: (string | ILoadURL)[] = [];

        function addInnerUrl(url: string, type: string) {
            if (!url)
                return "";
            let entry = test[url];
            if (entry === undefined) {
                let url2: string;
                if (url.length >= 36 && url.charCodeAt(8) === 45 && url.charCodeAt(13) === 45) //uuid xxxxxxxx-xxxx-...
                    url2 = "res://" + url;
                else
                    url2 = URL.join(basePath, url);
                innerUrls.push({ url: url2, type: type });
                test[url] = entry = [url2, type];
            }
            else if (entry.indexOf(type, 1) == -1) {
                entry.push(type);
                innerUrls.push({ url: entry[0], type: type });
            }
            return entry[0];
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

        if (data._$preloads) {
            for (let url of data._$preloads)
                innerUrls.push(url);
        }

        return innerUrls;
    }
}