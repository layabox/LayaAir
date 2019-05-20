import { Box } from "./Box"
	
	/**
	 * 自适应缩放容器，容器设置大小后，容器大小始终保持stage大小，子内容按照原始最小宽高比缩放
	 */
	export class ScaleBox extends Box {
		private _oldW:number = 0;
		private _oldH:number = 0;
		
		/*override*/  onEnable():void {
			(window as any).Laya.stage.on("resize", this, this.onResize);
			this.onResize();
		}
		
		/*override*/  onDisable():void {
			(window as any).Laya.stage.off("resize", this, this.onResize);
		}
		
		private onResize():void {
            var Laya = (window as any).Laya;
			if (this.width > 0 && this.height > 0) {
				var scale:number = Math.min(Laya.stage.width / this._oldW, Laya.stage.height / this._oldH);
				super.width = Laya.stage.width;
				super.height = Laya.stage.height;
				this.scale(scale, scale);
			}
		}
		
		/*override*/  set width(value:number) {
			super.width = value;
			this._oldW = value;
		}
		
		/*override*/  set height(value:number) {
			super.height = value;
			this._oldH = value;
		}
	}

