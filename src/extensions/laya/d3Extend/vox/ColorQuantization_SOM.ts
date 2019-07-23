export class ColorQuantization_SOM { }


	/**
	 * Created by Peihong Guo on 11/28/13.
	 * 基于自适应网络的减色法
	 * @param src {{w:Number,h:Number, getPixel:(x:Number,y:Number)=>{r:Number,g:Number,b:Number}}}
	 * @param n  要输出的模式个数。这里就是调色板个数
	 * @param sr 取完整输入样本中的多少作为输入
	 * @return {{r:Number,g:Number,b:Number}[]} 返回一个256色的调色板
	 */
	function neuralnetwork(src:any, n:number=256, sr:number=0.25):any[] {
		var h:number = src.h, w:number = src.w;
		var inColors:any[] = [];
		for(var y:number= 0;y<h;y++) {
			for(var x:number=0;x<w;x++) {
				inColors.push(src.getPixel(x, y));
			}
		}

		// set up the color entries
		// 初始输出颜色（W0）是黑到白的渐变
		var colors:any[] = [];
		var step:number = 255 / (n-1);
		for(var i:number=0;i<n;i++) {
			colors.push({
				r: i * step,
				g: i * step,
				b: i * step,
				freq: 1.0/256,
				bias: 0
			})
		}

		// sample the input colors
		// sample 是从输入中随机选择一部分。实际也可以换成完整的输入样本
		var nsamples:number = inColors.length * sr;
		var samples:any[] = [];
		for(var i:number=0;i<nsamples;i++) {
			samples.push( inColors[Math.round(Math.random() * (inColors.length - 1))] );
		}

		var ncycles:number = 100;	// 调整α的次数，相当于训练多少轮。
		var delta:number = Math.round(samples.length / ncycles);

		var gamma:number = 1024;
		var beta:number = 1.0 / gamma;

		var alpha:number = 1.0;

		// update the color entries using the samples
		// 用输入样本训练输出节点
		for(var i:number=0;i<samples.length;i++) {
			// find the best entrie for current color
			// 选出优胜节点
			var idx:number, minDist:number = Number.MAX_VALUE;
			for(var j:number=0;j<colors.length;j++) {
				var dr:number = Math.abs(samples[i].r - colors[j].r);
				var dg:number = Math.abs(samples[i].g - colors[j].g);
				var db:number = Math.abs(samples[i].b - colors[j].b);
				var dist:number = dr + dg + db - colors[j].bias;
				if( dist < minDist ) {
					minDist = dist;
					idx = j;
				}
			}

			// 调整节点的 frequency和bias。
			// 最合适的节点 和 其他节点的调整方向是相反的
			for(var j:number=0;j<colors.length;j++) {
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
			// 调整最合适节点的颜色值
			colors[idx].r = alpha * samples[i].r + (1.0 - alpha) * colors[idx].r;
			colors[idx].g = alpha * samples[i].g + (1.0 - alpha) * colors[idx].g;
			colors[idx].b = alpha * samples[i].b + (1.0 - alpha) * colors[idx].b;

			// 每隔一定时间调整一下alpha，减慢RGB调整幅度
			if( i % delta == 0 ) {
				alpha -= alpha / (30 + (samples.length-1)/3);
			}
		}
		return colors;
	}		
	
	