import { DiagonalMovement } from "../core/DiagonalMovement"
	import { Grid } from "../core/Grid"
	import { Heuristic } from "../core/Heuristic"
	import { Node } from "../../../../../core/src/laya/display/Node"
	import { Util } from "../core/Util"
	import { Heap } from "../libs/Heap"
	
	/**
	 * ...
	 * @author dongketao
	 */
	export class BiBreadthFirstFinder
	{
		private allowDiagonal:boolean;
		private dontCrossCorners:boolean;
		private heuristic:Function;
		private weight:number;
		private diagonalMovement:number;
		
		/**
		 * Bi-directional Breadth-First-Search path finder.
		 * @constructor
		 * @param {object} opt
		 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
		 *     Deprecated, use diagonalMovement instead.
		 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
		 *     block corners. Deprecated, use diagonalMovement instead.
		 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
		 */
		constructor(opt:any){
			opt = opt || {};
			this.allowDiagonal = opt.allowDiagonal;
			this.dontCrossCorners = opt.dontCrossCorners;
			this.diagonalMovement = opt.diagonalMovement;
			
			if (!this.diagonalMovement)
			{
				if (!this.allowDiagonal)
				{
					this.diagonalMovement = DiagonalMovement.Never;
				}
				else
				{
					if (this.dontCrossCorners)
					{
						this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
					}
					else
					{
						this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
					}
				}
			}
		}
		
		/**
		 * Find and return the the path.
		 * @return {Array<Array<number>>} The path, including both start and
		 *     end positions.
		 */
		 findPath(startX:number, startY:number, endX:number, endY:number, grid:Grid):any[]
		{
			var startNode:Node = grid.getNodeAt(startX, startY), endNode:Node = grid.getNodeAt(endX, endY), startOpenList:any[] = [], endOpenList:any[] = [], neighbors:any[], neighbor:Node, node:Node, diagonalMovement:number = this.diagonalMovement, BY_START:number = 0, BY_END:number = 1, i:number, l:number;
			
			// push the start and end nodes into the queues
			startOpenList.push(startNode);
			startNode.opened = true;
			startNode.by = BY_START;
			
			endOpenList.push(endNode);
			endNode.opened = true;
			endNode.by = BY_END;
			
			// while both the queues are not empty
			while (startOpenList.length && endOpenList.length)
			{
				
				// expand start open list
				
				node = startOpenList.shift();
				node.closed = true;
				
				neighbors = grid.getNeighbors(node, diagonalMovement);
				for (i = 0, l = neighbors.length; i < l; ++i)
				{
					neighbor = neighbors[i];
					
					if (neighbor.closed)
					{
						continue;
					}
					if (neighbor.opened)
					{
						// if this node has been inspected by the reversed search,
						// then a path is found.
						if (neighbor.by === BY_END)
						{
							return Util.biBacktrace(node, neighbor);
						}
						continue;
					}
					startOpenList.push(neighbor);
					neighbor.parent = node;
					neighbor.opened = true;
					neighbor.by = BY_START;
				}
				
				// expand end open list
				
				node = endOpenList.shift();
				node.closed = true;
				
				neighbors = grid.getNeighbors(node, diagonalMovement);
				for (i = 0, l = neighbors.length; i < l; ++i)
				{
					neighbor = neighbors[i];
					
					if (neighbor.closed)
					{
						continue;
					}
					if (neighbor.opened)
					{
						if (neighbor.by === BY_START)
						{
							return Util.biBacktrace(neighbor, node);
						}
						continue;
					}
					endOpenList.push(neighbor);
					neighbor.parent = node;
					neighbor.opened = true;
					neighbor.by = BY_END;
				}
			}
			
			// fail to find the path
			return [];
		}
	}


