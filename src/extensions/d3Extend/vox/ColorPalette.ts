export class ColorPalette {
	
		 loadImage():void {
			
		}
		
		 toPalette():void {
			
		}
		
		 trueColor2Palette() {
			
		}
		
		/**
		 * Media-Cut 减色法
		 */
		 Median_Cut():void {
			
		}
	
		/**
		 * k聚类减色法
		 */
		 k_Means_Clustering():void {
			
		}

		/**
		 * 神经网络减色法
		 */
		 ANN():void {
			
		}
		
		private  neuralnetwork(src, n, sr) {
			var sr = sr || 0.25;
			var h = src.h, w = src.w;
			var inColors = [];
			for(var y= 0;y<h;y++) {
				for(var x=0;x<w;x++) {
					inColors.push(src.getPixel(x, y));
				}
			}

			// set up the color entries
			var colors = [];
			var step = 255 / (n-1);
			for(var i=0;i<n;i++) {
				colors.push({
					r: i * step,
					g: i * step,
					b: i * step,
					freq: 1.0/256,
					bias: 0
				})
			}

			// sample the input colors
			var nsamples = inColors.length * sr;
			console.log(nsamples);
			var samples = [];
			for(var i=0;i<nsamples;i++) {
				samples.push( inColors[Math.round(Math.random() * (inColors.length - 1))] );
			}

			var ncycles = 100;
			var delta = Math.round(samples.length / ncycles);

			var gamma = 1024;
			var beta = 1.0 / gamma;

			var alpha = 1.0;

			// update the color entries using the samples
			for(var i=0;i<samples.length;i++) {

				// find the best entrie for current color
				var idx, minDist = Number.MAX_VALUE;
				for(var j=0;j<colors.length;j++) {
					var dr = Math.abs(samples[i].r - colors[j].r);
					var dg = Math.abs(samples[i].g - colors[j].g);
					var db = Math.abs(samples[i].b - colors[j].b);
					var dist = dr + dg + db - colors[j].bias;
					if( dist < minDist ) {
						minDist = dist;
						idx = j;
					}
				}

				// update frequency and bias
				for(var j=0;j<colors.length;j++) {

					if( j == idx ) {
						colors[j].freq -= beta * (colors[j].freq - 1);
						colors[j].bias += (colors[j].freq - 1);
					}
					else{
						colors[j].freq -= beta * colors[j].freq;
						colors[j].bias += colors[j].freq;
					}
				}

				// update this entry
				colors[idx].r = alpha * samples[i].r + (1.0 - alpha) * colors[idx].r;
				colors[idx].g = alpha * samples[i].g + (1.0 - alpha) * colors[idx].g;
				colors[idx].b = alpha * samples[i].b + (1.0 - alpha) * colors[idx].b;

				if( i % delta == 0 ) {
					alpha -= alpha / (30 + (samples.length-1)/3);
				}
			}

			return colors;
		}		
	}

	