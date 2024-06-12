import * as glTF from "../glTFInterface";

import { Material, MaterialRenderMode } from "../../resource/Material";
import { IBatchProgress } from "../../net/BatchProgress";
import { Texture2D } from "../../resource/Texture2D";
import { glTFExtension } from "./glTFExtension";
import { glTFResource } from "../glTFResource";
import { PBRShaderLib } from "../../d3/shader/pbr/PBRShaderLib";
import { glTFShader } from "../shader/glTFShader";

const ExtensionName = "KHR_materials_transmission";

/** @internal */
export class KHR_materials_transmission implements glTFExtension {
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
                let extension: glTF.glTFMaterialTransmission = material.extensions?.KHR_materials_transmission;
                if (extension) {
                    if (extension.transmissionTexture) {
                        let sRGB = false;
                        let promise = this._resource.loadTextureFromInfo(extension.transmissionTexture, sRGB, basePath, progress);
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

    additionMaterialProperties(glTFMaterial: glTF.glTFMaterial, material: Material): void {
        let extension: glTF.glTFMaterialTransmission = glTFMaterial.extensions.KHR_materials_transmission;

        let transmissionFactor = extension.transmissionFactor ?? 0.0;
        material.materialRenderMode = MaterialRenderMode.RENDERMODE_CUSTOME;
        material.renderQueue = 3000;

        material.setDefine(PBRShaderLib.DEFINE_TRANSMISSION, true);

        material.setFloat("u_TransmissionFactor", transmissionFactor);

        if (extension.transmissionTexture) {
            this._resource.setMaterialTextureProperty(material, extension.transmissionTexture, "u_TransmissionTexture", glTFShader.Define_TransmissionMap, "u_TransmissionMapTransform", glTFShader.Define_TransmissionMapTransform);
        }
    }

}

glTFResource.registerExtension(ExtensionName, (resource) => new KHR_materials_transmission(resource));