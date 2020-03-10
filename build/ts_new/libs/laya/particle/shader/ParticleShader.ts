import { Shader } from "../../webgl/shader/Shader";

import parvs from "./Particle.vs.glsl";
import parps from "./Particle.ps.glsl";
/**
 *  @private
 */
export class ParticleShader extends Shader {
	static vs: string = parvs;// this.__INCLUDESTR__("files/Particle.vs");
	static ps: string = parps;//this.__INCLUDESTR__("files/Particle.ps");

	//TODO:coverage
	constructor() {
		super(parvs, parps, "ParticleShader", null, ['a_CornerTextureCoordinate', 0, 'a_Position', 1, 'a_Velocity', 2, 'a_StartColor', 3,
			'a_EndColor', 4, 'a_SizeRotation', 5, 'a_Radius', 6, 'a_Radian', 7, 'a_AgeAddScale', 8, 'a_Time', 9]);
	}
}

