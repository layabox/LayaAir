/**
	 * https://en.wikipedia.org/wiki/Wavefront_.obj_file
	 * http://paulbourke.net/dataformats/mtl/
	 * https://github.com/frenchtoast747/webgl-obj-loader
	 */
	
	export class OBJLoader_Material {
		 name:string;
		 ambient:any[] = [0, 0, 0]; // Ka - Ambient Reflectivity
		 diffuse:any[] = [0, 0, 0]; // Kd - Defuse Reflectivity
		 specular:any[] = [0, 0, 0];// Ks
		 emissive:any[] = [0, 0, 0];// Ke
		 transmissionFilter:any[] = [0, 0, 0];// Tf
		 dissolve:number = 0;// d
		 specularExponent:number = 0;// valid range is between 0 and 1000
		 transparency:number = 0;// either d or Tr; valid values are normalized
		 illumination:number = 0;// illum - the enum of the illumination model to use
		 refractionIndex:number = 1;// Ni - Set to "normal" (air).
		 sharpness:number= 0;// sharpness
		 mapDiffuse = null;// map_Kd
		 mapAmbient = null;// map_Ka
		 mapSpecular = null;// map_Ks
		 mapSpecularExponent = null;// map_Ns
		 mapDissolve = null;// map_d
		 antiAliasing = false;// map_aat
		 mapBump = null;// map_bump or bump
		 mapDisplacement = null;// disp
		 mapDecal = null;// decal
		 mapEmissive = null;// map_Ke
		// refl - when the reflection type is a cube, there will be multiple refl
		//        statements for each side of the cube. If it's a spherical
		//        reflection, there should only ever be one.
		 mapReflections:any[] = [];
         currentMaterial:OBJLoader_Material = null;
         materials:any = { };		// 
		
		/**
		 * Constructor
		 * @param {String} name the unique name of the material
		 */
		constructor(name) {
			// the unique material ID.
			name = name;
		}

		 parse_newmtl(tokens:string[]):void {
			var name:string = tokens[0];
			this.currentMaterial = this.materials[name] = new OBJLoader_Material(name);
		}

		 parseColor(tokens) {
			if (tokens[0] == "spectral") {
				console.error(
					"The MTL parser does not support spectral curve files. You will " +
						"need to convert the MTL colors to either RGB or CIEXYZ."
				);
				return;
			}

			if (tokens[0] == "xyz") {
				console.warn("TODO: convert XYZ to RGB");
				return;
			}

			// from my understanding of the spec, RGB values at this point
			// will either be 3 floats or exactly 1 float, so that's the check
			// that i'm going to perform here
			if (tokens.length == 3) {
				return tokens.map(parseFloat);
			}

			// Since tokens at this point has a length of 3, we're going to assume
			// it's exactly 1, skipping the check for 2.
			var value = parseFloat(tokens[0]);
			// in this case, all values are equivalent
			return [value, value, value];
		}

		
		 parse_Ka(tokens) {
			this.currentMaterial.ambient = this.parseColor(tokens);
		}

	 
		 parse_Kd(tokens) {
			this.currentMaterial.diffuse = this.parseColor(tokens);
		}

	   
		 parse_Ks(tokens) {
			this.currentMaterial.specular = this.parseColor(tokens);
		}

	  
		 parse_Ke(tokens) {
			this.currentMaterial.emissive = this.parseColor(tokens);
		}

	   
		 parse_Tf(tokens) {
			this.currentMaterial.transmissionFilter = this.parseColor(tokens);
		}

		 parse_d(tokens) {
			// this ignores the -halo option as I can't find any documentation on what
			// it's supposed to be.
			this.currentMaterial.dissolve = parseFloat(tokens.pop());
		}

		 parse_illum(tokens) {
			this.currentMaterial.illumination = parseInt(tokens[0]);
		}

	  
		 parse_Ni(tokens) {
			this.currentMaterial.refractionIndex = parseFloat(tokens[0]);
		}

		 parse_Ns(tokens) {
			this.currentMaterial.specularExponent = parseInt(tokens[0]);
		}

	  
		 parse_sharpness(tokens) {
			this.currentMaterial.sharpness = parseInt(tokens[0]);
		}

	   
		 parse_cc(values, options) {
			options.colorCorrection = values[0] == "on";
		}

	  
		 parse_blendu(values, options) {
			options.horizontalBlending = values[0] == "on";
		}

		 parse_blendv(values, options) {
			options.verticalBlending = values[0] == "on";
		}

	   
		 parse_boost(values, options) {
			options.boostMipMapSharpness = parseFloat(values[0]);
		}

	  
		 parse_mm(values, options) {
			options.modifyTextureMap.brightness = parseFloat(values[0]);
			options.modifyTextureMap.contrast = parseFloat(values[1]);
		}

	  
		 parse_ost(values, option, defaultValue) {
			while (values.length < 3) {
				values.push(defaultValue);
			}

			option.u = parseFloat(values[0]);
			option.v = parseFloat(values[1]);
			option.w = parseFloat(values[2]);
		}

	   
		 parse_o(values, options) {
			this.parse_ost(values, options.offset, 0);
		}

	  
		 parse_s(values, options) {
			this.parse_ost(values, options.scale, 1);
		}

	  
		 parse_t(values, options) {
			this.parse_ost(values, options.turbulence, 0);
		}

	  
		 parse_texres(values, options) {
			options.textureResolution = parseFloat(values[0]);
		}

	  
		 parse_clamp(values, options) {
			options.clamp = values[0] == "on";
		}

	  
		 parse_bm(values, options) {
			options.bumpMultiplier = parseFloat(values[0]);
		}

	  
		 parse_imfchan(values, options) {
			options.imfChan = values[0];
		}

	   
		 parse_type(values, options) {
			options.reflectionType = values[0];
		}

	  
		 parseOptions(tokens) {
			var options = {
				colorCorrection: false,
				horizontalBlending: true,
				verticalBlending: true,
				boostMipMapSharpness: 0,
				modifyTextureMap: {
					brightness: 0,
					contrast: 1
				},
				offset: { u: 0, v: 0, w: 0 },
				scale: { u: 1, v: 1, w: 1 },
				turbulence: { u: 0, v: 0, w: 0 },
				clamp: false,
				textureResolution: null,
				bumpMultiplier: 1,
				imfChan: null
			};

			var option;
			var values;
			var optionsToValues = {};

			tokens.reverse();

			while (tokens.length) {
				const token:string = tokens.pop();

				if (token.charAt(0)=="-") {
					option = token.substr(1);
					optionsToValues[option] = [];
				} else {
					optionsToValues[option].push(token);
				}
			}

			for (option in optionsToValues) {
				if (!optionsToValues.hasOwnProperty(option)) {
					continue;
				}
				values = optionsToValues[option];
				var optionMethod = this['parse_'+option];
				if (optionMethod) {
					optionMethod.call(this,values, options);
				}
			}

			return options;
		}

	   
		 parseMap(tokens) {
			// according to wikipedia:
			// (https://en.wikipedia.org/wiki/Wavefront_.obj_file#Vendor_specific_alterations)
			// there is at least one vendor that places the filename before the options
			// rather than after (which is to spec). All options start with a '-'
			// so if the first token doesn't start with a '-', we're going to assume
			// it's the name of the map file.
			var filename;
			var options;
			if (!(tokens[0].charAt(0)=="-") ){
				[filename, ...options] = tokens;
			} else {
				filename = tokens.pop();
				options = tokens;
			}

			options = this.parseOptions(options);
			options["filename"] = filename;
			return options;
		}

	   
		 parse_map_Ka(tokens) {
			this.currentMaterial.mapAmbient = this.parseMap(tokens);
		}

	   
		 parse_map_Kd(tokens) {
			this.currentMaterial.mapDiffuse = this.parseMap(tokens);
		}

		 parse_map_Ks(tokens) {
			this.currentMaterial.mapSpecular = this.parseMap(tokens);
		}

	   
		 parse_map_Ke(tokens) {
			this.currentMaterial.mapEmissive = this.parseMap(tokens);
		}

	   
		 parse_map_Ns(tokens) {
			this.currentMaterial.mapSpecularExponent = this.parseMap(tokens);
		}

	 
		 parse_map_d(tokens) {
			this.currentMaterial.mapDissolve = this.parseMap(tokens);
		}

	 
		 parse_map_aat(tokens) {
			this.currentMaterial.antiAliasing = tokens[0] == "on";
		}

	 
		 parse_map_bump(tokens) {
			this.currentMaterial.mapBump = this.parseMap(tokens);
		}

	  
		 parse_bump(tokens) {
			this.parse_map_bump(tokens);
		}

	  
		 parse_disp(tokens) {
			this.currentMaterial.mapDisplacement = this.parseMap(tokens);
		}

	  
		 parse_decal(tokens) {
			this.currentMaterial.mapDecal = this.parseMap(tokens);
		}

	  
		 parse_refl(tokens) {
			this.currentMaterial.mapReflections.push(this.parseMap(tokens));
		}

   
		 parse(mtlData:string) {
			var lines:string[] = mtlData.split(/\r?\n/) as string[];
			for (var i:number = 0; i < lines.length; i++) {
				var line:string = lines[i].trim();
				if (!line || line.charAt(0)=="#") {
					continue;
				}

				var tokens:string[] = line.split(/\s/) as string[];
				var directive = tokens[0];
				var parseMethod = this['parse_' + directive];
				if (!parseMethod) {
					console.warn("Don't know how to parse the directive: "+directive);
					continue;
				}
				
				[directive, ...tokens] = tokens;;
				parseMethod.call(this, tokens);
			}
			this.currentMaterial = null;
		}
	}

	
	