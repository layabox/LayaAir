import { Shader3D } from "../../../d3/shader/Shader3D";
import { ShaderDefine } from "../../shader/ShaderDefine";

export class ShuriKenParticle3DShaderDeclaration {
	static SHADERDEFINE_RENDERMODE_BILLBOARD: ShaderDefine;
	static SHADERDEFINE_RENDERMODE_STRETCHEDBILLBOARD: ShaderDefine;
	static SHADERDEFINE_RENDERMODE_HORIZONTALBILLBOARD: ShaderDefine;
	static SHADERDEFINE_RENDERMODE_VERTICALBILLBOARD: ShaderDefine;

	static SHADERDEFINE_COLOROVERLIFETIME: ShaderDefine;
	static SHADERDEFINE_RANDOMCOLOROVERLIFETIME: ShaderDefine;
	static SHADERDEFINE_VELOCITYOVERLIFETIMECONSTANT: ShaderDefine;
	static SHADERDEFINE_VELOCITYOVERLIFETIMECURVE: ShaderDefine;
	static SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCONSTANT: ShaderDefine;
	static SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCURVE: ShaderDefine;
	static SHADERDEFINE_TEXTURESHEETANIMATIONCURVE: ShaderDefine;
	static SHADERDEFINE_TEXTURESHEETANIMATIONRANDOMCURVE: ShaderDefine;
	static SHADERDEFINE_ROTATIONOVERLIFETIME: ShaderDefine;
	static SHADERDEFINE_ROTATIONOVERLIFETIMESEPERATE: ShaderDefine;
	static SHADERDEFINE_ROTATIONOVERLIFETIMECONSTANT: ShaderDefine;
	static SHADERDEFINE_ROTATIONOVERLIFETIMECURVE: ShaderDefine;
	static SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCONSTANTS: ShaderDefine;
	static SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCURVES: ShaderDefine;
	static SHADERDEFINE_SIZEOVERLIFETIMECURVE: ShaderDefine;
	static SHADERDEFINE_SIZEOVERLIFETIMECURVESEPERATE: ShaderDefine;
	static SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVES: ShaderDefine;
	static SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVESSEPERATE: ShaderDefine;
	static SHADERDEFINE_RENDERMODE_MESH: ShaderDefine;
	static SHADERDEFINE_SHAPE: ShaderDefine;


	//Base
	static WORLDPOSITION: number = Shader3D.propertyNameToID("u_WorldPosition");
	static WORLDROTATION: number = Shader3D.propertyNameToID("u_WorldRotation");
	static POSITIONSCALE: number = Shader3D.propertyNameToID("u_PositionScale");
	static SIZESCALE: number = Shader3D.propertyNameToID("u_SizeScale");
	static SCALINGMODE: number = Shader3D.propertyNameToID("u_ScalingMode");
	static GRAVITY: number = Shader3D.propertyNameToID("u_Gravity");
	static THREEDSTARTROTATION: number = Shader3D.propertyNameToID("u_ThreeDStartRotation");
	static STRETCHEDBILLBOARDLENGTHSCALE: number = Shader3D.propertyNameToID("u_StretchedBillboardLengthScale");
	static STRETCHEDBILLBOARDSPEEDSCALE: number = Shader3D.propertyNameToID("u_StretchedBillboardSpeedScale");
	static SIMULATIONSPACE: number = Shader3D.propertyNameToID("u_SimulationSpace");
	static CURRENTTIME: number = Shader3D.propertyNameToID("u_CurrentTime");

