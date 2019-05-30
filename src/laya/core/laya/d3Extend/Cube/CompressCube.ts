import { PlaneInfo } from "./PlaneInfo"
	import { CompressPlane } from "./CompressPlane"
	import { CompressPlaneVector } from "./CompressPlaneVector"
	import { CubeInfo } from "./CubeInfo"
	
	/**
	 * ...
	 * @author 
	 */
	export class CompressCube 
	{
		//用这个队列来管理所有CubeInfo
		private _CubeInfoList:CubeInfo[] = [];
		
		constructor(CubeInfoList:CubeInfo[]){
			//_data = CubeInfoList;
			this._CubeInfoList = CubeInfoList;
		}
		
		 comPressByAxis():CompressPlaneVector[] {
			//先按照32*32*32分割一下
			var vecCubeSlice32:any[] = [];
			for (var c in this._CubeInfoList) {
				var cube:CubeInfo = this._CubeInfoList[c];
				var key:string = this._sliceXYZBy32(cube.x, cube.y, cube.z);
				if(vecCubeSlice32[key] == null){
					vecCubeSlice32[key] = [];
				}
				vecCubeSlice32[key].push(cube);	
			}
			var z1:CompressPlaneVector = new CompressPlaneVector;
			var y1:CompressPlaneVector = new CompressPlaneVector;
			var x1:CompressPlaneVector = new CompressPlaneVector;
			var z0:CompressPlaneVector = new CompressPlaneVector;
			var y0:CompressPlaneVector = new CompressPlaneVector;
			var x0:CompressPlaneVector = new CompressPlaneVector;
			
			for (var cube32 in vecCubeSlice32) {
				var vecCubeList32:CubeInfo[] = vecCubeSlice32[cube32];
				
				var CubeInfoListByZAxis:any[] = [];
				var CubeInfoListByYAxis:any[] = [];
			    var CubeInfoListByXAxis:any[] = [];
				
				for (var cubeindex in vecCubeList32) {
				var cubeInfo:CubeInfo = (<CubeInfo>this._CubeInfoList[cubeindex] );
				var x:number = cubeInfo.x;
				var y:number = cubeInfo.y;
				var z:number = cubeInfo.z;
				if (CubeInfoListByZAxis[z] == null) {
					var vecCubeZ:CubeInfo[] = [];
					CubeInfoListByZAxis[z] = vecCubeZ;
				}
				if (CubeInfoListByYAxis[y] == null) {
					var vecCubeY:CubeInfo[] = [];
					CubeInfoListByYAxis[y] = vecCubeY;
				}
				if (CubeInfoListByXAxis[x] == null) {
					var vecCubeX:CubeInfo[] = [];
					CubeInfoListByXAxis[x] = vecCubeX;
				}
				CubeInfoListByZAxis[z].push(cubeInfo);
				CubeInfoListByYAxis[y].push(cubeInfo);
				CubeInfoListByXAxis[x].push(cubeInfo);	
			}
			
			this._combineByZAxis(CubeInfoListByZAxis, false, z1);
			this._combineByYAxis(CubeInfoListByYAxis, false, y1);
			this._combineByXAxis(CubeInfoListByXAxis, false, x1);
			this._combineByZAxis(CubeInfoListByZAxis, true, z0);
			this._combineByYAxis(CubeInfoListByYAxis, true, y0);
			this._combineByXAxis(CubeInfoListByXAxis, true, x0);
				
		}
			//var CubeInfoListByZAxis:Vector.<Vector.<CubeInfo> > = new Vector.<Vector.<CubeInfo> >;
			//var CubeInfoListByYAxis:Vector.<Vector.<CubeInfo> > = new Vector.<Vector.<CubeInfo> >;
			//var CubeInfoListByXAxis:Vector.<Vector.<CubeInfo> > = new Vector.<Vector.<CubeInfo> >;
			////不需要sort sort会导致崩溃
			////CubeInfoList.sort();
			//for (cubeindex in _CubeInfoList) {
				//var cubeInfo:CubeInfo = _CubeInfoList[cubeindex] as CubeInfo;
				//var x:int = cubeInfo.x;
				//var y:int = cubeInfo.y;
				//var z:int = cubeInfo.z;
				//if (CubeInfoListByZAxis[z] == null) {
					//var vecCubeZ:Vector.<CubeInfo> = new Vector.<CubeInfo>;
					//CubeInfoListByZAxis[z] = vecCubeZ;
				//}
				//if (CubeInfoListByYAxis[y] == null) {
					//var vecCubeY:Vector.<CubeInfo> = new Vector.<CubeInfo>;
					//CubeInfoListByYAxis[y] = vecCubeY;
				//}
				//if (CubeInfoListByXAxis[x] == null) {
					//var vecCubeX:Vector.<CubeInfo> = new Vector.<CubeInfo>;
					//CubeInfoListByXAxis[x] = vecCubeX;
				//}
				//CubeInfoListByZAxis[z].push(cubeInfo);
				//CubeInfoListByYAxis[y].push(cubeInfo);
				//CubeInfoListByXAxis[x].push(cubeInfo);	
			//}
			////最终结果
			//var vecCompressPlaneVector:Vector.<CompressPlaneVector> = new Vector.<CompressPlaneVector>
			//var z1:CompressPlaneVector = _combineByZAxis(CubeInfoListByZAxis, false);
			//var y1:CompressPlaneVector = _combineByYAxis(CubeInfoListByYAxis, false);
			//var x1:CompressPlaneVector = _combineByXAxis(CubeInfoListByXAxis, false);
			//var z0:CompressPlaneVector = _combineByZAxis(CubeInfoListByZAxis, true);
			//var y0:CompressPlaneVector = _combineByYAxis(CubeInfoListByYAxis, true);
			//var x0:CompressPlaneVector = _combineByXAxis(CubeInfoListByXAxis, true);
			
			//最终结果
			var vecCompressPlaneVector:CompressPlaneVector[] = []
			vecCompressPlaneVector.push(z1);
			vecCompressPlaneVector.push(z0);
			vecCompressPlaneVector.push(y1);
			vecCompressPlaneVector.push(y0);
			vecCompressPlaneVector.push(x1);
			vecCompressPlaneVector.push(x0);
			return vecCompressPlaneVector;
		}
		
		/**
		 * 
		 * @param	vec
		 * @param	orientation:frontVBIndex,up,leght为true,back,down,right为false.
		 */
		private _combineByZAxis( vec:any[] , orientation:boolean, zResult:CompressPlaneVector) :void{
			
			//建立一个映射的map
			var keyMap:string[] = [];
			//存储整理好的结果
			var zCompressPlaneVector:CompressPlaneVector = zResult;
			for (var vecZindex in vec) {
				//最终处理的Z值
				var lastZ:number = parseInt(vecZindex);
				if (orientation) {
					lastZ += 1;
				}
				//每一次沿着z轴取一个面
				var vecOneZ:CubeInfo[] = vec[vecZindex];
				vecOneZ.sort();
				var countOneZ:number = vecOneZ.length;
				var vecOneZbyY:any[] = [];
				
				//将cube按照y分配到数组之中
				for (var i = 0; i < countOneZ; i++ ) {
					var cube:CubeInfo = vecOneZ[i];
					var cy:number = cube.y;
					//正面不可见,直接返回
					if (orientation) {
						zCompressPlaneVector.face = 0;
						if (cube.frontVBIndex == -1) {
							continue;
						}
					}
					else {
						zCompressPlaneVector.face = 1;
						if (cube.backVBIndex == -1) {
							continue;
						}
					}
						
					if (vecOneZbyY[cy] == null) {
						var vecCubeY:CubeInfo[] = [];
						vecOneZbyY[cy] = vecCubeY;
					}
					vecOneZbyY[cy].push(cube);
				}
				
				//合并一行(y)
				var planeByY:any[] = [];
				var yCount:number = 0;
				for (var yIndex in vecOneZbyY) {
					var cubeOneLine:CubeInfo[] = vecOneZbyY[yIndex];
					//根据x值进行排序
					cubeOneLine.sort(this._sortCubeByX);
					//存储一行之后合并之后的色块
					var planeLine:PlaneInfo[] = [];
					var plane:PlaneInfo = new PlaneInfo(0, 0, 0, 0, 0);
					for (var cubeIndex in cubeOneLine) {
						var cubeX:CubeInfo = cubeOneLine[cubeIndex];
						var cx:number = cubeX.x;
						var cy:number = cubeX.y;
						var cColorIndex:number = cubeX.color;
						if (plane.width == 0) {//这个PlaneInfo是新的	
							plane.setValue(cx, cy, 1, 1, cColorIndex);	
							planeLine.push(plane);
						}
						else {
							if ((plane.p1 + plane.width) == cx && plane.colorIndex == cColorIndex) {
								//合并
								plane.addWidth(1);
							}
							else {
								//合并好的存储起来
								var planeCom:PlaneInfo = new PlaneInfo(plane.p1, plane.p2, plane.width, plane.height, plane.colorIndex);
								planeLine.push(planeCom);
								//重置plane
								plane.setValue(cx, cy, 1, 1, cColorIndex);	
							}
						}
					}
					planeByY[yCount++] = planeLine;
				}
				//planeByY.sort();
				//合并已经整理好的每一行
				var comLine:PlaneInfo[] = [];//存储合并后plane数组
				var planeLine:PlaneInfo[] = null;
				var planeNextLine:PlaneInfo[];
				for (var lineYIndex in planeByY) {
					planeNextLine = planeByY[lineYIndex];
					if (planeLine == null) {
						planeLine = planeNextLine;
						//如果当前数组中只有一个PlaneInfo
						if (planeByY.length == 1) {
							for (var planeindex in planeLine) {
								var tmpPlane:PlaneInfo = planeLine[planeindex];
								zCompressPlaneVector.addPlaneInfo(lastZ, tmpPlane);
							}	
						}
						continue;
					}
					else {
						for (var planeIndex1 in planeLine) {
							var plane1:PlaneInfo = planeLine[planeIndex1];
							var p1x:number = plane1.p1;
							var p1y:number = plane1.p2;
							var p1w:number = plane1.width;
							var p1h:number = plane1.height;
							var p1c:number = plane1.colorIndex;
							
							for (var planeIndex2 in planeNextLine) {
								var plane2:PlaneInfo = planeNextLine[planeIndex2];
								var p2x:number = plane2.p1;
								var p2y:number = plane2.p2;
								var p2w:number = plane2.width;
								var p2h:number = plane2.height;
								var p2c:number = plane2.colorIndex;
								//如果第二行的当前块的坐标已经大于待比较的块的坐标，那么第二行之后的块就无需在和待比较的块进行比较
								if (p2x > p1x) {
									break;
								}
								//按照开始坐标，宽度，颜色进行比较
								if (p1x != p2x || ( p1y + 1) != p2y || p1w != p2w || p1c != p2c) {
									continue;
								}
								else {
									var keyPlane:string = p1x + "," + p1y;
									//上一行的已经加入到合并数组comLine之中
									if (plane1.isCover) {
										var keyPlane:string = p1x + "," + p1y;
										var keyCom:string = keyMap[keyPlane];
										comLine[keyCom].addHeight(1);
										plane2.isCover = true;
										//建立key值的映射
										var keyPlane2:string = p2x + "," + p2y;
										keyMap[keyPlane2] = keyCom;
										//后面的不会再和plane1匹配了
										break;
									}
									else {
										plane1.isCover = true;
										plane2.isCover = true;
										var newComPlane:PlaneInfo = new PlaneInfo(p1x, p1y, p2w, p1h + p2h, p2c);
										//将该合并的plane加入到comLine中
										comLine[keyPlane] = newComPlane;
										//建立key值的映射
										keyMap[keyPlane] = keyPlane;
										var keyPlane2:string = p2x + "," + p2y;
										keyMap[keyPlane2] = keyPlane;
										//后面的不会再和plane1匹配了
										break;
									}
								}
							}
							//如果转了一圈循环，自己没有被合并那就孤零零进入最终的结果吧
							if (!plane1.isCover) {
								zCompressPlaneVector.addPlaneInfo(lastZ,plane1);
							}
						}
						//如果转了一大圈planeNextLine的plane没有被选中则需要单独处理
						for (var planeNextIndex in planeNextLine) {
							var planeNext:PlaneInfo = planeNextLine[planeNextIndex]; 
							if (!planeNext.isCover) {
								zCompressPlaneVector.addPlaneInfo(lastZ,planeNext);
							}
						}
						planeLine = planeNextLine;
						
					}
					
				}
				//遍历合并的plane
				for (var comPlane in comLine) {
					var planeInfo:PlaneInfo = comLine[comPlane];
					//放置到最终结果中
					zCompressPlaneVector.addPlaneInfo(lastZ,planeInfo);
				}	
			}
			//return zCompressPlaneVector;

		}
		/**
		 * @param	vec
		 * @param	orientation:up为true,down为false.
		 */
		private _combineByYAxis( vec:any[] , orientation:boolean, yResult:CompressPlaneVector):void {
			//建立一个映射的map
			var keyMap:string[] = [];
			var yCompressPlaneVector:CompressPlaneVector = yResult;
			for (var vecYindex in vec) {
				var lastY:number = parseInt(vecYindex);
				if (orientation) {
					lastY += 1;
				}
				//每一次沿着Y轴取一个面
				var vecOneY:CubeInfo[] = vec[vecYindex];
				vecOneY.sort();
				
				//将cube按照X分配到数组之中
				var vecOneYbyX:any[] = [];
				var countOneY:number = vecOneY.length;
				for (var i = 0; i < countOneY; i++ ) {
					var cube:CubeInfo = vecOneY[i];
					var cx:number = cube.x;
					//正面不可见,直接返回
					if (orientation) {
						yCompressPlaneVector.face = 2;
						if (cube.topVBIndex == -1) {
							continue;
						}
					}
					else {
						yCompressPlaneVector.face = 3;
						if (cube.downVBIndex == -1) {
							continue;
						}
					}
					if (vecOneYbyX[cx] == null) {
						var vecCubeX:CubeInfo[] = [];
						vecOneYbyX[cx] = vecCubeX;
					}
					vecOneYbyX[cx].push(cube);
				}
				
				//合并一行(y)
				var planeByX:any[] = [];
				var xCount:number = 0;
				for (var xIndex in vecOneYbyX) {
					//取出一行
					var cubeOneLine:CubeInfo[] = vecOneYbyX[xIndex];
					//根据z值进行排序
					cubeOneLine.sort(this._sortCubeByZ);
					//存储一行之后合并之后的色块
					var planeLine:PlaneInfo[] = [];
					var plane:PlaneInfo = new PlaneInfo(0, 0, 0, 0, 0);
					for (var cubeIndex in cubeOneLine) {
						var cubeX:CubeInfo = cubeOneLine[cubeIndex];
						var x:number = cubeX.x;
						var z:number = cubeX.z;
						var cColorIndex:number = cubeX.color;
						if (plane.width == 0) {//这个PlaneInfo是新的	
							plane.setValue(x, z, 1, 1, cColorIndex);	
							planeLine.push(plane);
						}
						else {
							if ((plane.p2 + plane.width) == cubeX.z && plane.colorIndex == cColorIndex) {
								plane.addWidth(1);
							}
							else {
								//合并好的存储起来
								var planeCom:PlaneInfo = new PlaneInfo(plane.p1, plane.p2, plane.width, plane.height, plane.colorIndex);
								planeLine.push(planeCom);
								//重置plane
								plane.setValue(x, z, 1, 1, cColorIndex);	
							}
						}
					}	
					planeByX[xCount++] = planeLine;
				}
				
				//合并已经整理好的行
				var comLine:PlaneInfo[] = [];
				var planeLine:PlaneInfo[] = null;
				var planeNextLine:PlaneInfo[];
				for (var lineXIndex in planeByX) {
					planeNextLine = planeByX[lineXIndex];
					if (planeLine == null) {
						planeLine = planeNextLine;
						//如果当前数组中只有一个PlaneInfo
						if (planeByX.length == 1) {
							for (var planeindex in planeLine) {
								var tmpPlane:PlaneInfo = planeLine[planeindex];
								yCompressPlaneVector.addPlaneInfo(lastY, tmpPlane);
							}	
						}
						continue;
					}
					else {
						for (var planeIndeZ1 in planeLine) {
							var plane1:PlaneInfo = planeLine[planeIndeZ1];
							var p1x:number = plane1.p1;
							var p1z:number = plane1.p2;
							var p1w:number = plane1.width;
							var p1h:number = plane1.height;
							var p1c:number = plane1.colorIndex;
							
							for (var planeIndeZ2 in planeNextLine) {
								var plane2:PlaneInfo = planeNextLine[planeIndeZ2];
								var p2x:number = plane2.p1;
								var p2z:number = plane2.p2;
								var p2w:number = plane2.width;
								var p2h:number = plane2.height;
								var p2c:number = plane2.colorIndex;
								//如果第二行的当前块的坐标已经大于待比较的块的坐标，那么第二行之后的块就无需在和待比较的块进行比较
								if (p2z > p1z) {
									break;
								}
								if (p1z != p2z ||( p1x+1) != p2x || p1w != p2w || p1c != p2c) {
									continue;
								}
								else {
									var keyPlane:string = p1x + "," + p1z;
									//上一行的已经加入到合并数组comLine之中
									if (plane1.isCover) {
										var keyCom:string = keyMap[keyPlane];
										comLine[keyCom].addHeight(1);
										plane2.isCover = true;
										var keyPlane2:string = p2x + "," + p2z;
										keyMap[keyPlane2] = keyCom;
										//后面的不会再和plane1匹配了
										break;
									}
									else {
										plane1.isCover = true;
										plane2.isCover = true;
										var newComPlane:PlaneInfo = new PlaneInfo(p1x, p1z, p2w, p1h + p2h, p2c);
										//将该合并的plane加入到comLine中
										comLine[keyPlane] = newComPlane;
										//建立key值的映射
										keyMap[keyPlane] = keyPlane;
										var keyPlane2:string = p2x + "," + p2z;
										keyMap[keyPlane2] = keyPlane;
										//后面的不会再和plane1匹配了
										break;
									}
								}
							}
							//如果转了一圈循环，自己没有被合并那就孤零零进入最终的结果吧
							if (!plane1.isCover) {
								yCompressPlaneVector.addPlaneInfo(lastY,plane1);
							}	
						}
						//如果转了一大圈planeNextLine的plane没有被选中则需要单独处理
						for (var planeNextIndex in planeNextLine) {
							var planeNext:PlaneInfo = planeNextLine[planeNextIndex]; 
							if (!planeNext.isCover) {
								yCompressPlaneVector.addPlaneInfo(lastY,planeNext);
							}
						}
						planeLine = planeNextLine;	
					}
				}

				for (var comPlane in comLine) {
					//如果是背面y坐标需要减去1
					var planeInfo:PlaneInfo = comLine[comPlane];
					yCompressPlaneVector.addPlaneInfo(lastY,planeInfo);
				}	
			}
			//return yCompressPlaneVector;
		}
			
		/**
		 * @param	vec
		 * @param	orientation:left为true,right为false.
		 */	
		private _combineByXAxis( vec:any[] , orientation:boolean, xResult:CompressPlaneVector):void {
			//建立一个映射的map
			var keyMap:string[] = [];
			var xCompressPlaneVector:CompressPlaneVector = xResult;
			for (var vecXindex in vec) {
				var lastX:number = parseInt(vecXindex);
				if (!orientation) {
					lastX += 1;
				}
				//每一次沿着X轴取一个面
				var vecOneX:CubeInfo[] = vec[vecXindex];
				vecOneX.sort();
					
				//将cube按照Y分配到数组之中
				var vecOneXbyY:any[] = [];
				var countOneX:number = vecOneX.length;
				for (var i = 0; i < countOneX; i++ ) {
					var cube:CubeInfo = vecOneX[i];
					var cy:number = cube.y;
					//正面不可见,直接返回
					if (orientation) {
						xCompressPlaneVector.face = 4;
						if (cube.rightVBIndex == -1) {
							continue;
						}
					}
					else {
						xCompressPlaneVector.face = 5;
						if (cube.leftVBIndex == -1) {
							continue;
						}
					}
					if (vecOneXbyY[cy] == null) {
						var vecCubeY:CubeInfo[] = [];
						vecOneXbyY[cy] = vecCubeY;
					}
					vecOneXbyY[cy].push(cube);
				}
				
				//合并一行(y)
				var planeByY:any[] = [];
				var yCount:number = 0;
				for (var yIndex in vecOneXbyY) {
					var cubeOneLine:CubeInfo[] = vecOneXbyY[yIndex];
					//根据Z值进行排序
					cubeOneLine.sort(this._sortCubeByZ);
					
					//存储一行之后合并之后的色块
					var planeLine:PlaneInfo[] = [];
					var plane:PlaneInfo = new PlaneInfo(0, 0, 0, 0, 0);
					for (var cubeIndex in cubeOneLine) {
						var cubeX:CubeInfo = cubeOneLine[cubeIndex];
						var cy:number = cubeX.y;
						var cz:number = cubeX.z;
						var cColorIndex = cubeX.color;
						if (plane.width == 0) {//这个PlaneInfo是新的	
							plane.setValue(cy, cz, 1, 1, cColorIndex);	
							planeLine.push(plane);
						}
						else {
							if ((plane.p2 + plane.width) == cz && plane.colorIndex == cColorIndex) {
								plane.addWidth(1);	
							}
							else {
								//合并好的存储起来
								var planeCom:PlaneInfo = new PlaneInfo(plane.p1, plane.p2, plane.width, plane.height, plane.colorIndex);
								planeLine.push(planeCom);
								//重置plane
								plane.setValue(cy, cz, 1, 1, cColorIndex);	
							}
						}
					}
					
					planeByY[yCount++] = planeLine;
				}
				
				//合并已经整理好的行
				var comLine:PlaneInfo[] = [];
				var planeLine:PlaneInfo[] = null;
				var planeNextLine:PlaneInfo[];
				for (var lineYIndex in planeByY) {
					planeNextLine = planeByY[lineYIndex];
					if (planeLine == null) {
						planeLine = planeNextLine;
						//如果当前数组中只有一个PlaneInfo
						if (planeByY.length == 1) {
							for (var planeindez in planeLine) {
								var tmpPlane:PlaneInfo = planeLine[planeindez];
								xCompressPlaneVector.addPlaneInfo(lastX, tmpPlane);
							}	
						}
						continue;
					}
					else {
						for (var planeIndeZ1 in planeLine) {
							var plane1:PlaneInfo = planeLine[planeIndeZ1];
							var p1y:number = plane1.p1;
							var p1z:number = plane1.p2;
							var p1w:number = plane1.width;
							var p1h:number = plane1.height;
							var p1c:number = plane1.colorIndex;
							for (var planeIndeZ2 in planeNextLine) {
								var plane2:PlaneInfo = planeNextLine[planeIndeZ2];
								var p2y:number = plane2.p1;
								var p2z:number = plane2.p2;
								var p2w:number = plane2.width;
								var p2h:number = plane2.height;
								var p2c:number = plane2.colorIndex;
								if (p1z != p2z ||( p1y+1) != p2y || p1w != p2w || p1c != p2c) {
									continue;
								}
								else {
									var keyPlane:string = p1y + "," + p1z;
									//上一行的已经加入到合并数组comLine之中
									if (plane1.isCover) {
										var keyCom:string = keyMap[keyPlane];
										comLine[keyCom].addHeight(1);
										plane2.isCover = true;
										var keyPlane2:string = p2y + "," + p2z;
										keyMap[keyPlane2] = keyCom;
										//后面的不会再和plane1匹配
										break;
									}
									else {
										plane1.isCover = true;
										plane2.isCover = true;
										var newComPlane:PlaneInfo = new PlaneInfo(p1y, p1z, p2w, p1h + p2h, p2c);
										//将该合并的plane加入到comLine中
										comLine[keyPlane] = newComPlane;
										//建立key值的映射
										keyMap[keyPlane] = keyPlane;
										var keyPlane2:string = p2y + "," + p2z;
										keyMap[keyPlane2] = keyPlane;
										//后面的不会再和plane1匹配了
										break;
									}
								}
							}
							//如果转了一圈循环，自己没有被合并那就孤零零进入最终的结果吧
							if (!plane1.isCover) {
								xCompressPlaneVector.addPlaneInfo(lastX,plane1);
							}
						}
						//如果转了一大圈planeNextLine的plane没有被选中则需要单独处理
						for (var planeNextIndex in planeNextLine) {
							var planeNext:PlaneInfo = planeNextLine[planeNextIndex]; 
							if (!planeNext.isCover) {
								xCompressPlaneVector.addPlaneInfo(lastX,planeNext);
							}
						}
					}
					
				}
				for (var comPlane in comLine) {
					var planeInfo:PlaneInfo = comLine[comPlane];
					//如果是背面X坐标需要加1
					xCompressPlaneVector.addPlaneInfo(lastX,planeInfo);
				}	
			}
			//return xCompressPlaneVector; 
		}
		
		private _sortCubeByX(c1:CubeInfo, c2:CubeInfo):number {
			var i:number = 0;
			(c1.z > c2.z) && (i = 1);
			(c1.z < c2.z) && (i = -1);
			return i;
		}
		
		private _sortCubeByY(c1:CubeInfo, c2:CubeInfo):number {
			var i:number = 0;
			(c1.y > c2.y) && (i = 1);
			(c1.y < c2.y) && (i = -1);
			return i;
		}
		
		private _sortCubeByZ(c1:CubeInfo, c2:CubeInfo):number {
			var i:number = 0;
			(c1.z > c2.z) && (i = 1);
			(c1.z < c2.z) && (i = -1);
			return i;
		}
		
		private _sliceXYZBy32(x:number, y:number, z:number):string {
			var resultx:number = 0;
			var resulty:number = 0;
			var resultz:number = 0;
			if (x < 0) {
				x = -x;
				resultx = x >> 5;
				resultx = -resultx;
			}
			else {
				resultx = x >> 5;
			}
			if (y < 0) {
				y = -y;
				resulty = y >> 5;
				resulty = -resulty;
			}
			else {
				resulty = y >> 5;
			}
			if (z < 0) {
				z = -z;
				resultz = z >> 5;
				resultz = -resultz;
			}
			else {
				resultz = z >> 5;
			}
			
			var result:string =resultx + "," + resulty + "," + resultz;
			return result;	
		}
		
	}


