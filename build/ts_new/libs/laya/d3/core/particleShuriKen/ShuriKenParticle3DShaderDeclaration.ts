import { Shader3D } from "../../../d3/shader/Shader3D";
import { ShaderDefine } from "../../shader/ShaderDefine";

/**
 * @internal
 */
export class ShuriKenParticle3DShaderDeclaration {
	/**@internal */
	static SHADERDEFINE_RENDERMODE_BILLBOARD: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_RENDERMODE_STRETCHEDBILLBOARD: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_RENDERMODE_HORIZONTALBILLBOARD: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_RENDERMODE_VERTICALBILLBOARD: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_COLOROVERLIFETIME: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_RANDOMCOLOROVERLIFETIME: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_VELOCITYOVERLIFETIMECONSTANT: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_VELOCITYOVERLIFETIMECURVE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCONSTANT: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCURVE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_TEXTURESHEETANIMATIONCURVE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_TEXTURESHEETANIMATIONRANDOMCURVE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ROTATIONOVERLIFETIME: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ROTATIONOVERLIFETIMESEPERATE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ROTATIONOVERLIFETIMECONSTANT: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ROTATIONOVERLIFETIMECURVE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCONSTANTS: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCURVES: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SIZEOVERLIFETIMECURVE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SIZEOVERLIFETIMECURVESEPERATE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVES: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVESSEPERATE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_RENDERMODE_MESH: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SHAPE: ShaderDefine;


	//Base
	/**@internal */
	static WORLDPOSITION: number = Shader3D.propertyNameToID("u_WorldPosition");
	/**@internal */
	static WORLDROTATION: number = Shader3D.propertyNameToID("u_WorldRotation");
	/**@internal */
	static POSITIONSCALE: number = Shader3D.propertyNameToID("u_PositionScale");
	/**@internal */
	static SIZESCALE: number = Shader3D.propertyNameToID("u_SizeScale");
	/**@internal */
	static SCALINGMODE: number = Shader3D.propertyNameToID("u_ScalingMode");
	/**@internal */
	static GRAVITY: number = Shader3D.propertyNameToID("u_Gravity");
	/**@internal */
	static THREEDSTARTROTATION: number = Shader3D.propertyNameToID("u_ThreeDStartRotation");
	/**@internal */
	static STRETCHEDBILLBOARDLENGTHSCALE: number = Shader3D.propertyNameToID("u_StretchedBillboardLengthScale");
	/**@internal */
	static STRETCHEDBILLBOARDSPEEDSCALE: number = Shader3D.propertyNameToID("u_StretchedBillboardSpeedScale");
	/**@internal */
	static SIMULATIONSPACE: number = Shader3D.propertyNameToID("u_SimulationSpace");
	/**@internal */
	static CURRENTTIME: number = Shader3D.propertyNameToID("u_CurrentTime");

	//VelocityOverLifetime
	/**@internal */
	static VOLVELOCITYCONST: number = Shader3D.propertyNameToID("u_VOLVelocityConst");
	/**@internal */
	static VOLVELOCITYGRADIENTX: number = Shader3D.propertyNameToID("u_VOLVelocityGradientX");
	/**@internal */
	static VOLVELOCITYGRADIENTY: number = Shader3D.propertyNameToID("u_VOLVelocityGradientY");
	/**@internal */
	static VOLVELOCITYGRADIENTZ: number = Shader3D.propertyNameToID("u_VOLVelocityGradientZ");
	/**@internal */
	static VOLVELOCITYCONSTMAX: number = Shader3D.propertyNameToID("u_VOLVelocityConstMax");
	/**@internal */
	static VOLVELOCITYGRADIENTXMAX: number = Shader3D.propertyNameToID("u_VOLVelocityGradientMaxX");
	/**@internal */
	static VOLVELOCITYGRADIENTYMAX: number = Shader3D.propertyNameToID("u_VOLVelocityGradientMaxY");
	/**@internal */
	static VOLVELOCITYGRADIENTZMAX: number = Shader3D.propertyNameToID("u_VOLVelocityGradientMaxZ");
	/**@internal */
	static VOLSPACETYPE: number = Shader3D.propertyNameToID("u_VOLSpaceType");

	//ColorOverLifetime
	/**@internal */
	static COLOROVERLIFEGRADIENTALPHAS: number = Shader3D.propertyNameToID("u_ColorOverLifeGradientAlphas");
	/**@internal */
	static COLOROVERLIFEGRADIENTCOLORS: number = Shader3D.propertyNameToID("u_ColorOverLifeGradientColors");
	/**@internal */
	static MAXCOLOROVERLIFEGRADIENTALPHAS: number = Shader3D.propertyNameToID("u_MaxColorOverLifeGradientAlphas");
	/**@internal */
	static MAXCOLOROVERLIFEGRADIENTCOLORS: number = Shader3D.propertyNameToID("u_MaxColorOverLifeGradientColors");

	//SizeOverLifetime
	/**@internal */
	static SOLSIZEGRADIENT: number = Shader3D.propertyNameToID("u_SOLSizeGradient");
	/**@internal */
	static SOLSIZEGRADIENTX: number = Shader3D.propertyNameToID("u_SOLSizeGradientX");
	/**@internal */
	static SOLSIZEGRADIENTY: number = Shader3D.propertyNameToID("u_SOLSizeGradientY");
	/**@internal */
	static SOLSizeGradientZ: number = Shader3D.propertyNameToID("u_SOLSizeGradientZ");
	/**@internal */
	static SOLSizeGradientMax: number = Shader3D.propertyNameToID("u_SOLSizeGradientMax");
	/**@internal */
	static SOLSIZEGRADIENTXMAX: number = Shader3D.propertyNameToID("u_SOLSizeGradientMaxX");
	/**@internal */
	static SOLSIZEGRADIENTYMAX: number = Shader3D.propertyNameToID("u_SOLSizeGradientMaxY");
	/**@internal */
	static SOLSizeGradientZMAX: number = Shader3D.propertyNameToID("u_SOLSizeGradientMaxZ");

	//RotationOverLifetime
	/**@internal */
	static ROLANGULARVELOCITYCONST: number = Shader3D.propertyNameToID("u_ROLAngularVelocityConst");
	/**@internal */
	static ROLANGULARVELOCITYCONSTSEPRARATE: number = Shader3D.propertyNameToID("u_ROLAngularVelocityConstSeprarate");
	/**@internal */
	static ROLANGULARVELOCITYGRADIENT: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradient");
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientX");
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTY: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientY");
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTZ: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientZ");
	/**@internal */
	static ROLANGULARVELOCITYCONSTMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityConstMax");
	/**@internal */
	static ROLANGULARVELOCITYCONSTMAXSEPRARATE: number = Shader3D.propertyNameToID("u_ROLAngularVelocityConstMaxSeprarate");
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMax");
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTXMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMaxX");
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTYMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMaxY");
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTZMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMaxZ");
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTWMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMaxW");

	//TextureSheetAnimation
	/**@internal */
	static TEXTURESHEETANIMATIONCYCLES: number = Shader3D.propertyNameToID("u_TSACycles");
	/**@internal */
	static TEXTURESHEETANIMATIONSUBUVLENGTH: number = Shader3D.propertyNameToID("u_TSASubUVLength");
	/**@internal */
	static TEXTURESHEETANIMATIONGRADIENTUVS: number = Shader3D.propertyNameToID("u_TSAGradientUVs");
	/**@internal */
	static TEXTURESHEETANIMATIONGRADIENTMAXUVS: number = Shader3D.propertyNameToID("u_TSAMaxGradientUVs");
}