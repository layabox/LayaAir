import { Component } from "../components/Component";
import { Node } from "../display/Node";
import { ClassUtils } from "../utils/ClassUtils";
import { SerializeUtil } from "./SerializeUtil";

export class HierarchyParser {
    public static parse(data: any, options?: Record<string, any>, errors?: Array<any>): Array<Node> {
        let util = new SerializeUtil();
        let nodeMap: Record<string, Node> = {};
        let allChild: Array<any> = [];
        let nodes: Array<Node> = [];
        let k = 0;
        let m = 0;
        let num: any;

        //扁平化所有节点数据
        if (data.children)
            this.collectChildren(data, allChild);

        //兼容单节点入口模式
        if (data._$type) {
            allChild.push(data);
            if (data.children)
                allChild.push(data.children.length);
        }

        let cnt = allChild.length;

        //创建所有节点对象
        for (let i = 0; i < cnt; i++) {
            let nodeData = allChild[i];
            if (typeof (nodeData) === "object") {
                let node: Node;
                if (nodeData._$type) {
                    let cls: any = ClassUtils.getClass(nodeData._$type);
                    if (cls) {
                        try {
                            node = new cls();
                        }
                        catch (err: any) {
                            errors.push(err);
                        }
                    }
                    else {
                        errors.push(new Error(`missing '${nodeData._$type}'`));
                    }
                }

                if (node)
                    nodeMap[nodeData._$id] = node;
                nodes.push(node);
            }
        }

        //设置属性
        for (let i = 0; i < cnt; i++) {
            let nodeData = allChild[i];
            if (typeof (nodeData) === "object") {
                let node = nodes[m++];
                if (node)
                    util.decodeObj(nodeData, node, null, nodeMap);
            }
        }

        //生成树
        m = 0;
        for (let i = 0; i < cnt; i++) {
            if ((num = allChild[i]) >= 0) {
                k--;
                let parentNode = nodes[k];
                if (parentNode) {
                    for (let j = 0; j < num; j++) {
                        let n = nodes[k - num + j];
                        if (n)
                            parentNode.addChild(n);
                    }
                }
                k -= num;
                nodes[k] = parentNode;
            }
            else {
                if (k != m)
                    nodes[k] = nodes[m];
                m++;
            }
            k++;
        }
        nodes.length = k;

        //加载所有组件
        for (let i = 0; i < cnt; i++) {
            let nodeData = allChild[i];
            if (typeof (nodeData) === "object") {
                if (nodeData.components) {
                    let node = nodeMap[nodeData._$id];
                    if (!node)
                        continue;
                    let components: Array<Component> = (<any>node)._components;
                    if (!components)
                        components = (<any>node)._components = [];

                    for (let compData of nodeData.components) {
                        let comp: Component;
                        let cls: any = ClassUtils.getClass(compData._$type);
                        if (!cls)
                            continue;

                        try {
                            comp = new cls();
                            comp.owner = node;
                            components.push(comp);
                            comp._onAdded();

                            util.decodeObj(compData, comp, null, nodeMap);
                        }
                        catch (err: any) {
                            errors.push(err);
                        }
                    }
                }
            }
        }

        return nodes.filter(n => n != null);
    }

    private static collectChildren(data: any, result: Array<any>) {
        for (let child of data.children) {
            if (child.children) {
                this.collectChildren(child, result);
                result.push(child);
                result.push(child.children.length);
            }
            else
                result.push(child);
        }
    }

    public static collectResourceLinks(data: any) {
        let test = new Set();
        let innerUrls: string[] = [];

        function addInnerUrl(uuid: string) {
            if (!test.has(uuid)) {
                test.add(uuid);
                innerUrls.push("res://" + uuid);
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
                                addInnerUrl(item._$uuid);
                            else
                                check(item);
                        }
                    }
                }
                else if (typeof (child) === "object") {
                    if (child._$uuid != null)
                        addInnerUrl(child._$uuid);
                    else
                        check(child);
                }
            }
        }

        check(data);

        return innerUrls;
    }
}