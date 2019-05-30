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
	export class TraceFinder
	{
		private allowDiagonal:boolean;
		private dontCrossCorners:boolean;
		private diagonalMovement:number;
		private heuristic:Function;
		
		constructor(opt:any){
			opt = opt || {};
			this.allowDiagonal = opt.allowDiagonal;
			this.dontCrossCorners = opt.dontCrossCorners;
			this.heuristic = opt.heuristic || Heuristic.manhattan;
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
			
			//When diagonal movement is allowed the manhattan heuristic is not admissible
			//It should be octile instead
			if (this.diagonalMovement == DiagonalMovement.Never)
			{
				this.heuristic = opt.heuristic || Heuristic.manhattan;
			}
			else
			{
				this.heuristic = opt.heuristic || Heuristic.octile;
			}
		}
		
		 findPath(startX:number, startY:number, endX:number, endY:number, grid:Grid):any[]
		{
			var openList:Heap = new Heap(function(nodeA:Node, nodeB:Node):number
			{
				return nodeA.f - nodeB.f;
			}), startNode:Node = grid.getNodeAt(startX, startY), endNode:Node = grid.getNodeAt(endX, endY), heuristic:Function = this.heuristic, allowDiagonal:boolean = this.allowDiagonal, dontCrossCorners:boolean = this.dontCrossCorners, abs:Function = Math.abs, SQRT2:number = Math.SQRT2, node:Node, neighbors:any[], neighbor:Node, i:number, l:number, x:number, y:number, ng:number;
			
			startNode.g = 0;
			startNode.f = 0;
			
			openList.push(startNode);
			startNode.opened = true;
			
			while (!openList.empty())
			{
				node = (<Node>openList.pop() );
				node.closed = true;
				
				if (node === endNode)
				{
					return Util.backtrace(endNode);
				}
				
				neighbors = grid.getNeighbors(node, this.diagonalMovement);
				for (i = 0, l = neighbors.length; i < l; ++i)
				{
					neighbor = neighbors[i];
					
					if (neighbor.closed)
					{
						continue;
					}
					
					x = neighbor.x;
					y = neighbor.y;
					
					ng = node.g + ((x - node.x === 0 || y - node.y === 0) ? 1 : SQRT2);
					
					if (!neighbor.opened || ng < neighbor.g)
					{
						//neighbor.g = ng;
						//neighbor.h = neighbor.h || weight * heuristic(abs(x - endX), abs(y - endY));
						neighbor.g = ng * l / 9;
						neighbor.h = neighbor.h || heuristic(abs(x - endX), abs(y - endY));
						neighbor.f = neighbor.g + neighbor.h;
						neighbor.parent = node;
						
						if (!neighbor.opened)
						{
							openList.push(neighbor);
							neighbor.opened = true;
						}
						else
						{
							openList.updateItem(neighbor);
						}
					}
				}
			}
			
			return [];
		}
	}


