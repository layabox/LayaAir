import * as glTF from "../glTFInterface";

import { Material } from "../../d3/core/material/Material";

import "./KHR_materials_unlit";

/**
 * @internal
 */
export class glTFExtension {

    readonly name: string;

    createMaterial?(glTFMaterial: glTF.glTFMaterial): Material;

}

