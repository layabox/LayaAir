import { ILaya } from "../../ILaya";
import { Node } from "../display/Node";
import { Loader } from "../net/Loader";
import { ClassUtils } from "../utils/ClassUtils";

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

    public static decodeObj(data: any, obj?: any, type?: string, nodeFinder?: (id: string | Array<string>) => Node, errors?: Array<any>): any {
        if (data == null)
            return null;
        else if (Array.isArray(data)) {
            let arr: any[] = [];
            for (let i = 0; i < data.length; i++) {
                let v = data[i];
                if (v != null) {
                    try {
                        arr[i] = this.decodeObj(v, null, null, nodeFinder, errors);
                    }
                    catch (error: any) {
                        if (errors)
                            errors.push(error);
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
                let url: string = data._$uuid;
                if (url.length >= 36 && url.charCodeAt(8) === 45 && url.charCodeAt(13) === 45) //uuid xxxxxxxx-xxxx-...
                    url = "res://" + url;
                return ILaya.loader.getRes(url, SerializeUtil.getLoadTypeByEngineType(data._$type));
            }

            if (data._$ref != null) {
                let node = nodeFinder?.(data._$ref);
                if (node && data._$type) {
                    let cls: any = ClassUtils.getClass(data._$type);
                    if (cls)
                        return node.getComponent(cls);
                    else
                        return null;
                }
                else
                    return node;
            }

            type = type || data._$type;

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
                if (key.startsWith("_$"))
                    continue;

                let v = data[key];
                if (v == null || typeof (v) !== "object" || Array.isArray(v)
                    || v._$type || v._$uuid || v._$ref) {
                    try {
                        obj[key] = SerializeUtil.decodeObj(v, null, null, nodeFinder, errors);
                    }
                    catch (error: any) {
                        if (errors)
                            errors.push(error);
                    }
                }
                else {
                    let childObj = obj[key];
                    if (childObj) {
                        try {
                            SerializeUtil.decodeObj(v, childObj, null, nodeFinder, errors);
                        }
                        catch (error: any) {
                            if (errors)
                                errors.push(error);
                        }
                    }
                }
            }

            if (obj.onAfterDeserialize)
                obj.onAfterDeserialize();

            return obj;
        }
        else
            return data;
    }

    static getLoadTypeByEngineType(type: string) {
        switch (type) {
            case "Texture2D":
                return Loader.TEXTURE2D;
            case "TextureCube":
                return Loader.TEXTURECUBE;
            case "Prefab":
                return Loader.HIERARCHY;
            default:
                return null;
        }
    }
}