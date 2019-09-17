///////////////////////////////////////////////////////////
//  IDTools.as
//  Macromedia ActionScript Implementation of the Class IDTools
//  Created on:      2015-10-29 上午9:45:33
//  Original author: ww
///////////////////////////////////////////////////////////

/**
	 * 
	 * @author ww
	 * @version 1.0
	 * 
	 * @created  2015-10-29 上午9:45:33
	 */
	export class IDTools
	{
		constructor(){
		}
		 tID:number=1;
		 getID():number
		{
			return this.tID++;
		}
		 static _ID:IDTools=new IDTools();
		 static getAID():number
		{
			return IDTools._ID.getID();
		}
		private static _idDic:any={"default":new IDTools()};
		static idObjE(obj:any,sign:string="default"):any
		{
			if (obj[IDTools.idSign]) return obj;
			if(!sign)
			{
				sign="default";
			}
			if(!IDTools._idDic[sign])
			{
				IDTools._idDic[sign]=new IDTools();
			}
			obj[IDTools.idSign]=IDTools._idDic[sign].getAID();
			return obj;
		}
		 static setObjID(obj:any, id:number):any
		{
			obj[IDTools.idSign] = id;
			return obj;
		}
		 static idSign:string="_M_id_";
		 static idObj(obj:any):any
		{
			if (obj[IDTools.idSign]) return obj;
			obj[IDTools.idSign]=IDTools.getAID();
			return obj;
		}
		 static getObjID(obj:any):number
		{
			if(!obj) return -1;
			return obj[IDTools.idSign];
		}
	}

