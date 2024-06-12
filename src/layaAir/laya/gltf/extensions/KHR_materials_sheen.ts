import * as glTF from "../glTFInterface";

import { Material } from "../../resource/Material";
import { IBatchProgress } from "../../net/BatchProgress";
import { glTFMaterial } from "../glTFInterface";
import { glTFExtension } from "./glTFExtension";
import { glTFResource } from "../glTFResource";
import { Texture2D } from "../../resource/Texture2D";
import { Vector3 } from "../../maths/Vector3";
import { PBRShaderLib } from "../../d3/shader/pbr/PBRShaderLib";
import { glTFShader } from "../shader/glTFShader";

const ExtensionName = "KHR_materials_sheen";

/** @internal */
export class KHR_materials_sheen implements glTFExtension {
    readonly name: string = ExtensionName;

    private _resource: glTFResource;

    constructor(resource: glTFResource) {
        this._resource = resource;
    }

    loadAdditionTextures(basePath: string, progress?: IBatchProgress): Promise<any> {
        let materials = this._resource.data.materials;
        let textures = this._resource.data.textures;

        if (materials && textures) {
            let promises: Array<Promise<Texture2D>> = [];
            materials.forEach(material => {
                let extension: glTF.glTFMaterialSheen = material.extensions?.KHR_materials_sheen;
                if (extension) {
                    if (extension.sheenColorTexture) {
                        let sRGB = false;
                        let promise = this._resource.loadTextureFromInfo(extension.sheenColorTexture, sRGB, basePath, progress);
                        promises.push(promise);
                    }
                    if (extension.sheenRoughnessTexture) {
                        let sRGB = false;
                        let promise = this._resource.loadTextureFromInfo(extension.sheenRoughnessTexture, sRGB, basePath, progress);
                        promises.push(promise);
                    }
                }
            });

            return Promise.all(promises);
        }
        else {
            return Promise.resolve();
        }
    }
    additionMaterialProperties(glTFMaterial: glTFMaterial, material: Material): void {
        let extension: glTF.glTFMaterialSheen = glTFMaterial.extensions.KHR_materials_sheen;

        material.setDefine(PBRShaderLib.DEFINE_SHEEN, true);

        let sheenColorFactor = new Vector3(0, 0, 0);
        if (extension.sheenColorFactor) {
            sheenColorFactor.fromArray(extension.sheenColorFactor);
        }
        let sheenRoughnessFactor = extension.sheenRoughnessFactor ?? 0.0;

        material.setVector3("u_SheenColorFactor", sheenColorFactor);
        material.setFloat("u_SheenRoughness", sheenRoughnessFactor);

        if (extension.sheenColorTexture) {
            this._resource.setMaterialTextureProperty(material, extension.sheenColorTexture, "u_SheenColorTexture", glTFShader.Define_SheenColorMap, "u_SheenColorMapTransform", glTFShader.Define_SheenColorMapTransform);
        }

        if (extension.sheenRoughnessTexture) {
            this._resource.setMaterialTextureProperty(material, extension.sheenRoughnessTexture, "u_SheenRoughnessTexture", glTFShader.Define_SheenRoughnessMap, "u_SheenRoughnessMapTransform", glTFShader.Define_SheenRoughnessMapTransform);
        }

    }

}

glTFResource.registerExtension(ExtensionName, (resource) => new KHR_materials_sheen(resource));