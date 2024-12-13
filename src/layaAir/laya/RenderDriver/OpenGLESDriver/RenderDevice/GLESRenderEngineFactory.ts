import { Config } from "../../../../Config";
import { Laya } from "../../../../Laya";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../../layagl/LayaGL";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";
import { GLESEngine, GLESMode } from "./GLESEngine";



export class GLESRenderEngineFactory implements IRenderEngineFactory {
    _nativeObj: any;
    createEngine(config: Config, canvas: any): Promise<void> {
        let engine: GLESEngine;
        let glConfig: any = { stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias, premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer, depth: Config.isDepth, failIfMajorPerformanceCaveat: Config.isfailIfMajorPerformanceCaveat, powerPreference: Config.powerPreference };

        //TODO  other engine
        const webglMode: GLESMode = Config.useWebGL2 ? GLESMode.Auto : GLESMode.WebGL1;
        engine = new GLESEngine(glConfig, webglMode);
        engine.initRenderEngine(canvas._source);

        new LayaGL();

        LayaGL.renderEngine = engine;
        LayaGL.textureContext = engine.getTextureContext();


        Laya.addAfterInitCallback(this.afterInit)
        return Promise.resolve();
    }

    afterInit(): void {
        GLESRenderEngineFactory._setVertexDec(VertexMesh.instanceWorldMatrixDeclaration, "instanceWorldMatrixDeclaration");
        GLESRenderEngineFactory._setVertexDec(VertexMesh.instanceLightMapScaleOffsetDeclaration, "instanceLightMapScaleOffsetDeclaration");
        GLESRenderEngineFactory._setVertexDec(VertexMesh.instanceSimpleAnimatorDeclaration, "instanceSimpleAnimatorDeclaration");
    }

    private static _setVertexDec(value: VertexDeclaration, regName: string) {
        let shaderValues = value._shaderValues;
        for (var k in shaderValues) {
            (LayaGL.renderEngine as GLESEngine)._nativeObj.regGlobalVertexDeclaration(regName, parseInt(k), shaderValues[k]);
        }
    }

}

Laya.addBeforeInitCallback(() => {
    if (!LayaGL.renderOBJCreate)
        LayaGL.renderOBJCreate = new GLESRenderEngineFactory();
})
