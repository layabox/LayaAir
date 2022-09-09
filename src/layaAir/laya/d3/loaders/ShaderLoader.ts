import { ILoadTask, IResourceLoader, Loader } from "../../net/Loader";
import { IShaderObjStructor, IShaderpassStructor, Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "../../RenderEngine/RenderShader/ShaderData";
import { Texture2D } from "../../resource/Texture2D";
import { Color } from "../math/Color";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { ParseJSON } from "../utils/ParseJSON";


/**
 * 加载shader文件,TODO 格式改变
 */
export class ShaderLoader implements IResourceLoader {
    private static CGBlock: string[] = ["CG Start", "CG End"];
    private static Split: string[] = ["#defineCG", "#endCG"];
    private static ShaderBlock: string[] = ["Shader3D Start", "Shader3D End"];
    private static shaderDataOBJ = {
        "Color": ShaderDataType.Color,
        "Int": ShaderDataType.Int,
        "Bool": ShaderDataType.Bool,
        "Float": ShaderDataType.Float,
        "Vector2": ShaderDataType.Vector2,
        "Vector3": ShaderDataType.Vector3,
        "Vector4": ShaderDataType.Vector4,
        "Matrix4x4": ShaderDataType.Matrix4x4,
        "Texture2D": ShaderDataType.Texture2D,
        "TextureCube": ShaderDataType.TextureCube,
    }
    load(task: ILoadTask) {
        return task.loader.fetch(task.url, "text", task.progress.createCallback(), task.options).then(data => {
            if (!data)
                return null;
            let obj = this._getShaderBlock(data);
            let cgmap = this._getCGBlock(data);
            this._bindCG(obj, cgmap);
            return Shader3D.parse(obj);
        });
    }

    private _compileToTree(sliceFlag: string[], data: string, sliceIndex: number): string[] {
        if (sliceIndex == sliceFlag.length)
            return [data];
        let slicedata = sliceFlag[sliceIndex];
        let splitmap = data.split(slicedata);
        if (splitmap.length == 1)
            return splitmap;
        let map: string[] = [];
        for (let i = 0, n = splitmap.length; i < n; i++) {
            map = map.concat(this._compileToTree(sliceFlag, splitmap[i], sliceIndex + 1));
            (i != n - 1) && map.push(slicedata);
        }
        return map;
    }

    private _getMapKey(value: string) {
        let index = value.indexOf("\n");
        value = value.slice(0, index).replace("\r", "");
        value = value.slice(0, index).replace(" ", "");
        return value;
    }

    /**
     * get Shader Data
     */
    _getShaderBlock(source: string) {
        let shaderData = source.substring(source.indexOf(ShaderLoader.ShaderBlock[0]) + ShaderLoader.ShaderBlock[0].length, source.indexOf(ShaderLoader.ShaderBlock[1]));
        let shaderObj;
        try {
            shaderObj = ParseJSON.parse(shaderData);//TODO new FIle parse(1、去掉繁琐的json格式报错，2、可以有注释)
        } catch {
            console.error("Shader describe Data error");
        }
        return shaderObj as IShaderObjStructor;
    }

    /**
     * get CG data for map
     * @param source 
     * @returns 
     */
    _getCGBlock(source: string): { [key: string]: string } {
        let cgdata = source.substring(source.indexOf(ShaderLoader.CGBlock[0]), source.indexOf(ShaderLoader.CGBlock[1]));
        let map = this._compileToTree(ShaderLoader.Split, cgdata, 0);
        let cgmap: { [key: string]: string } = {};
        for (let i = 0, n = map.length; i < n; i++) {
            let value = map[i];
            if (value == ShaderLoader.Split[0]) {
                i += 1
                let datavalue = map[i];
                let key = this._getMapKey(datavalue);
                cgmap[key] = datavalue.slice(datavalue.indexOf("\r\n"), datavalue.length - 1);
            }
        }
        return cgmap;
    }

    _bindCG(shaderObj: IShaderObjStructor, cgmap: { [key: string]: string }) {
        //pass trans
        let passArray = shaderObj.shaderPass as Array<IShaderpassStructor>;
        if (passArray) {
            passArray.forEach(element => {
                if (element.VS) {
                    element.VS = cgmap[element.VS];
                }
                if (element.FS) {
                    element.FS = cgmap[element.FS];
                }
            });
        }
        //attribute map trans
        let attributemap = shaderObj.attributeMap;
        if (attributemap) {
            let indexofAttribute = 0;
            for (var i in attributemap) {
                attributemap[i] = [indexofAttribute, this.getShaderDataType(attributemap[i])];
                indexofAttribute++;
            }
        }
        //uniform map trans
        let umap: any = {};
        let unirommap = shaderObj.uniformMap;
        if (unirommap) {
            for (var i in unirommap) {
                let block = unirommap[i];
                if (typeof (block) == 'object') {//Block
                    for (var j in block) {
                        block[j] = umap[j] = this.getShaderDataType(block[j]);
                    }
                } else {
                    (unirommap as any)[i] = umap[i] = this.getShaderDataType((unirommap as any)[i]);
                }
            }
        }
        //default map trans
        let defaultmap: any = shaderObj.defaultValue;
        if (defaultmap) {
            for (var k in defaultmap) {
                defaultmap[k] = this.getDefaultData(umap[k], defaultmap[k]);
            }
        }
    }

    /**
     * trans string to ShaderDataType
     * @param value 
     * @returns 
     */
    getShaderDataType(value: string): ShaderDataType {
        return (ShaderLoader.shaderDataOBJ as any)[value];
    }

    /**
     * set ShaderData Value
     * @param type 
     * @param data 
     * @returns 
     */
    getDefaultData(type: ShaderDataType, data: any) {
        switch (type) {
            case ShaderDataType.Int:
            case ShaderDataType.Float:
            case ShaderDataType.Bool:
                return data;
            case ShaderDataType.Vector2:
                return new Vector2(data[0], data[1]);
            case ShaderDataType.Vector3:
                return new Vector3(data[0], data[1], data[2]);
            case ShaderDataType.Vector4:
                return new Vector4(data[0], data[1], data[2], data[3]);
            case ShaderDataType.Color:
                return new Color(data[0], data[1], data[2], data[3]);
            case ShaderDataType.Matrix4x4:
                let mat = new Matrix4x4();
                mat.cloneByArray(data);
                return mat;
            case ShaderDataType.Texture2D:
                let tex = Texture2D.whiteTexture;
                if(data=="write")
                    tex = Texture2D.whiteTexture;
                else if(data == "black")
                    tex = Texture2D.blackTexture;
                else if(data == "gray")
                    tex = Texture2D.grayTexture;
                return tex;
        }
    }
}

Loader.registerLoader(["shader"], ShaderLoader);