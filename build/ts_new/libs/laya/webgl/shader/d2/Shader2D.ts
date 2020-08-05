import { ShaderDefines2D } from "./ShaderDefines2D";
import { DrawStyle } from "../../canvas/DrawStyle"
import { Shader } from "../Shader"

import texture_vs from './files/texture.vs.glsl';
import texture_ps from './files/texture.ps.glsl';
import prime_vs from './files/primitive.vs.glsl';
import prime_ps from './files/primitive.ps.glsl';
import skin_vs from './skinAnishader/skinShader.vs.glsl';
import skin_ps from './skinAnishader/skinShader.ps.glsl';

export class Shader2D {
    ALPHA: number = 1;
    shader: Shader;
    filters: any[];
    defines = new ShaderDefines2D();
    shaderType: number = 0;
    colorAdd: any[];
    fillStyle = DrawStyle.DEFAULT;
    strokeStyle  = DrawStyle.DEFAULT;
    destroy(): void {
		//@ts-ignore
		this.defines = null;
		//@ts-ignore
        this.filters = null;
    }

    static __init__(): void {
        Shader.preCompile2D(0, ShaderDefines2D.TEXTURE2D, texture_vs, texture_ps, null);
        Shader.preCompile2D(0, ShaderDefines2D.PRIMITIVE, prime_vs, prime_ps, null);
        Shader.preCompile2D(0, ShaderDefines2D.SKINMESH, skin_vs, skin_ps, null);
    }
}

