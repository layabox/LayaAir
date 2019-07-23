export class Pick2DEdgeResult {
		 ObjID:number =-1;
		 PtIdx:number =-1;			// TODO 如果是图的话，用点来指示边是不对的
		
		 projX:number = 0;		// 投影到线上点
		 projY:number = 0;
		
		 dist2:number = 0;		// 投影点到自己的距离的平方
		
		 offX:number = 0; 		//距离实际点的距离
		 offY:number = 0;
	}

