import { Render } from "../renders/Render"
	import { Browser } from "../utils/Browser"
	import { Buffer } from "./utils/Buffer"
import { WebGL } from "./WebGL";
	
	export class WebGLContext
	{
		 static DEPTH_BUFFER_BIT:number = 0x00000100;
		 static STENCIL_BUFFER_BIT:number = 0x00000400;
		 static COLOR_BUFFER_BIT:number = 0x00004000;
		 static POINTS:number = 0x0000;
		 static LINES:number = 0x0001;
		 static LINE_LOOP:number = 0x0002;
		 static LINE_STRIP:number = 0x0003;
		 static TRIANGLES:number = 0x0004;
		 static TRIANGLE_STRIP:number = 0x0005;
		 static TRIANGLE_FAN:number = 0x0006;
		 static ZERO:number = 0;
		 static ONE:number = 1;
		 static SRC_COLOR:number = 0x0300;
		 static ONE_MINUS_SRC_COLOR:number = 0x0301;
		 static SRC_ALPHA:number = 0x0302;
		 static ONE_MINUS_SRC_ALPHA:number = 0x0303;
		 static DST_ALPHA:number = 0x0304;
		 static ONE_MINUS_DST_ALPHA:number = 0x0305;
		 static DST_COLOR:number = 0x0306;
		 static ONE_MINUS_DST_COLOR:number = 0x0307;
		 static SRC_ALPHA_SATURATE:number = 0x0308;
		 static FUNC_ADD:number = 0x8006;
		 static BLEND_EQUATION:number = 0x8009;
		 static BLEND_EQUATION_RGB:number = 0x8009;
		 static BLEND_EQUATION_ALPHA:number = 0x883D;
		 static FUNC_SUBTRACT:number = 0x800A;
		 static FUNC_REVERSE_SUBTRACT:number = 0x800B;
		 static BLEND_DST_RGB:number = 0x80C8;
		 static BLEND_SRC_RGB:number = 0x80C9;
		 static BLEND_DST_ALPHA:number = 0x80CA;
		 static BLEND_SRC_ALPHA:number = 0x80CB;
		 static CONSTANT_COLOR:number = 0x8001;
		 static ONE_MINUS_CONSTANT_COLOR:number = 0x8002;
		 static CONSTANT_ALPHA:number = 0x8003;
		 static ONE_MINUS_CONSTANT_ALPHA:number = 0x8004;
		 static BLEND_COLOR:number = 0x8005;
		 static ARRAY_BUFFER:number = 0x8892;
		 static ELEMENT_ARRAY_BUFFER:number = 0x8893;
		 static ARRAY_BUFFER_BINDING:number = 0x8894;
		 static ELEMENT_ARRAY_BUFFER_BINDING:number = 0x8895;
		 static STREAM_DRAW:number = 0x88E0;
		 static STATIC_DRAW:number = 0x88E4;
		 static DYNAMIC_DRAW:number = 0x88E8;
		 static BUFFER_SIZE:number = 0x8764;
		 static BUFFER_USAGE:number = 0x8765;
		 static CURRENT_VERTEX_ATTRIB:number = 0x8626;
		 static FRONT:number = 0x0404;
		 static BACK:number = 0x0405;
		 static CULL_FACE:number = 0x0B44;
		 static FRONT_AND_BACK:number = 0x0408;
		 static BLEND:number = 0x0BE2;
		 static DITHER:number = 0x0BD0;
		 static STENCIL_TEST:number = 0x0B90;
		 static DEPTH_TEST:number = 0x0B71;
		 static SCISSOR_TEST:number = 0x0C11;
		 static POLYGON_OFFSET_FILL:number = 0x8037;
		 static SAMPLE_ALPHA_TO_COVERAGE:number = 0x809E;
		 static SAMPLE_COVERAGE:number = 0x80A0;
		 static NO_ERROR:number = 0;
		 static INVALID_ENUM:number = 0x0500;
		 static INVALID_VALUE:number = 0x0501;
		 static INVALID_OPERATION:number = 0x0502;
		 static OUT_OF_MEMORY:number = 0x0505;
		 static CW:number = 0x0900;
		 static CCW:number = 0x0901;
		 static LINE_WIDTH:number = 0x0B21;
		 static ALIASED_POINT_SIZE_RANGE:number = 0x846D;
		 static ALIASED_LINE_WIDTH_RANGE:number = 0x846E;
		 static CULL_FACE_MODE:number = 0x0B45;
		 static FRONT_FACE:number = 0x0B46;
		 static DEPTH_RANGE:number = 0x0B70;
		 static DEPTH_WRITEMASK:number = 0x0B72;
		 static DEPTH_CLEAR_VALUE:number = 0x0B73;
		 static DEPTH_FUNC:number = 0x0B74;
		 static STENCIL_CLEAR_VALUE:number = 0x0B91;
		 static STENCIL_FUNC:number = 0x0B92;
		 static STENCIL_FAIL:number = 0x0B94;
		 static STENCIL_PASS_DEPTH_FAIL:number = 0x0B95;
		 static STENCIL_PASS_DEPTH_PASS:number = 0x0B96;
		 static STENCIL_REF:number = 0x0B97;
		 static STENCIL_VALUE_MASK:number = 0x0B93;
		 static STENCIL_WRITEMASK:number = 0x0B98;
		 static STENCIL_BACK_FUNC:number = 0x8800;
		 static STENCIL_BACK_FAIL:number = 0x8801;
		 static STENCIL_BACK_PASS_DEPTH_FAIL:number = 0x8802;
		 static STENCIL_BACK_PASS_DEPTH_PASS:number = 0x8803;
		 static STENCIL_BACK_REF:number = 0x8CA3;
		 static STENCIL_BACK_VALUE_MASK:number = 0x8CA4;
		 static STENCIL_BACK_WRITEMASK:number = 0x8CA5;
		 static VIEWPORT:number = 0x0BA2;
		 static SCISSOR_BOX:number = 0x0C10;
		 static COLOR_CLEAR_VALUE:number = 0x0C22;
		 static COLOR_WRITEMASK:number = 0x0C23;
		 static UNPACK_ALIGNMENT:number = 0x0CF5;
		 static PACK_ALIGNMENT:number = 0x0D05;
		 static MAX_TEXTURE_SIZE:number = 0x0D33;
		 static MAX_VIEWPORT_DIMS:number = 0x0D3A;
		 static SUBPIXEL_BITS:number = 0x0D50;
		 static RED_BITS:number = 0x0D52;
		 static GREEN_BITS:number = 0x0D53;
		 static BLUE_BITS:number = 0x0D54;
		 static ALPHA_BITS:number = 0x0D55;
		 static DEPTH_BITS:number = 0x0D56;
		 static STENCIL_BITS:number = 0x0D57;
		 static POLYGON_OFFSET_UNITS:number = 0x2A00;
		 static POLYGON_OFFSET_FACTOR:number = 0x8038;
		 static TEXTURE_BINDING_2D:number = 0x8069;
		 static SAMPLE_BUFFERS:number = 0x80A8;
		 static SAMPLES:number = 0x80A9;
		 static SAMPLE_COVERAGE_VALUE:number = 0x80AA;
		 static SAMPLE_COVERAGE_INVERT:number = 0x80AB;
		 static NUM_COMPRESSED_TEXTURE_FORMATS:number = 0x86A2;
		 static COMPRESSED_TEXTURE_FORMATS:number = 0x86A3;
		 static DONT_CARE:number = 0x1100;
		 static FASTEST:number = 0x1101;
		 static NICEST:number = 0x1102;
		 static GENERATE_MIPMAP_HINT:number = 0x8192;
		 static BYTE:number = 0x1400;
		 static UNSIGNED_BYTE:number = 0x1401;
		 static SHORT:number = 0x1402;
		 static UNSIGNED_SHORT:number = 0x1403;
		 static INT:number = 0x1404;
		 static UNSIGNED_INT:number = 0x1405;
		 static FLOAT:number = 0x1406;
		 static DEPTH_COMPONENT:number = 0x1902;
		 static ALPHA:number = 0x1906;
		 static RGB:number = 0x1907;
		 static RGBA:number = 0x1908;
		 static LUMINANCE:number = 0x1909;
		 static LUMINANCE_ALPHA:number = 0x190A;
		 static UNSIGNED_SHORT_4_4_4_4:number = 0x8033;
		 static UNSIGNED_SHORT_5_5_5_1:number = 0x8034;
		 static UNSIGNED_SHORT_5_6_5:number = 0x8363;
		 static FRAGMENT_SHADER:number = 0x8B30;
		 static VERTEX_SHADER:number = 0x8B31;
		 static MAX_VERTEX_ATTRIBS:number = 0x8869;
		 static MAX_VERTEX_UNIFORM_VECTORS:number = 0x8DFB;
		 static MAX_VARYING_VECTORS:number = 0x8DFC;
		 static MAX_COMBINED_TEXTURE_IMAGE_UNITS:number = 0x8B4D;
		 static MAX_VERTEX_TEXTURE_IMAGE_UNITS:number = 0x8B4C;
		 static MAX_TEXTURE_IMAGE_UNITS:number = 0x8872;
		 static MAX_FRAGMENT_UNIFORM_VECTORS:number = 0x8DFD;
		 static SHADER_TYPE:number = 0x8B4F;
		 static DELETE_STATUS:number = 0x8B80;
		 static LINK_STATUS:number = 0x8B82;
		 static VALIDATE_STATUS:number = 0x8B83;
		 static ATTACHED_SHADERS:number = 0x8B85;
		 static ACTIVE_UNIFORMS:number = 0x8B86;
		 static ACTIVE_ATTRIBUTES:number = 0x8B89;
		 static SHADING_LANGUAGE_VERSION:number = 0x8B8C;
		 static CURRENT_PROGRAM:number = 0x8B8D;
		 static NEVER:number = 0x0200;
		 static LESS:number = 0x0201;
		 static EQUAL:number = 0x0202;
		 static LEQUAL:number = 0x0203;
		 static GREATER:number = 0x0204;
		 static NOTEQUAL:number = 0x0205;
		 static GEQUAL:number = 0x0206;
		 static ALWAYS:number = 0x0207;
		 static KEEP:number = 0x1E00;
		 static REPLACE:number = 0x1E01;
		 static INCR:number = 0x1E02;
		 static DECR:number = 0x1E03;
		 static INVERT:number = 0x150A;
		 static INCR_WRAP:number = 0x8507;
		 static DECR_WRAP:number = 0x8508;
		 static VENDOR:number = 0x1F00;
		 static RENDERER:number = 0x1F01;
		 static VERSION:number = 0x1F02;
		 static NEAREST:number = 0x2600;
		 static LINEAR:number = 0x2601;
		 static NEAREST_MIPMAP_NEAREST:number = 0x2700;
		 static LINEAR_MIPMAP_NEAREST:number = 0x2701;
		 static NEAREST_MIPMAP_LINEAR:number = 0x2702;
		 static LINEAR_MIPMAP_LINEAR:number = 0x2703;
		 static TEXTURE_MAG_FILTER:number = 0x2800;
		 static TEXTURE_MIN_FILTER:number = 0x2801;
		 static TEXTURE_WRAP_S:number = 0x2802;
		 static TEXTURE_WRAP_T:number = 0x2803;
		 static TEXTURE_2D:number = 0x0DE1;
		 static TEXTURE_3D:number = 0x806f;
		 static TEXTURE:number = 0x1702;
		 static TEXTURE_CUBE_MAP:number = 0x8513;
		 static TEXTURE_BINDING_CUBE_MAP:number = 0x8514;
		 static TEXTURE_CUBE_MAP_POSITIVE_X:number = 0x8515;
		 static TEXTURE_CUBE_MAP_NEGATIVE_X:number = 0x8516;
		 static TEXTURE_CUBE_MAP_POSITIVE_Y:number = 0x8517;
		 static TEXTURE_CUBE_MAP_NEGATIVE_Y:number = 0x8518;
		 static TEXTURE_CUBE_MAP_POSITIVE_Z:number = 0x8519;
		 static TEXTURE_CUBE_MAP_NEGATIVE_Z:number = 0x851A;
		 static MAX_CUBE_MAP_TEXTURE_SIZE:number = 0x851C;
		 static TEXTURE0:number = 0x84C0;
		 static TEXTURE1:number = 0x84C1;
		 static TEXTURE2:number = 0x84C2;
		 static TEXTURE3:number = 0x84C3;
		 static TEXTURE4:number = 0x84C4;
		 static TEXTURE5:number = 0x84C5;
		 static TEXTURE6:number = 0x84C6;
		 static TEXTURE7:number = 0x84C7;
		 static TEXTURE8:number = 0x84C8;
		 static TEXTURE9:number = 0x84C9;
		 static TEXTURE10:number = 0x84CA;
		 static TEXTURE11:number = 0x84CB;
		 static TEXTURE12:number = 0x84CC;
		 static TEXTURE13:number = 0x84CD;
		 static TEXTURE14:number = 0x84CE;
		 static TEXTURE15:number = 0x84CF;
		 static TEXTURE16:number = 0x84D0;
		 static TEXTURE17:number = 0x84D1;
		 static TEXTURE18:number = 0x84D2;
		 static TEXTURE19:number = 0x84D3;
		 static TEXTURE20:number = 0x84D4;
		 static TEXTURE21:number = 0x84D5;
		 static TEXTURE22:number = 0x84D6;
		 static TEXTURE23:number = 0x84D7;
		 static TEXTURE24:number = 0x84D8;
		 static TEXTURE25:number = 0x84D9;
		 static TEXTURE26:number = 0x84DA;
		 static TEXTURE27:number = 0x84DB;
		 static TEXTURE28:number = 0x84DC;
		 static TEXTURE29:number = 0x84DD;
		 static TEXTURE30:number = 0x84DE;
		 static TEXTURE31:number = 0x84DF;
		 static ACTIVE_TEXTURE:number = 0x84E0;
		 static REPEAT:number = 0x2901;
		 static CLAMP_TO_EDGE:number = 0x812F;
		 static MIRRORED_REPEAT:number = 0x8370;
		 static FLOAT_VEC2:number = 0x8B50;
		 static FLOAT_VEC3:number = 0x8B51;
		 static FLOAT_VEC4:number = 0x8B52;
		 static INT_VEC2:number = 0x8B53;
		 static INT_VEC3:number = 0x8B54;
		 static INT_VEC4:number = 0x8B55;
		 static BOOL:number = 0x8B56;
		 static BOOL_VEC2:number = 0x8B57;
		 static BOOL_VEC3:number = 0x8B58;
		 static BOOL_VEC4:number = 0x8B59;
		 static FLOAT_MAT2:number = 0x8B5A;
		 static FLOAT_MAT3:number = 0x8B5B;
		 static FLOAT_MAT4:number = 0x8B5C;
		 static SAMPLER_2D:number = 0x8B5E;
		 static SAMPLER_CUBE:number = 0x8B60;
		 static VERTEX_ATTRIB_ARRAY_ENABLED:number = 0x8622;
		 static VERTEX_ATTRIB_ARRAY_SIZE:number = 0x8623;
		 static VERTEX_ATTRIB_ARRAY_STRIDE:number = 0x8624;
		 static VERTEX_ATTRIB_ARRAY_TYPE:number = 0x8625;
		 static VERTEX_ATTRIB_ARRAY_NORMALIZED:number = 0x886A;
		 static VERTEX_ATTRIB_ARRAY_POINTER:number = 0x8645;
		 static VERTEX_ATTRIB_ARRAY_BUFFER_BINDING:number = 0x889F;
		 static COMPILE_STATUS:number = 0x8B81;
		 static LOW_FLOAT:number = 0x8DF0;
		 static MEDIUM_FLOAT:number = 0x8DF1;
		 static HIGH_FLOAT:number = 0x8DF2;
		 static LOW_INT:number = 0x8DF3;
		 static MEDIUM_INT:number = 0x8DF4;
		 static HIGH_INT:number = 0x8DF5;
		 static FRAMEBUFFER:number = 0x8D40;
		 static RENDERBUFFER:number = 0x8D41;
		 static RGBA4:number = 0x8056;
		 static RGB5_A1:number = 0x8057;
		 static RGB565:number = 0x8D62;
		 static DEPTH_COMPONENT16:number = 0x81A5;
		 static STENCIL_INDEX:number = 0x1901;
		 static STENCIL_INDEX8:number = 0x8D48;
		 static DEPTH_STENCIL:number = 0x84F9;
		 static RENDERBUFFER_WIDTH:number = 0x8D42;
		 static RENDERBUFFER_HEIGHT:number = 0x8D43;
		 static RENDERBUFFER_INTERNAL_FORMAT:number = 0x8D44;
		 static RENDERBUFFER_RED_SIZE:number = 0x8D50;
		 static RENDERBUFFER_GREEN_SIZE:number = 0x8D51;
		 static RENDERBUFFER_BLUE_SIZE:number = 0x8D52;
		 static RENDERBUFFER_ALPHA_SIZE:number = 0x8D53;
		 static RENDERBUFFER_DEPTH_SIZE:number = 0x8D54;
		 static RENDERBUFFER_STENCIL_SIZE:number = 0x8D55;
		 static FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE:number = 0x8CD0;
		 static FRAMEBUFFER_ATTACHMENT_OBJECT_NAME:number = 0x8CD1;
		 static FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL:number = 0x8CD2;
		 static FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE:number = 0x8CD3;
		 static COLOR_ATTACHMENT0:number = 0x8CE0;
		 static DEPTH_ATTACHMENT:number = 0x8D00;
		 static STENCIL_ATTACHMENT:number = 0x8D20;
		 static DEPTH_STENCIL_ATTACHMENT:number = 0x821A;
		 static NONE:number = 0;
		 static FRAMEBUFFER_COMPLETE:number = 0x8CD5;
		 static FRAMEBUFFER_INCOMPLETE_ATTACHMENT:number = 0x8CD6;
		 static FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:number = 0x8CD7;
		 static FRAMEBUFFER_INCOMPLETE_DIMENSIONS:number = 0x8CD9;
		 static FRAMEBUFFER_UNSUPPORTED:number = 0x8CDD;
		 static FRAMEBUFFER_BINDING:number = 0x8CA6;
		 static RENDERBUFFER_BINDING:number = 0x8CA7;
		 static MAX_RENDERBUFFER_SIZE:number = 0x84E8;
		 static INVALID_FRAMEBUFFER_OPERATION:number = 0x0506;
		 static UNPACK_FLIP_Y_WEBGL:number = 0x9240;
		 static UNPACK_PREMULTIPLY_ALPHA_WEBGL:number = 0x9241;
		 static CONTEXT_LOST_WEBGL:number = 0x9242;
		 static UNPACK_COLORSPACE_CONVERSION_WEBGL:number = 0x9243;
		 static BROWSER_DEFAULT_WEBGL:number = 0x9244;
		
		/**@private */
		private static _extentionVendorPrefixes:any[] = ["", "WEBKIT_", "MOZ_"];
		
		/**@private */
		 static _extTextureFilterAnisotropic:any;
		/**@private */
		 static _compressedTextureS3tc:any;
		/**@private */
		 static _compressedTexturePvrtc:any;
		/**@private */
		 static _compressedTextureEtc1:any;
		/**@private */
		 static _angleInstancedArrays:any;
		
		/**@private */
		 static _activeTextures:any[] = new Array(8);
		/**@private */
		 static _glTextureIDs:any[] = /*[STATIC SAFE]*/ [WebGLContext.TEXTURE0, WebGLContext.TEXTURE1, WebGLContext.TEXTURE2, WebGLContext.TEXTURE3, WebGLContext.TEXTURE4, WebGLContext.TEXTURE5, WebGLContext.TEXTURE6, WebGLContext.TEXTURE7];
		/**@private */
		 static _useProgram:any = null;
		/**@private */
		 static _depthTest:boolean = true;
		/**@private */
		 static _depthMask:boolean = true;
		/**@private */
		 static _depthFunc:number = WebGLContext.LESS; 
	
		/**@private */
		 static _blend:boolean = false;
		/**@private */
		 static _sFactor:number = WebGLContext.ONE;//待确认
		/**@private */
		 static _dFactor:number = WebGLContext.ZERO;//待确认
		/**@private */
		 static _srcAlpha:number = WebGLContext.ONE;//待确认
		/**@private */
		 static _dstAlpha:number =WebGLContext.ZERO;//待确认
		
		/**@private */
		 static _cullFace:boolean = false;
		/**@private */
		 static _frontFace:number = WebGLContext.CCW;
		/**@private */
		 static _activedTextureID:number = WebGLContext.TEXTURE0;//默认激活纹理区为0
		
		
		/**
		 * @private
		 */
		private  static _forceSupportVAOPlatform():boolean{
			return (Browser.onMiniGame && Browser.onIOS) || Browser.onBDMiniGame || Browser.onQGMiniGame;
		}
		
		
		/**
		 * @private
		 */
		 static __init__(gl:WebGLContext):void {
			WebGLContext._checkExtensions(gl);
			if (!WebGL._isWebGL2 && !Render.isConchApp) {
				if ((window as any)._setupVertexArrayObject){//兼容VAO
					if (WebGLContext._forceSupportVAOPlatform())
						(window as any)._forceSetupVertexArrayObject(gl);
					else
						(window as any)._setupVertexArrayObject(gl);	
				}
				var ext:any = (((<any>gl )).rawgl || gl).getExtension("OES_vertex_array_object");	//gl.rawgl是为了个能兼容glinspector调试
				if (ext) {
					//console.log("EXT:webgl support OES_vertex_array_object！");	
					/**
					 * 创建一个vao对象。只有支持 OES_vertex_array_object 扩展或者使用polyfill的时候这个函数才有实现。
					 */
					var glContext:any = gl;
					glContext.createVertexArray = function():any{ return ext.createVertexArrayOES();};
					glContext.bindVertexArray =  function(vao:any):void{ext.bindVertexArrayOES(vao); };
					glContext.deleteVertexArray =  function(vao:any):void{ext.deleteVertexArrayOES(vao); };
					glContext.isVertexArray =  function(vao:any):void{ext.isVertexArrayOES(vao);};
				}
			}
		}
		
		/**
		 * @private
		 */
		private static _getExtension(gl:WebGLContext, name:string):any {
			var prefixes:any[] = WebGLContext._extentionVendorPrefixes;
			for (var k  in prefixes) {
				var ext:any = gl.getExtension(prefixes[k] + name);
				if (ext)
					return ext;
			}
			return null;
		}
		
		/**
		 * @private
		 */
		private static _checkExtensions(gl:WebGLContext):void {
			WebGLContext._extTextureFilterAnisotropic = WebGLContext._getExtension(gl, "EXT_texture_filter_anisotropic");
			WebGLContext._compressedTextureS3tc =WebGLContext._getExtension(gl, "WEBGL_compressed_texture_s3tc");
			WebGLContext._compressedTexturePvrtc = WebGLContext._getExtension(gl, "WEBGL_compressed_texture_pvrtc");
			WebGLContext._compressedTextureEtc1 = WebGLContext._getExtension(gl, "WEBGL_compressed_texture_etc1");
			if (!WebGLContext._forceSupportVAOPlatform())
				WebGLContext._angleInstancedArrays = WebGLContext._getExtension(gl, "ANGLE_instanced_arrays");
		}
		
		/**
		 * @private
		 */
		 static __init_native():void
		{
			if (!Render.supportWebGLPlusRendering) return;
			var webGLContext:any= WebGLContext;
			webGLContext.activeTexture = webGLContext.activeTextureForNative;
			webGLContext.bindTexture = webGLContext.bindTextureForNative;
			/*webGLContext.useProgram = webGLContext.useProgramForNative;
			webGLContext.bindVertexArray = webGLContext.bindVertexArrayForNative;
			webGLContext.setDepthTest = webGLContext.setDepthTestForNative;
			webGLContext.setDepthMask = webGLContext.setDepthMaskForNative;
			webGLContext.setDepthFunc = webGLContext.setDepthFuncForNative;
			webGLContext.setBlend = webGLContext.setBlendForNative;
			webGLContext.setBlendFunc = webGLContext.setBlendFuncForNative;
			webGLContext.setCullFace = webGLContext.setCullFaceForNative;
			webGLContext.setFrontFace = webGLContext.setFrontFaceForNative;*/
		}
		/**
		 * @private
		 */
		 static useProgram(gl:WebGLContext,program:any):boolean{
			if (WebGLContext._useProgram === program) 
				return false;
			gl.useProgram(program);
			WebGLContext._useProgram = program;
			return true;
		}
		
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthTest(gl:WebGLContext, value:boolean):void{
			value !== WebGLContext._depthTest && (WebGLContext._depthTest=value, value?gl.enable(WebGLContext.DEPTH_TEST):gl.disable(WebGLContext.DEPTH_TEST));
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthMask(gl:WebGLContext, value:boolean):void{
			value !== WebGLContext._depthMask && (WebGLContext._depthMask=value, gl.depthMask(value));
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthFunc(gl:WebGLContext, value:number):void{
			value !== WebGLContext._depthFunc && (WebGLContext._depthFunc=value, gl.depthFunc(value));
		}
		
		/**
		 * @private
		 */
		 static setBlend(gl:WebGLContext, value:boolean):void{
			value !== WebGLContext._blend && (WebGLContext._blend=value, value?gl.enable(WebGLContext.BLEND):gl.disable(WebGLContext.BLEND));
		}
		
		/**
		 * @private
		 */
		 static setBlendFunc(gl:WebGLContext, sFactor:number, dFactor:number):void{
			(sFactor !== WebGLContext._sFactor || dFactor !== WebGLContext._dFactor) && (WebGLContext._sFactor =WebGLContext._srcAlpha= sFactor, WebGLContext._dFactor =WebGLContext._dstAlpha= dFactor, gl.blendFunc(sFactor, dFactor));
		}
		
		/**
		 * @private
		 */
		 static setBlendFuncSeperate(gl:WebGLContext, srcRGB:number, dstRGB:number, srcAlpha:number, dstAlpha:number):void{
			if (srcRGB !== WebGLContext._sFactor || dstRGB !== WebGLContext._dFactor || srcAlpha !== WebGLContext._srcAlpha || dstAlpha !== WebGLContext._dstAlpha){
				WebGLContext._sFactor = srcRGB;
				WebGLContext._dFactor = dstRGB;
				WebGLContext._srcAlpha = srcAlpha;
				WebGLContext._dstAlpha = dstAlpha;
				gl.blendFuncSeparate(srcRGB, dstRGB,srcAlpha,dstAlpha);
			}
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setCullFace(gl:WebGLContext, value:boolean):void{
			 value !== WebGLContext._cullFace && (WebGLContext._cullFace = value, value?gl.enable(WebGLContext.CULL_FACE):gl.disable(WebGLContext.CULL_FACE));
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setFrontFace(gl:WebGLContext, value:number):void{
			value !== WebGLContext._frontFace && (WebGLContext._frontFace = value, gl.frontFace(value));
		}
		
		
		/**
		 * @private
		 */
		 static activeTexture(gl:WebGLContext, textureID:number):void{
			if (WebGLContext._activedTextureID !== textureID) {
				gl.activeTexture(textureID);	
				WebGLContext._activedTextureID = textureID;
			}
		}
		
		/**
		 * @private
		 */
		 static bindTexture(gl:WebGLContext, target:any, texture:any):void {
			if (WebGLContext._activeTextures[WebGLContext._activedTextureID-WebGLContext.TEXTURE0] !== texture){
				gl.bindTexture(target, texture);
				WebGLContext._activeTextures[WebGLContext._activedTextureID-WebGLContext.TEXTURE0] = texture;
			}
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static useProgramForNative(gl:WebGLContext,program:any):boolean{
			gl.useProgram(program);
			return true;
		}
		
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthTestForNative(gl:WebGLContext, value:boolean):void{
			if (value)gl.enable(WebGLContext.DEPTH_TEST);
			else gl.disable(WebGLContext.DEPTH_TEST);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthMaskForNative(gl:WebGLContext, value:boolean):void{
			gl.depthMask(value);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthFuncForNative(gl:WebGLContext, value:number):void{
			gl.depthFunc(value);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setBlendForNative(gl:WebGLContext, value:boolean):void{
			if (value) gl.enable(WebGLContext.BLEND);
			else gl.disable(WebGLContext.BLEND);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setBlendFuncForNative(gl:WebGLContext, sFactor:number, dFactor:number):void{
			gl.blendFunc(sFactor, dFactor);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setCullFaceForNative(gl:WebGLContext, value:boolean):void{
			 if (value) gl.enable(WebGLContext.CULL_FACE)
			 else gl.disable(WebGLContext.CULL_FACE);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setFrontFaceForNative(gl:WebGLContext, value:number):void{
			gl.frontFace(value);
		}
		
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static activeTextureForNative(gl:WebGLContext, textureID:number):void{
			gl.activeTexture(textureID);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static bindTextureForNative(gl:WebGLContext, target:any, texture:any):void {
			gl.bindTexture(target, texture);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static bindVertexArrayForNative(gl:WebGLContext, vertexArray:any):void {
			gl.bindVertexArray(vertexArray);
		}
	
		 getContextAttributes():any{return null;}
		
		 isContextLost():void{}
		
		 getSupportedExtensions():any{return null;}
		
		 getExtension(name:string):any{return null;}
		
		 activeTexture(texture:any):void{}
		
		 attachShader(program:any, shader:any):void{}
		
		 bindAttribLocation(program:any, index:number, name:string):void{}
		
		 bindBuffer(target:any, buffer:any):void{}
		
		 bindFramebuffer(target:any, framebuffer:any):void{}
		
		 bindRenderbuffer(target:any, renderbuffer:any):void{}
		
		 bindTexture(target:any, texture:any):void { }
		
		 useTexture(value:boolean):void{}
		
		 blendColor(red:any, green:any, blue:any, alpha:number):void{}
		
		 blendEquation(mode:any):void{}
		
		 blendEquationSeparate(modeRGB:any, modeAlpha:any):void{}
		
		 blendFunc(sfactor:any, dfactor:any):void{}
		
		 blendFuncSeparate(srcRGB:any, dstRGB:any, srcAlpha:any, dstAlpha:any):void{}
		
		 bufferData(target:any, size:any, usage:any):void{}
		
		 bufferSubData(target:any, offset:number, data:any):void{}
		
		 checkFramebufferStatus(target:any):any{ return null; }
		
		 clear(mask:number):void{}
		
		 clearColor(red:any, green:any, blue:any, alpha:number):void{}
		
		 clearDepth(depth:any):void{}
		
		 clearStencil(s:any):void{}
		
		 colorMask(red:boolean, green:boolean, blue:boolean, alpha:boolean):void{}
		
		 compileShader(shader:any):void{}
		
		 copyTexImage2D(target:any, level:any, internalformat:any, x:number, y:number, width:number, height:number, border:any):void{}
		
		 copyTexSubImage2D(target:any, level:any, xoffset:number, yoffset:number, x:number, y:number, width:number, height:number):void{}
		
		 createBuffer():any{}
		
		 createFramebuffer():any{}
		
		 createProgram():any{}
		
		 createRenderbuffer():any{}
		
		 createShader(type:any):any{}
		
		 createTexture():any{return null}
		
		 cullFace(mode:any):void{}
		
		 deleteBuffer(buffer:any):void{}
		
		 deleteFramebuffer(framebuffer:any):void{}
		
		 deleteProgram(program:any):void{}
		
		 deleteRenderbuffer(renderbuffer:any):void{}
		
		 deleteShader(shader:any):void{}
		
		 deleteTexture(texture:any):void{}
		
		 depthFunc(func:any):void{}
		
		 depthMask(flag:any):void{}
		
		 depthRange(zNear:any, zFar:any):void{}
		
		 detachShader(program:any, shader:any):void{}
		
		 disable(cap:any):void{}
		
		 disableVertexAttribArray(index:number):void{}
		
		 drawArrays(mode:any, first:number, count:number):void{}
		
		 drawElements(mode:any, count:number, type:any, offset:number):void{}
		
		 enable(cap:any):void{}
		
		 enableVertexAttribArray(index:number):void{}
		
		 finish():void{}
		
		 flush():void{}
		
		 framebufferRenderbuffer(target:any, attachment:any, renderbuffertarget:any, renderbuffer:any):void{}
		
		 framebufferTexture2D(target:any, attachment:any, textarget:any, texture:any, level:any):void{}
		
		 frontFace(mode:any):any{return null;}
		
		 generateMipmap(target:any):any{return null;}
		
		 getActiveAttrib(program:any, index:number):any{return null;}
		
		 getActiveUniform(program:any, index:number):any{return null;}
		
		 getAttribLocation(program:any, name:string):any{return 0;}
		
		 getParameter(pname:any):any{return null;}
		
		 getBufferParameter(target:any, pname:any):any{return null;}
		
		 getError():any{return null;}
		
		 getFramebufferAttachmentParameter(target:any, attachment:any, pname:any):void{}
		
		 getProgramParameter(program:any, pname:any):number{return 0;}
		
		 getProgramInfoLog(program:any):any{return null;}
		
		 getRenderbufferParameter(target:any, pname:any):any{return null; }
	
		 getShaderPrecisionFormat(...arg):any{return null; }
		
		 getShaderParameter(shader:any, pname:any):any{}
		
		 getShaderInfoLog(shader:any):any{return null;}
		
		 getShaderSource(shader:any):any{return null;}
		
		 getTexParameter(target:any, pname:any):void{}
		
		 getUniform(program:any, location:number):void{}
		
		 getUniformLocation(program:any, name:string):any{return null;}
		
		 getVertexAttrib(index:number, pname:any):any{return null;}
		
		 getVertexAttribOffset(index:number, pname:any):any{return null;}
		
		 hint(target:any, mode:any):void{}
		
		 isBuffer(buffer:any):void{}
		
		 isEnabled(cap:any):void{}
		
		 isFramebuffer(framebuffer:any):void{}
		
		 isProgram(program:any):void{}
		
		 isRenderbuffer(renderbuffer:any):void{}
		
		 isShader(shader:any):void{}
		
		 isTexture(texture:any):void{}
		
		 lineWidth(width:number):void{}
		
		 linkProgram(program:any):void{}
		
		 pixelStorei(pname:any, param:any):void{}
		
		 polygonOffset(factor:any, units:any):void{}
		
		 readPixels(x:number, y:number, width:number, height:number, format:any, type:any, pixels:any):void{}
		
		 renderbufferStorage(target:any, internalformat:any, width:number, height:number):void{}
		
		 sampleCoverage(value:any, invert:any):void{}
		
		 scissor(x:number, y:number, width:number, height:number):void{}
		
		 shaderSource(shader:any, source:any):void{}
		
		 stencilFunc(func:number, ref:number, mask:number):void{}
		
		 stencilFuncSeparate(face:number, func:number, ref:number, mask:number):void{}
		
		 stencilMask(mask:any):void{}
		
		 stencilMaskSeparate(face:any, mask:any):void{}
		
		 stencilOp(fail:number, zfail:number, zpass:number):void{}
		
		 stencilOpSeparate(face:number, fail:number, zfail:number, zpass:number):void{}
		
		 texImage2D(... args):void{}
		
		 texParameterf(target:any, pname:any, param:any):void{}
		
		 texParameteri(target:any, pname:any, param:any):void{}
		
		 texSubImage2D(... args):void{}
		
		 uniform1f(location:any, x:number):void{}
		
		 uniform1fv(location:any, v:any):void{}
		
		 uniform1i(location:any, x:number):void{}
		
		 uniform1iv(location:any, v:any):void{}
		
		 uniform2f(location:any, x:number, y:number):void{}
		
		 uniform2fv(location:any, v:any):void{}
		
		 uniform2i(location:any, x:number, y:number):void{}
		
		 uniform2iv(location:any, v:any):void{}
		
		 uniform3f(location:any, x:number, y:number, z:number):void{}
		
		 uniform3fv(location:any, v:any):void{}
		
		 uniform3i(location:any, x:number, y:number, z:number):void{}
		
		 uniform3iv(location:any, v:any):void{}
		
		 uniform4f(location:any, x:number, y:number, z:number, w:number):void{}
		
		 uniform4fv(location:any, v:any):void{}
		
		 uniform4i(location:any, x:number, y:number, z:number, w:number):void{}
		
		 uniform4iv(location:any, v:any):void{}
		
		 uniformMatrix2fv(location:any, transpose:any, value:any):void{}
		
		 uniformMatrix3fv(location:any, transpose:any, value:any):void{}
		
		 uniformMatrix4fv(location:any, transpose:any, value:any):void{}
		
		 useProgram(program:any):void{}
		
		 validateProgram(program:any):void{}
		
		 vertexAttrib1f(indx:any, x:number):void{}
		
		 vertexAttrib1fv(indx:any, values:any):void{}
		
		 vertexAttrib2f(indx:any, x:number, y:number):void{}
		
		 vertexAttrib2fv(indx:any, values:any):void{}
		
		 vertexAttrib3f(indx:any, x:number, y:number, z:number):void{}
		
		 vertexAttrib3fv(indx:any, values:any):void{}
		
		 vertexAttrib4f(indx:any, x:number, y:number, z:number, w:number):void{}
		
		 vertexAttrib4fv(indx:any, values:any):void{}
		
		 vertexAttribPointer(indx:any, size:any, type:any, normalized:any, stride:any, offset:number):void{}
		
		 viewport(x:number, y:number, width:number, height:number):void { }
		
		 configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil:boolean = true, wantsBestResolution:boolean = false):void{}/*;*/
		
		 compressedTexImage2D(... args):void{}
		
		//WebGL1.0下为扩展方法
		//TODO:coverage
		 createVertexArray():any{
			throw "not implemented";
		}
		
		//TODO:coverage
		 bindVertexArray(vao:any):void{
			throw "not implemented";
		}
		
		//TODO:coverage
		 deleteVertexArray(vao:any):void{
			throw "not implemented";
		}
		
		//TODO:coverage
		 isVertexArray(vao:any):void{
			throw "not implemented";
		}
		
	}


