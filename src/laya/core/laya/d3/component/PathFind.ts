	import { MeshTerrainSprite3D } from "laya/d3/core/MeshTerrainSprite3D"
import { Component } from "laya/components/Component";
	
	/**
	 * <code>PathFinding</code> 类用于创建寻路。
	 */
	export class PathFind extends Component {
		/** @private */
		private _meshTerrainSprite3D:MeshTerrainSprite3D
		/** @private */
		private _finder:AStarFinder;
		/** @private */
		 _setting:any;
		
		/**寻路网格。*/
		 grid:Grid;
		
		/**
		 * 获取寻路设置。
		 * @return 寻路设置。
		 */
		 get setting():any {
			return this._setting;
		}
		
		/**
		 * 设置寻路设置。
		 * @param value 寻路设置。
		 */
		 set setting(value:any) {
			(value) && (this._finder = new AStarFinder(value));
			this._setting = value;
		}
		
		/**
		 * 创建一个新的 <code>PathFinding</code> 实例。
		 */
		constructor(){super();

		
		}
		
		/**
		 * @private
		 * 初始化载入蒙皮动画组件。
		 * @param	owner 所属精灵对象。
		 */
		/*override*/  _onAdded():void {
			if (!this.owner instanceof MeshTerrainSprite3D)
				throw new Error("PathFinding: The owner must MeshTerrainSprite3D!");
			
			this._meshTerrainSprite3D = (<MeshTerrainSprite3D>this.owner );
		}
		
		/**
		 * 寻找路径。
		 * @param	startX 开始X。
		 * @param	startZ 开始Z。
		 * @param	endX 结束X。
		 * @param	endZ 结束Z。
		 * @return  路径。
		 */
		 findPath(startX:number, startZ:number, endX:number, endZ:number):any[] {
			var minX:number = this._meshTerrainSprite3D.minX;
			var minZ:number = this._meshTerrainSprite3D.minZ;
			var cellX:number = this._meshTerrainSprite3D.width / this.grid.width;
			var cellZ:number = this._meshTerrainSprite3D.depth / this.grid.height
			var halfCellX:number = cellX / 2;
			var halfCellZ:number = cellZ / 2;
			
			var gridStartX:number = Math.floor((startX - minX) / cellX);
			var gridStartZ:number = Math.floor((startZ - minZ) / cellZ);
			var gridEndX:number = Math.floor((endX - minX) / cellX);
			var gridEndZ:number = Math.floor((endZ - minZ) / cellZ);
			
			var boundWidth:number = this.grid.width - 1;
			var boundHeight:number = this.grid.height - 1;
			(gridStartX > boundWidth) && (gridStartX = boundWidth);
			(gridStartZ > boundHeight) && (gridStartZ = boundHeight);
			(gridStartX < 0) && (gridStartX = 0);
			(gridStartZ < 0) && (gridStartZ = 0);
			
			(gridEndX > boundWidth) && (gridEndX = boundWidth);
			(gridEndZ > boundHeight) && (gridEndZ = boundHeight);
			(gridEndX < 0) && (gridEndX = 0);
			(gridEndZ < 0) && (gridEndZ = 0);
			
			var path:any[] = this._finder.findPath(gridStartX, gridStartZ, gridEndX, gridEndZ, this.grid);
			this.grid.reset();
			
			for (var i:number = 1; i < path.length - 1; i++) {
				var gridPos:any[] = path[i];
				gridPos[0] = gridPos[0] * cellX + halfCellX + minX;
				gridPos[1] = gridPos[1] * cellZ + halfCellZ + minZ;
			}
			
			if (path.length == 1) {
				path[0][0] = endX;
				path[0][1] = endX;
			} else if (path.length > 1) {
				path[0][0] = startX;
				path[0][1] = startZ;
				path[path.length - 1][0] = endX;
				path[path.length - 1][1] = endZ;
			}
			return path;
		}
	
	}


