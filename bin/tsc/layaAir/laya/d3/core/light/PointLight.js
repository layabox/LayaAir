import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { LightSprite } from "./LightSprite";
import { ILaya3D } from "../../../../ILaya3D";
/**
 * <code>PointLight</code> 类用于创建点光。
 */
export class PointLight extends LightSprite {
    /**
     * 创建一个 <code>PointLight</code> 实例。
     */
    constructor() {
        super();
        this._lightMatrix = new Matrix4x4();
        this._range = 6.0;
    }
    /**
     * 获取点光的范围。
     * @return 点光的范围。
     */
    get range() {
        return this._range;
    }
    /**
     * 设置点光的范围。
     * @param  value 点光的范围。
     */
    set range(value) {
        this._range = value;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onActive() {
        super._onActive();
        (this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (this._scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT));
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onInActive() {
        super._onInActive();
        (this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (this._scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT));
    }
    /**
     * 更新点光相关渲染状态参数。
     * @param state 渲染状态参数。
     */
    /*override*/ _prepareToScene() {
        var scene = this._scene;
        if (scene.enableLight && this.activeInHierarchy) {
            var shaderValue = scene._shaderValues;
            Vector3.scale(this.color, this._intensity, this._intensityColor);
            shaderValue.setVector3(ILaya3D.Scene3D.POINTLIGHTCOLOR, this._intensityColor);
            shaderValue.setVector3(ILaya3D.Scene3D.POINTLIGHTPOS, this.transform.position);
            shaderValue.setNumber(ILaya3D.Scene3D.POINTLIGHTRANGE, this.range);
            var lightMatrix = this._lightMatrix;
            var lightMatrixE = lightMatrix.elements;
            lightMatrix.identity();
            lightMatrixE[0] = lightMatrixE[5] = lightMatrixE[10] = 1.0 / this._range;
            var toLightMatrix = PointLight._tempMatrix0;
            this.transform.worldMatrix.invert(toLightMatrix);
            Matrix4x4.multiply(lightMatrix, toLightMatrix, lightMatrix);
            shaderValue.setMatrix4x4(ILaya3D.Scene3D.POINTLIGHTMATRIX, lightMatrix);
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _parse(data, spriteMap) {
        super._parse(data, spriteMap);
        this.range = data.range;
    }
}
PointLight._tempMatrix0 = new Matrix4x4();
