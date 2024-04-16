import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { LayaGL } from "../../../layagl/LayaGL";

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
	static SHADERDEFINE_COLORKEYCOUNT_8: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_RANDOMCOLOROVERLIFETIME: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCURVE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_TEXTURESHEETANIMATIONRANDOMCURVE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ROTATIONOVERLIFETIME: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_ROTATIONOVERLIFETIMESEPERATE: ShaderDefine;
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


	//Base
	/**@internal */
	static WORLDPOSITION: number;
	/**@internal */
	static WORLDROTATION: number;
	/**@internal */
	static POSITIONSCALE: number;
	/**@internal */
	static SIZESCALE: number;
	/**@internal */
	static SCALINGMODE: number;
	/**@internal */
	static GRAVITY: number;
	/**@internal */
	static THREEDSTARTROTATION: number;
	/**@internal */
	static STRETCHEDBILLBOARDLENGTHSCALE: number;
	/**@internal */
	static STRETCHEDBILLBOARDSPEEDSCALE: number;
	/**@internal */
	static SIMULATIONSPACE: number;
	/**@internal */
	static CURRENTTIME: number;
	/**@internal */
	static DRAG: number;

	//VelocityOverLifetime

	/**@internal */
	static VOLVELOCITYGRADIENTX: number;
	/**@internal */
	static VOLVELOCITYGRADIENTY: number;
	/**@internal */
	static VOLVELOCITYGRADIENTZ: number;
	/**@internal */
	static VOLVELOCITYGRADIENTXMAX: number;
	/**@internal */
	static VOLVELOCITYGRADIENTYMAX: number;
	/**@internal */
	static VOLVELOCITYGRADIENTZMAX: number;
	/**@internal */
	static VOLSPACETYPE: number;

	//ColorOverLifetime
	/**@internal */
	static COLOROVERLIFEGRADIENTALPHAS: number;
	/**@internal */
	static COLOROVERLIFEGRADIENTCOLORS: number;
	/**@internal */
	static COLOROVERLIFEGRADIENTRANGES: number;
	/**@internal */
	static MAXCOLOROVERLIFEGRADIENTALPHAS: number;
	/**@internal */
	static MAXCOLOROVERLIFEGRADIENTCOLORS: number;
	/**@internal */
	static MAXCOLOROVERLIFEGRADIENTRANGES: number;

	//SizeOverLifetime
	/**@internal */
	static SOLSIZEGRADIENT: number;
	/**@internal */
	static SOLSIZEGRADIENTX: number;
	/**@internal */
	static SOLSIZEGRADIENTY: number;
	/**@internal */
	static SOLSizeGradientZ: number;
	/**@internal */
	static SOLSizeGradientMax: number;
	/**@internal */
	static SOLSIZEGRADIENTXMAX: number;
	/**@internal */
	static SOLSIZEGRADIENTYMAX: number;
	/**@internal */
	static SOLSizeGradientZMAX: number;

	//RotationOverLifetime
	/**@internal */
	static ROLANGULARVELOCITYGRADIENT: number;
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTX: number;
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTY: number;
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTZ: number;
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTMAX: number;
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTXMAX: number;
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTYMAX: number;
	/**@internal */
	static ROLANGULARVELOCITYGRADIENTZMAX: number;

	//TextureSheetAnimation
	/**@internal */
	static TEXTURESHEETANIMATIONCYCLES: number;
	/**@internal */
	static TEXTURESHEETANIMATIONSUBUVLENGTH: number;
	/**@internal */
	static TEXTURESHEETANIMATIONGRADIENTUVS: number;
	/**@internal */
	static TEXTURESHEETANIMATIONGRADIENTMAXUVS: number;


	/**
	 * init
	 */
	static __init__() {

		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_BILLBOARD = Shader3D.getDefineByName("SPHERHBILLBOARD");
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_STRETCHEDBILLBOARD = Shader3D.getDefineByName("STRETCHEDBILLBOARD");
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_HORIZONTALBILLBOARD = Shader3D.getDefineByName("HORIZONTALBILLBOARD");
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_VERTICALBILLBOARD = Shader3D.getDefineByName("VERTICALBILLBOARD");
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_MESH = Shader3D.getDefineByName("RENDERMODE_MESH");
	
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RANDOMCOLOROVERLIFETIME = Shader3D.getDefineByName("RANDOMCOLOROVERLIFETIME");
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_COLORKEYCOUNT_8 = Shader3D.getDefineByName("COLORKEYCOUNT_8");
		
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCURVE = Shader3D.getDefineByName("VELOCITYOVERLIFETIMERANDOMCURVE");

		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_TEXTURESHEETANIMATIONRANDOMCURVE = Shader3D.getDefineByName("TEXTURESHEETANIMATIONRANDOMCURVE");
		
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIME = Shader3D.getDefineByName("ROTATIONOVERLIFETIME");//
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMESEPERATE = Shader3D.getDefineByName("ROTATIONOVERLIFETIMESEPERATE");//

		
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMECURVE = Shader3D.getDefineByName("SIZEOVERLIFETIMECURVE");//
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMECURVESEPERATE = Shader3D.getDefineByName("SIZEOVERLIFETIMECURVESEPERATE");//
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVES = Shader3D.getDefineByName("SIZEOVERLIFETIMERANDOMCURVES");//
		ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVESSEPERATE = Shader3D.getDefineByName("SIZEOVERLIFETIMERANDOMCURVESSEPERATE");

		//Base
		ShuriKenParticle3DShaderDeclaration.WORLDPOSITION = Shader3D.propertyNameToID("u_WorldPosition");
		ShuriKenParticle3DShaderDeclaration.WORLDROTATION = Shader3D.propertyNameToID("u_WorldRotation");
		ShuriKenParticle3DShaderDeclaration.POSITIONSCALE = Shader3D.propertyNameToID("u_PositionScale");
		ShuriKenParticle3DShaderDeclaration.SIZESCALE = Shader3D.propertyNameToID("u_SizeScale");
		ShuriKenParticle3DShaderDeclaration.SCALINGMODE = Shader3D.propertyNameToID("u_ScalingMode");
		ShuriKenParticle3DShaderDeclaration.GRAVITY = Shader3D.propertyNameToID("u_Gravity");
		ShuriKenParticle3DShaderDeclaration.THREEDSTARTROTATION = Shader3D.propertyNameToID("u_ThreeDStartRotation");
		ShuriKenParticle3DShaderDeclaration.STRETCHEDBILLBOARDLENGTHSCALE = Shader3D.propertyNameToID("u_StretchedBillboardLengthScale");
		ShuriKenParticle3DShaderDeclaration.STRETCHEDBILLBOARDSPEEDSCALE = Shader3D.propertyNameToID("u_StretchedBillboardSpeedScale");
		ShuriKenParticle3DShaderDeclaration.SIMULATIONSPACE = Shader3D.propertyNameToID("u_SimulationSpace");
		ShuriKenParticle3DShaderDeclaration.CURRENTTIME = Shader3D.propertyNameToID("u_CurrentTime");
		ShuriKenParticle3DShaderDeclaration.DRAG = Shader3D.propertyNameToID("u_DragConstanct");

		//VelocityOverLifetime
		ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTX = Shader3D.propertyNameToID("u_VOLVelocityGradientX");
		ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTY = Shader3D.propertyNameToID("u_VOLVelocityGradientY");
		ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTZ = Shader3D.propertyNameToID("u_VOLVelocityGradientZ");
		ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTXMAX = Shader3D.propertyNameToID("u_VOLVelocityGradientMaxX");
		ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTYMAX = Shader3D.propertyNameToID("u_VOLVelocityGradientMaxY");
		ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTZMAX = Shader3D.propertyNameToID("u_VOLVelocityGradientMaxZ");
		ShuriKenParticle3DShaderDeclaration.VOLSPACETYPE = Shader3D.propertyNameToID("u_VOLSpaceType");

		//ColorOverLifetime
		ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTALPHAS = Shader3D.propertyNameToID("u_ColorOverLifeGradientAlphas");
		ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTCOLORS = Shader3D.propertyNameToID("u_ColorOverLifeGradientColors");
		ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTRANGES = Shader3D.propertyNameToID("u_ColorOverLifeGradientRanges");
		ShuriKenParticle3DShaderDeclaration.MAXCOLOROVERLIFEGRADIENTALPHAS = Shader3D.propertyNameToID("u_MaxColorOverLifeGradientAlphas");
		ShuriKenParticle3DShaderDeclaration.MAXCOLOROVERLIFEGRADIENTCOLORS = Shader3D.propertyNameToID("u_MaxColorOverLifeGradientColors");
		ShuriKenParticle3DShaderDeclaration.MAXCOLOROVERLIFEGRADIENTRANGES = Shader3D.propertyNameToID("u_MaxColorOverLifeGradientRanges");

		//SizeOverLifetime
		ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENT = Shader3D.propertyNameToID("u_SOLSizeGradient");
		ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTX = Shader3D.propertyNameToID("u_SOLSizeGradientX");
		ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTY = Shader3D.propertyNameToID("u_SOLSizeGradientY");
		ShuriKenParticle3DShaderDeclaration.SOLSizeGradientZ = Shader3D.propertyNameToID("u_SOLSizeGradientZ");
		ShuriKenParticle3DShaderDeclaration.SOLSizeGradientMax = Shader3D.propertyNameToID("u_SOLSizeGradientMax");
		ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTXMAX = Shader3D.propertyNameToID("u_SOLSizeGradientMaxX");
		ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTYMAX = Shader3D.propertyNameToID("u_SOLSizeGradientMaxY");
		ShuriKenParticle3DShaderDeclaration.SOLSizeGradientZMAX = Shader3D.propertyNameToID("u_SOLSizeGradientMaxZ");

		//RotationOverLifetime
		ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENT = Shader3D.propertyNameToID("u_ROLAngularVelocityGradient");
		ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTX = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientX");
		ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTY = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientY");
		ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTZ = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientZ");
		ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTMAX = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMax");
		ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTXMAX = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMaxX");
		ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTYMAX = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMaxY");
		ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTZMAX = Shader3D.propertyNameToID("u_ROLAngularVelocityGradientMaxZ");

		//TextureSheetAnimation
		ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONCYCLES = Shader3D.propertyNameToID("u_TSACycles");
		ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONSUBUVLENGTH = Shader3D.propertyNameToID("u_TSASubUVLength");
		ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONGRADIENTUVS = Shader3D.propertyNameToID("u_TSAGradientUVs");
		ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONGRADIENTMAXUVS = Shader3D.propertyNameToID("u_TSAMaxGradientUVs");




		let uniformMap = LayaGL.renderOBJCreate.createGlobalUniformMap("ShurikenSprite3D");
		//TODO
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.WORLDPOSITION, 'u_WorldPosition',ShaderDataType.Vector3),
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.WORLDROTATION, 'u_WorldRotation',ShaderDataType.Vector4);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.POSITIONSCALE, 'u_PositionScale',ShaderDataType.Vector3);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.SIZESCALE, 'u_SizeScale',ShaderDataType.Vector3);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.SCALINGMODE, 'u_ScalingMode',ShaderDataType.Int);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.GRAVITY, 'u_Gravity',ShaderDataType.Vector3);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.THREEDSTARTROTATION, 'u_ThreeDStartRotation',ShaderDataType.Bool);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.STRETCHEDBILLBOARDLENGTHSCALE, 'u_StretchedBillboardLengthScale',ShaderDataType.Float);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.STRETCHEDBILLBOARDSPEEDSCALE, 'u_StretchedBillboardSpeedScale',ShaderDataType.Float);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.SIMULATIONSPACE, 'u_SimulationSpace',ShaderDataType.Int);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.CURRENTTIME, 'u_CurrentTime',ShaderDataType.Vector2);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTALPHAS, 'u_ColorOverLifeGradientAlphas',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTCOLORS, 'u_ColorOverLifeGradientColors',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.COLOROVERLIFEGRADIENTRANGES, 'u_ColorOverLifeGradientRanges',ShaderDataType.Vector4);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.MAXCOLOROVERLIFEGRADIENTALPHAS, 'u_MaxColorOverLifeGradientAlphas',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.MAXCOLOROVERLIFEGRADIENTCOLORS, 'u_MaxColorOverLifeGradientColors',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.MAXCOLOROVERLIFEGRADIENTRANGES, 'u_MaxColorOverLifeGradientRanges',ShaderDataType.Vector4);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTX, 'u_VOLVelocityGradientX',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTY, 'u_VOLVelocityGradientY',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTZ, 'u_VOLVelocityGradientZ',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTXMAX, 'u_VOLVelocityGradientMaxX',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTYMAX, 'u_VOLVelocityGradientMaxY',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.VOLVELOCITYGRADIENTZMAX, 'u_VOLVelocityGradientMaxZ',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.VOLSPACETYPE, 'u_VOLSpaceType',ShaderDataType.Int);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENT, 'u_SOLSizeGradient',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTX, 'u_SOLSizeGradientX',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTY, 'u_SOLSizeGradientY',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.SOLSizeGradientZ, 'u_SOLSizeGradientZ',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.SOLSizeGradientMax, 'u_SOLSizeGradientMax',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTXMAX, 'u_SOLSizeGradientMaxX',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.SOLSIZEGRADIENTYMAX, 'u_SOLSizeGradientMaxY',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.SOLSizeGradientZMAX, 'u_SOLSizeGradientMaxZ',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENT, 'u_ROLAngularVelocityGradient',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTX, 'u_ROLAngularVelocityGradientX',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTY, 'u_ROLAngularVelocityGradientY',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTZ, 'u_ROLAngularVelocityGradientZ',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTMAX, 'u_ROLAngularVelocityGradientMax',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTXMAX, 'u_ROLAngularVelocityGradientMaxX',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTYMAX, 'u_ROLAngularVelocityGradientMaxY',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.ROLANGULARVELOCITYGRADIENTZMAX, 'u_ROLAngularVelocityGradientMaxZ',ShaderDataType.Buffer);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONCYCLES, 'u_TSACycles',ShaderDataType.Float);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONSUBUVLENGTH, 'u_TSASubUVLength',ShaderDataType.Vector2);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONGRADIENTUVS, 'u_TSAGradientUVs',ShaderDataType.Vector2);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.TEXTURESHEETANIMATIONGRADIENTMAXUVS, 'u_TSAMaxGradientUVs',ShaderDataType.Vector2);
		uniformMap.addShaderUniform(ShuriKenParticle3DShaderDeclaration.DRAG, 'u_DragConstanct',ShaderDataType.Vector2);
	}
}