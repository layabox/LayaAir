import * as glTF from "../glTFInterface";

import { Material } from "../../d3/core/material/Material";
import { glTFExtension } from "./glTFExtension";
import { UnlitMaterial } from "../../d3/core/material/UnlitMaterial";
import { glTFResource } from "../glTFResource";

const ExtensionName = "KHR_materials_unlit";

/**
 * @internal
 * https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_unlit/README.md
 */
export class KHR_materials_unlit implements glTFExtension {

    readonly name: string = ExtensionName;

    private _resource: glTFResource;

    constructor(resource: glTFResource) {
        this._resource = resource;
    }

    createMaterial(glTFMaterial: glTF.glTFMaterial): Material {

        let unlit = new UnlitMaterial();

        let pbrMetallicRoughness = glTFMaterial.pbrMetallicRoughness;
        if (pbrMetallicRoughness) {
            if (pbrMetallicRoughness.baseColorFactor) {
                let color = unlit.albedoColor;
                color.fromArray(pbrMetallicRoughness.baseColorFactor);
                color.toGamma(color);
                unlit.albedoColor = color;
            }

            if (pbrMetallicRoughness.baseColorTexture) {
                unlit.albedoTexture = this._resource.getTextureWithInfo(pbrMetallicRoughness.baseColorTexture);
            }
        }

        this._resource.applyMaterialRenderState(glTFMaterial, unlit);
        return unlit;
    }
}

glTFResource.registerExtension("KHR_materials_unlit", (resource) => new KHR_materials_unlit(resource));
