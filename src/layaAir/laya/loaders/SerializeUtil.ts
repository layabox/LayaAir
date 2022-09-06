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

    public static decodeObj(data: any, receiver?: any, type?: string, nodeFinder?: (id: string | Array<string>) => Node, errors?: Array<any>): any {
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
                return ILaya.loader.getRes("res://" + data._$uuid, data._$type === "Laya.Texture2D" ? Loader.TEXTURE2D : null);
            }

            if (data._$ref != null) {
                return nodeFinder?.(data._$ref);
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

            if (!receiver) {
                let cls: any = ClassUtils.getClass(type);
                if (!cls) {
                    //this._errors.push(new Error(`missing type '${type}'`));
                    return null;
                }

                receiver = new cls();
            }

            let isNode = receiver instanceof Node;
            for (let key in data) {
                if (key.startsWith("_$") || (isNode && (key === "children" || key == "components")))
                    continue;

                let v = data[key];
                if (v == null || typeof (v) !== "object" || Array.isArray(v)
                    || v._$type || v._$uuid || v._$ref) {
                    try {
                        receiver[key] = SerializeUtil.decodeObj(v, null, null, nodeFinder, errors);
                    }
                    catch (error: any) {
                        if (errors)
                            errors.push(error);
                    }
                }
                else {
                    let childObj = receiver[key];
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

            if (receiver.onAfterDeserialize)
                receiver.onAfterDeserialize();

            return receiver;
        }
        else
            return data;
    }
}