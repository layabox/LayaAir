import * as glTF from "../glTFInterface";

import { Material } from "../../d3/core/material/Material";
import { PBRShaderLib } from "../../d3/shader/pbr/PBRShaderLib";
import { glTFResource } from "../glTFResource";
import { glTFExtension } from "./glTFExtension";

const ExtensionName = "KHR_materials_ior";

declare module "../glTFInterface" {

    export interface glTFMaterialIOR {
        /** The index of refraction. default: 1.5 */
        ior: number;
    }

}

export class KHR_materials_ior implements glTFExtension {

    readonly name: string = ExtensionName;

    private _resource: glTFResource;

    constructor(resource: glTFResource) {
        this._resource = resource;
    }

    additionMaterialProperties(glTFMaterial: glTF.glTFMaterial, material: Material): void {
        let extension: glTF.glTFMaterialIOR = glTFMaterial.extensions.KHR_materials_ior;

        let ior = extension.ior ?? 1.5;

        material.setDefine(PBRShaderLib.DEFINE_IOR, true);
        material.setFloat("u_Ior", ior);
    }

}

glTFResource.registerExtension(ExtensionName, (resource) => new KHR_materials_ior(resource));