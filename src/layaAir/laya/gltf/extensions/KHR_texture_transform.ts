import * as glTF from "../glTFInterface";

import { Material } from "../../d3/core/material/Material";
import { IBatchProgress } from "../../net/BatchProgress";
import { glTFMaterial } from "../glTFInterface";
import { glTFResource } from "../glTFResource";
import { glTFExtension } from "./glTFExtension";
import { Matrix3x3 } from "../../maths/Matrix3x3";
import { Vector2 } from "../../maths/Vector2";

const ExtensionName = "KHR_texture_transform";

declare module "../glTFInterface" {

    export interface glTFTextureTransform {
        /** The offset of the UV coordinate origin as a factor of the texture dimensions. default: [0, 0] */
        offset: number[];
        /** Rotate the UVs by this many radians counter-clockwise around the origin. This is equivalent to a similar rotation of the image clockwise. default: 0.0 */
        rotation: number;
        /** The scale factor applied to the components of the UV coordinates. default: [1, 1] */
        scale: number[];
        /** Overrides the textureInfo texCoord value if supplied, and if this extension is supported. */
        texCoord: number;
    }

}

const translation = new Matrix3x3();
const rotation = new Matrix3x3();

const offset = new Vector2;
const scale = new Vector2;

// todo
export class KHR_texture_transform implements glTFExtension {

    readonly name: string = ExtensionName;

    private _resource: glTFResource;

    constructor(resource: glTFResource) {
        this._resource = resource;
    }

    createTransform(extension: glTF.glTFTextureTransform) {
        offset.setValue(0, 0);
        if (extension.offset) {
            offset.fromArray(extension.offset);
        }
        Matrix3x3.createFromTranslation(offset, translation);

        let rot = extension.rotation ?? 0;
        Matrix3x3.createFromRotation(-rot, rotation);

        scale.setValue(1, 1);
        if (extension.scale) {
            scale.fromArray(extension.scale);
        }

        let trans = new Matrix3x3();
        Matrix3x3.multiply(translation, rotation, trans);
        trans.scale(scale, trans);
        return trans;
    }

    loadExtensionTextureInfo(info: glTF.glTFTextureInfo) {
        let extension: glTF.glTFTextureTransform = info.extensions?.KHR_texture_transform;

        let trans = this.createTransform(extension);
        let texCoord = extension.texCoord;

        return {
            transform: trans,
            texCoord: texCoord
        }
    }

}

glTFResource.registerExtension(ExtensionName, (resource) => new KHR_texture_transform(resource));