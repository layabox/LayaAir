import { Loader } from "../net/Loader";
import { ObjDecoder } from "./ObjDecoder";

export const TypedArrayClasses: Record<string, any> = {
    "Int8Array": Int8Array,
    "Uint8Array": Uint8Array,
    "Int16Array": Int16Array,
    "Uint16Array": Uint16Array,
    "Int32Array": Int32Array,
    "Uint32Array": Uint32Array,
    "Float32Array": Float32Array,
    "Float64Array": Float64Array
};

export class SerializeUtil {
    public static isDeserializing = false;

    static _data: any;

    static hasProp(...keys: string[]): boolean {
        for (let k of keys) {
            if (SerializeUtil._data[k] !== undefined)
                return true;
        }
        return false;
    }

    static decodeObj(data: any, obj?: any): any {
        return ObjDecoder.decodeObj(data, obj);
    }

    static getLoadTypeByEngineType(type: string) {
        return Loader.assetTypeToLoadType[type];
    }

    static bakeOverrideData(overrideData: any) {
        let dataMap: Record<string, Array<any>> = null;
        for (let n = overrideData.length, i = n - 1; i >= 0; i--) {
            let arr = overrideData[i];
            if (arr && arr.length > 0) {
                for (let d of arr) {
                    let od = d._$override || d._$parent;
                    let k: string;
                    if (Array.isArray(od))
                        k = od[n - i - 1];
                    else if (i == n - 1)
                        k = od;

                    if (k != null) {
                        if (!dataMap) dataMap = {};
                        let arr2 = dataMap[k];
                        if (!arr2)
                            dataMap[k] = arr2 = [];
                        arr2.push(n - i, d);
                    }
                }
            }
        }

        return dataMap;
    }

    static applyOverrideData(nodeData: any, overrideDataMap: Record<string, Array<any>>) {
        function test(obj: any) {
            if (overrideDataMap[obj._$id])
                return true;

            let children: Array<any> = obj._$child;
            if (children && children.find(child => test(child)))
                return true;

            return false;
        }

        function cloneTree(obj: any) {
            let ret = Object.assign({}, obj);
            let children: Array<any> = ret._$child;
            if (children)
                ret._$child = children.map(c => cloneTree(c));
            let comps: Array<any> = ret._$comp;
            if (comps)
                ret._$comp = comps.map(c => Object.assign({}, c));
            return ret;
        }

        function visit(data: any) {
            let children: Array<any> = data._$child;
            if (children) {
                for (let child of children) {
                    if (child._$id)
                        visit(child);
                }
            }

            let od = overrideDataMap[data._$id];
            if (od) {
                for (let i = 0; i < od.length; i += 2) {
                    let j = od[i];
                    let e = od[i + 1];
                    let idPath: string | string[];
                    if (idPath = e._$override) {
                        let toWrite: any;
                        if (Array.isArray(idPath)) {
                            if (j == idPath.length - 1) {
                                let k = idPath[j];
                                if (!children)
                                    data._$child = children = [];
                                else
                                    toWrite = children.find(c => c._$override == k);
                                if (!toWrite) {
                                    toWrite = { _$override: k };
                                    children.push(toWrite);
                                }
                            }
                            else if (j < idPath.length - 1) {
                                let k = idPath.slice(j);
                                if (!children)
                                    data._$child = children = [];
                                else {
                                    toWrite = children.find(c => {
                                        let o = c._$override;
                                        return Array.isArray(o) && arrayEquals(o, k);
                                    });
                                }
                                if (!toWrite) {
                                    toWrite = { _$override: k };
                                    children.push(toWrite);
                                }
                            }
                            else
                                toWrite = data;
                        }
                        else
                            toWrite = data;

                        mergeData(toWrite, e);
                        if (e._$comp) {
                            let comps: Array<any> = toWrite._$comp;
                            if (!comps)
                                toWrite._$comp = comps = [];
                            for (let comp of e._$comp) {
                                let typeOrId = comp._$type || comp._$override;
                                let c = comps.find(c => c._$override == typeOrId || c._$type == typeOrId || c._$id == typeOrId);
                                if (!c) {
                                    c = {};
                                    if (comp._$type)
                                        c._$type = typeOrId;
                                    else
                                        c._$override = typeOrId;
                                    comps.push(c);
                                }
                                mergeData(c, comp);
                            }
                        }
                    }
                    else if (idPath = e._$parent) { //增加的节点
                        if (!children)
                            data._$child = children = [];
                        let k: string | string[];
                        if (j < idPath.length) { //挂接的节点在嵌套预制体内部
                            if (j == idPath.length - 1)
                                k = idPath[j];
                            else
                                k = idPath.slice(j);
                            let toWrite = Object.assign({}, e);
                            //todo: toWrite._$id有极小几率重复？
                            toWrite._$parent = k;
                            children.push(toWrite);
                        }
                        else {
                            let toWrite = Object.assign({}, e);
                            //todo: toWrite._$id有极小几率重复？
                            delete toWrite._$parent;
                            if (data._$prefab) {
                                children.push(toWrite);
                            }
                            else {
                                delete toWrite._$index;
                                if (e._$index < children.length)
                                    children.splice(e._$index, 0, toWrite);
                                else
                                    children.push(toWrite);
                            }
                        }
                    }
                }
            }
        }

        if (test(nodeData)) {
            nodeData = cloneTree(nodeData);
            visit(nodeData);
        }

        return nodeData;
    }
}

function mergeData(target: any, overrided: any) {
    for (let k in overrided) {
        if (k.startsWith("_$"))
            continue;

        let v = overrided[k];
        if (v != null && typeof (v) === "object" && !Array.isArray(v) && !(v._$type || v._$uuid || v._$ref)) {
            let v2 = target[k];
            if (v2 != null && typeof (v2) === "object") {
                target[k] = v2 = Object.assign({}, v2);
                mergeData(v2, v);
            }
            else
                target[k] = v;
        }
        else
            target[k] = v;
    }
}

function arrayEquals(a: ReadonlyArray<any>, b: ReadonlyArray<any>): boolean {
    if (a.length === b.length) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}