	//VelocityOverLifetime
	static VOLVELOCITYCONST: number = Shader3D.propertyNameToID("u_VOLVelocityConst");
	static VOLVELOCITYGRADIENTX: number = Shader3D.propertyNameToID("u_VOLVelocityGradientX");
	static VOLVELOCITYGRADIENTY: number = Shader3D.propertyNameToID("u_VOLVelocityGradientY");
	static VOLVELOCITYGRADIENTZ: number = Shader3D.propertyNameToID("u_VOLVelocityGradientZ");
	static VOLVELOCITYCONSTMAX: number = Shader3D.propertyNameToID("u_VOLVelocityConstMax");
	static VOLVELOCITYGRADIENTXMAX: number = Shader3D.propertyNameToID("u_VOLVelocityGradientMaxX");
	static VOLVELOCITYGRADIENTYMAX: number = Shader3D.propertyNameToID("u_VOLVelocityGradientMaxY");
	static VOLVELOCITYGRADIENTZMAX: number = Shader3D.propertyNameToID("u_VOLVelocityGradientMaxZ");
	static VOLSPACETYPE: number = Shader3D.propertyNameToID("u_VOLSpaceType");

	//ColorOverLifetime
	static COLOROVERLIFEGRADIENTALPHAS: number = Shader3D.propertyNameToID("u_ColorOverLifeGradientAlphas");
	static COLOROVERLIFEGRADIENTCOLORS: number = Shader3D.propertyNameToID("u_ColorOverLifeGradientColors");
	static MAXCOLOROVERLIFEGRADIENTALPHAS: number = Shader3D.propertyNameToID("u_MaxColorOverLifeGradientAlphas");
	static MAXCOLOROVERLIFEGRADIENTCOLORS: number = Shader3D.propertyNameToID("u_MaxColorOverLifeGradientColors");

	//SizeOverLifetime
	static SOLSIZEGRADIENT: number = Shader3D.propertyNameToID("u_SOLSizeGradient");
	static SOLSIZEGRADIENTX: number = Shader3D.propertyNameToID("u_SOLSizeGradientX");
	static SOLSIZEGRADIENTY: number = Shader3D.propertyNameToID("u_SOLSizeGradientY");
	static SOLSizeGradientZ: number = Shader3D.propertyNameToID("u_SOLSizeGradientZ");
	static SOLSizeGradientMax: number = Shader3D.propertyNameToID("u_SOLSizeGradientMax");
	static SOLSIZEGRADIENTXMAX: number = Shader3D.propertyNameToID("u_SOLSizeGradientMaxX");
	static SOLSIZEGRADIENTYMAX: number = Shader3D.propertyNameToID("u_SOLSizeGradientMaxY");
	static SOLSizeGradientZMAX: number = Shader3D.propertyNameToID("u_SOLSizeGradientMaxZ");

	//RotationOverLifetime
	static ROLANGULARVELOCITYCONST: number = Shader3D.propertyNameToID("u_ROLAngularVelocityConst");
	static ROLANGULARVELOCITYCONSTSEPRARATE: number = Shader3D.propertyNameToID("u_ROLAngularVelocityConstSeprarate");
	static ROLANGULARVELOCITYGRADIENT: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradient");
	static ROLANGULARVELOCITYGRADIENTX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientX");
	static ROLANGULARVELOCITYGRADIENTY: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientY");
	static ROLANGULARVELOCITYGRADIENTZ: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientZ");
	static ROLANGULARVELOCITYCONSTMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityConstMax");
	static ROLANGULARVELOCITYCONSTMAXSEPRARATE: number = Shader3D.propertyNameToID("u_ROLAngularVelocityConstMaxSeprarate");
	static ROLANGULARVELOCITYGRADIENTMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMax");
	static ROLANGULARVELOCITYGRADIENTXMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMaxX");
	static ROLANGULARVELOCITYGRADIENTYMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMaxY");
	static ROLANGULARVELOCITYGRADIENTZMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMaxZ");
	static ROLANGULARVELOCITYGRADIENTWMAX: number = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMaxW");

	//TextureSheetAnimation
	static TEXTURESHEETANIMATIONCYCLES: number = Shader3D.propertyNameToID("u_TSACycles");
	static TEXTURESHEETANIMATIONSUBUVLENGTH: number = Shader3D.propertyNameToID("u_TSASubUVLength");
	static TEXTURESHEETANIMATIONGRADIENTUVS: number = Shader3D.propertyNameToID("u_TSAGradientUVs");
	static TEXTURESHEETANIMATIONGRADIENTMAXUVS: number = Shader3D.propertyNameToID("u_TSAMaxGradientUVs");
}