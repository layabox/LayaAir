import { ILaya } from "../../ILaya";
import { Node } from "../display/Node";
import { Sprite } from "../display/Sprite";
import { URL } from "../net/URL";
import { PrefabImpl } from "../resource/PrefabImpl";
import { ClassUtils } from "../utils/ClassUtils";
import { SerializeUtil, TypedArrayClasses } from "./SerializeUtil";

export class ObjDecoder {
    errors: Array<any>;
    getNodeByRef: (id: string | string[]) => Node = dummy;
    getNodeData: (node: Node) => any = dummy;

    decodeObj(data: any, obj?: any, excludeKeys?: Set<string>) {
        SerializeUtil.isDeserializing = true;
        try {
            return this._decode(data, obj, excludeKeys);
        } finally {
            SerializeUtil.isDeserializing = false;
        }
    }

    decodeObjBounds(data: any, obj: Sprite) {
        SerializeUtil.isDeserializing = true;

        try {
            let v0 = data["x"];
            let v1 = data["y"];
            if (v0 !== undefined && v1 !== undefined)
                obj.pos(v0, v1);
            else if (v0 !== undefined)
                obj.x = v0;
            else if (v1 !== undefined)
                obj.y = v1;

            v0 = data["width"];
            v1 = data["height"];
            if (v0 !== undefined && v1 !== undefined)
                obj.size(v0, v1);
            else if (v0 !== undefined)
                obj.width = v0;
            else if (v1 !== undefined)
                obj.height = v1;

            v0 = data["controllers"];
            if (v0 !== undefined)
                (<any>obj).controllers = this._decode(v0);
        } finally {
            SerializeUtil.isDeserializing = false;
        }
    }

    private _decode(data: any, obj?: any, excludeKeys?: Set<string>): any {
        if (data == null)
            return null;
        else if (Array.isArray(data)) {
            let arr: any[] = [];
            for (let i = 0; i < data.length; i++) {
                let v = data[i];
                if (v != null) {
                    try {
                        arr[i] = this._decode(v);
                    }
                    catch (error: any) {
                        if (this.errors)
                            this.errors.push(error);
                        else
                            console.error(error);
                        arr[i] = null;
                    }
                }
                else
                    arr[i] = null;
            }
            return arr;
        }
        else if (typeof (data) === "object") {
            if (data._$uuid != null) {
                let url = URL.getResURLByUUID(data._$uuid);
                return ILaya.loader.getRes(url, SerializeUtil.getLoadTypeByEngineType(data._$type));
            }

            if (data._$ref != null) {
                let node = this.getNodeByRef(data._$ref);
                if (!node)
                    return null;

                if (data._$type) {
                    let cls: any = ClassUtils.getClass(data._$type);
                    if (cls)
                        return node.getComponent(cls);
                    else
                        return null;
                }
                else if (data._$ctrl !== undefined) {
                    let cls: any = ClassUtils.getClass("ControllerRef");
                    return new cls(node, data._$ctrl);
                }
                else
                    return node;
            }

            let type = data._$type;

            if (type === "any") {
                if (data._$type)
                    return data.value;
                else
                    return data;
            }

            let typedArray = TypedArrayClasses[type];
            if (typedArray != null) {
                if (data._$type)
                    return new typedArray(data.value);
                else
                    return new typedArray(data);
            }

            if (!obj) {
                let cls: any = ClassUtils.getClass(type);
                if (!cls) {
                    //this._errors.push(new Error(`missing type '${type}'`));
                    return null;
                }

                obj = new cls();
            }

            for (let key in data) {
                if (key.startsWith("_$") || excludeKeys && excludeKeys.has(key))
                    continue;

                let v = data[key];
                if (v == null || typeof (v) !== "object" || Array.isArray(v)
                    || v._$type || v._$uuid || v._$ref) {
                    try {
                        let v2 = this._decode(v);
                        obj[key] = v2;

                        if (v2 != null && v != null && v._$tmpl)
                            obj[v._$tmpl] = new PrefabImpl(null, this.getNodeData(v2));
                    }
                    catch (error: any) {
                        if (this.errors)
                            this.errors.push(error);
                        else
                            console.error(error);
                    }
                }
                else {
                    let childObj = obj[key];
                    if (childObj) {
                        try {
                            this._decode(v, childObj);
                        }
                        catch (error: any) {
                            if (this.errors)
                                this.errors.push(error);
                            else
                                console.error(error);
                        }
                    }
                }
            }

            if (obj.onAfterDeserialize) {
                try {
                    SerializeUtil._data = data;
                    obj.onAfterDeserialize();
                }
                catch (error: any) {
                    if (this.errors)
                        this.errors.push(error);
                    else
                        console.error(error);
                }
            }

            return obj;
        }
        else
            return data;
    }
}

function dummy(...args: any[]): any { return null; }