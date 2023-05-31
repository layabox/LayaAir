import * as glTF from "../glTFInterface";

import { IBatchProgress } from "../../net/BatchProgress";
import { Texture2D } from "../../resource/Texture2D";
import { glTFResource } from "../glTFResource";
import { glTFExtension } from "./glTFExtension";
import { Material } from "../../d3/core/material/Material";
import { PBRShaderLib } from "../../d3/shader/pbr/PBRShaderLib";
import { glTFShader } from "../shader/glTFShader";

const ExtensionName = "KHR_materials_iridescence";

declare module "../glTFInterface" {

    export interface glTFMaterialIridescence {
        /** The iridescence intensity factor. default: 0.0 */
        iridescenceFactor: number;
        /** The iridescence intensity texture. */
        iridescenceTexture: glTFTextureInfo;
        /** The index of refraction of the dielectric thin-film layer. default: 1.3 */
        iridescenceIor: number;
        /** The minimum thickness of the thin-film layer given in nanometers. default: 100.0 */
        iridescenceThicknessMinimum: number;
        /** The maximum thickness of the thin-film layer given in nanometers. default: 400.0 */
        iridescenceThicknessMaximum: number;
        /** The thickness texture of the thin-film layer. */
        iridescenceThicknessTexture: glTFTextureInfo;
    }

}

export class KHR_materials_iridescence implements glTFExtension {
    readonly name: string = ExtensionName;

    private _resource: glTFResource;

    constructor(resource: glTFResource) {
        this._resource = resource;
    }


    loadTextures(basePath: string, progress?: IBatchProgress): Promise<any> {
        let materials = this._resource.data.materials;
        let textures = this._resource.data.textures;

        if (materials && textures) {
            let promises: Array<Promise<Texture2D>> = [];
            materials.forEach(material => {
                let extension: glTF.glTFMaterialIridescence = material.extensions?.KHR_materials_iridescence;
                if (extension) {
                    if (extension.iridescenceTexture) {
                        let index = extension.iridescenceTexture.index;
                        let promise = this._resource.loadTextureFromglTF(index, false, basePath, progress);
                        promises.push(promise);
                    }
                    if (extension.iridescenceThicknessTexture) {
                        let index = extension.iridescenceThicknessTexture.index;
                        let promise = this._resource.loadTextureFromglTF(index, false, basePath, progress);
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
        let extension: glTF.glTFMaterialIridescence = glTFMaterial.extensions.KHR_materials_iridescence;

        let factor = extension.iridescenceFactor ?? 0.0;
        let ior = extension.iridescenceIor ?? 1.3;
        let thicknessMin = extension.iridescenceThicknessMinimum ?? 100;
        let thicknessMax = extension.iridescenceThicknessMaximum ?? 400;

        material.setDefine(PBRShaderLib.DEFINE_IRIDESCENCE, true);
        material.setFloat("u_IridescenceFactor", factor);
        material.setFloat("u_IridescenceIor", ior);
        material.setFloat("u_IridescenceThicknessMinimum", thicknessMin);
        material.setFloat("u_IridescenceThicknessMaximum", thicknessMax);

        if (extension.iridescenceTexture) {
            let tex = this._resource.getTextureWithInfo(extension.iridescenceTexture);

            material.setDefine(glTFShader.Define_IridescenceMap, true);
            material.setTexture("u_IridescenceTexture", tex);
        }

        if (extension.iridescenceThicknessTexture) {
            let tex = this._resource.getTextureWithInfo(extension.iridescenceThicknessTexture);

            material.setDefine(glTFShader.Define_IridescenceThicknessMap, true);
            material.setTexture("u_IridescenceThicknessTexture", tex);
        }

    }

}

glTFResource.registerExtension(ExtensionName, (resource) => new KHR_materials_iridescence(resource));
