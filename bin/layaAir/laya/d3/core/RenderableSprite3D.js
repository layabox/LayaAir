import { ILaya3D } from "ILaya3D";
import { Vector4 } from "../math/Vector4";
import { Shader3D } from "../shader/Shader3D";
import { ShaderDefines } from "../shader/ShaderDefines";
import { Sprite3D } from "././Sprite3D";
/**
 * <code>RenderableSprite3D</code> 类用于可渲染3D精灵的父类，抽象类不允许实例。
 */
export class RenderableSprite3D extends Sprite3D {
    /**
     * 创建一个 <code>RenderableSprite3D</code> 实例。
     */
    constructor(name) {
        super(name);
    }
    /**
     * @private
     */
    static __init__() {
        RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW = RenderableSprite3D.shaderDefines.registerDefine("RECEIVESHADOW");
        RenderableSprite3D.SHADERDEFINE_SCALEOFFSETLIGHTINGMAPUV = RenderableSprite3D.shaderDefines.registerDefine("SCALEOFFSETLIGHTINGMAPUV");
        RenderableSprite3D.SAHDERDEFINE_LIGHTMAP = RenderableSprite3D.shaderDefines.registerDefine("LIGHTMAP");
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onInActive() {
        super._onInActive();
        var scene3D = this._scene;
        scene3D._removeRenderObject(this._render);
        (this._render.castShadow) && (scene3D._removeShadowCastRenderObject(this._render));
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onActive() {
        super._onActive();
        var scene3D = this._scene;
        scene3D._addRenderObject(this._render);
        (this._render.castShadow) && (scene3D._addShadowCastRenderObject(this._render));
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onActiveInScene() {
        super._onActiveInScene();
        if (ILaya3D.Laya3D._editerEnvironment) {
            var scene = this._scene;
            var pickColor = new Vector4();
            scene._allotPickColorByID(this.id, pickColor);
            scene._pickIdToSprite[this.id] = this;
            this._render._shaderValues.setVector(RenderableSprite3D.PICKCOLOR, pickColor);
        }
    }
    /**
     * @private
     */
    _addToInitStaticBatchManager() {
    }
    /**
     * @inheritDoc
     */
    /*override*/ _setBelongScene(scene) {
        super._setBelongScene(scene);
        this._render._setBelongScene(scene);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _setUnBelongScene() {
        this._render._shaderValues.removeDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
        super._setUnBelongScene();
    }
    /**
     * @inheritDoc
     */
    /*override*/ _changeHierarchyAnimator(animator) {
        if (this._hierarchyAnimator) {
            var renderableSprites = this._hierarchyAnimator._renderableSprites;
            renderableSprites.splice(renderableSprites.indexOf(this), 1);
        }
        if (animator)
            animator._renderableSprites.push(this);
        super._changeHierarchyAnimator(animator);
    }
    /**
     * @inheritDoc
     */
    /*override*/ destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._render._destroy();
        this._render = null;
    }
    /**
     * @private
     */
    _create() {
        return new RenderableSprite3D(this.name);
    }
}
/**着色器变量名，光照贴图缩放和偏移。*/
RenderableSprite3D.LIGHTMAPSCALEOFFSET = Shader3D.propertyNameToID("u_LightmapScaleOffset");
/**着色器变量名，光照贴图。*/
RenderableSprite3D.LIGHTMAP = Shader3D.propertyNameToID("u_LightMap");
/**拾取颜色。*/
RenderableSprite3D.PICKCOLOR = Shader3D.propertyNameToID("u_PickColor");
/**@private */
RenderableSprite3D.shaderDefines = new ShaderDefines();
