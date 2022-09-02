import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { BoundBox } from "laya/d3/math/BoundBox";
import { Color } from "laya/d3/math/Color";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";

/**
 * ...
 * @author
 */
export class Tool {
	private static transVertex0: Vector3 = new Vector3();
	private static transVertex1: Vector3 = new Vector3();
	private static transVertex2: Vector3 = new Vector3();
	private static corners: Vector3[] = [];
	static linearModel(sprite3D: Sprite3D, lineSprite3D: PixelLineSprite3D, color: Color): void {
		if (sprite3D instanceof MeshSprite3D) {
			var meshSprite3D: MeshSprite3D = <MeshSprite3D>sprite3D;
			var mesh: Mesh = meshSprite3D.meshFilter.sharedMesh;
			var positions: Array<Vector3> = [];
			mesh.getPositions(positions);
			var indices = mesh.getSubMesh(0).getIndices();

			for (var i: number = 0; i < indices.length; i += 3) {
				var vertex0: Vector3 = positions[indices[i]];
				var vertex1: Vector3 = positions[indices[i + 1]];
				var vertex2: Vector3 = positions[indices[i + 2]];
				Vector3.transformCoordinate(vertex0, meshSprite3D.transform.worldMatrix, this.transVertex0);
				Vector3.transformCoordinate(vertex1, meshSprite3D.transform.worldMatrix, this.transVertex1);
				Vector3.transformCoordinate(vertex2, meshSprite3D.transform.worldMatrix, this.transVertex2);
				lineSprite3D.addLine(this.transVertex0, this.transVertex1, color, color);
				lineSprite3D.addLine(this.transVertex1, this.transVertex2, color, color);
				lineSprite3D.addLine(this.transVertex2, this.transVertex0, color, color);
			}
		}

		for (var i: number = 0, n: number = sprite3D.numChildren; i < n; i++)
			Tool.linearModel((<Sprite3D>sprite3D.getChildAt(i)), lineSprite3D, color);
	}

	static DrawBoundingBox(sprite3D: Sprite3D, sprite: Sprite3D, color: Color): void {
		var boundingBox: BoundBox = (<MeshSprite3D>sprite3D).meshRenderer.bounds._getBoundBox();
		boundingBox.getCorners(Tool.corners);
		/*lineSprite3D.addLine(corners[0], corners[1], Color.RED, Color.RED);
		lineSprite3D.addLine(corners[1], corners[2], Color.RED, Color.RED);
		lineSprite3D.addLine(corners[2], corners[3], Color.RED, Color.RED);
		lineSprite3D.addLine(corners[3], corners[0], Color.RED, Color.RED);
		lineSprite3D.addLine(corners[4], corners[5], Color.RED, Color.RED);
		lineSprite3D.addLine(corners[5], corners[6], Color.RED, Color.RED);
		lineSprite3D.addLine(corners[6], corners[7], Color.RED, Color.RED);
		lineSprite3D.addLine(corners[7], corners[4], Color.RED, Color.RED);
		lineSprite3D.addLine(corners[0], corners[4], Color.RED, Color.RED);
		lineSprite3D.addLine(corners[1], corners[5], Color.RED, Color.RED);
		lineSprite3D.addLine(corners[2], corners[6], Color.RED, Color.RED);
		lineSprite3D.addLine(corners[3], corners[7], Color.RED, Color.RED);*/

		var rotate: Vector3 = new Vector3(0, 0, 90);
		Tool.DrawTwelveLines(Tool.corners[0], Tool.corners[1], rotate, sprite);
		rotate.setValue(0, 0, 0);
		Tool.DrawTwelveLines(Tool.corners[1], Tool.corners[2], rotate, sprite);
		rotate.setValue(0, 0, 90);
		Tool.DrawTwelveLines(Tool.corners[2], Tool.corners[3], rotate, sprite);
		rotate.setValue(0, 0, 0);
		Tool.DrawTwelveLines(Tool.corners[3], Tool.corners[0], rotate, sprite);

		rotate.setValue(0, 0, 90);
		Tool.DrawTwelveLines(Tool.corners[4], Tool.corners[5], rotate, sprite);
		rotate.setValue(0, 0, 0);
		Tool.DrawTwelveLines(Tool.corners[5], Tool.corners[6], rotate, sprite);
		rotate.setValue(0, 0, 90);
		Tool.DrawTwelveLines(Tool.corners[6], Tool.corners[7], rotate, sprite);
		rotate.setValue(0, 0, 0);
		Tool.DrawTwelveLines(Tool.corners[7], Tool.corners[4], rotate, sprite);

		rotate.setValue(90, 0, 0);
		Tool.DrawTwelveLines(Tool.corners[0], Tool.corners[4], rotate, sprite);
		rotate.setValue(90, 0, 0);
		Tool.DrawTwelveLines(Tool.corners[1], Tool.corners[5], rotate, sprite);

		rotate.setValue(90, 0, 0);
		Tool.DrawTwelveLines(Tool.corners[2], Tool.corners[6], rotate, sprite);
		rotate.setValue(90, 0, 0);
		Tool.DrawTwelveLines(Tool.corners[3], Tool.corners[7], rotate, sprite);



		/*for (var i:int = 0; i < 12; i++ ){
			
		}
		var length:Number = Math.abs(corners[0].x - corners[1].x);
		var cylinder:MeshSprite3D = scene.addChild(new MeshSprite3D(PrimitiveMesh.createCylinder(0.004, length, 8))) as MeshSprite3D;
		cylinder.transform.rotate(new Vector3(0, 0, 90), false, false);
		var cylPos:Vector3 = cylinder.transform.position;
		var x:Number = corners[0].x + corners[1].x; 
		var y:Number = corners[0].y + corners[1].y;
		var z:Number = corners[0].z + corners[1].z;
		cylPos.setValue(x / 2, y / 2, z / 2);
		cylinder.transform.position = cylPos;*/


	}
	private static DrawTwelveLines(start: Vector3, end: Vector3, rotate: Vector3, sprite3D: Sprite3D): void {
		var length: number = Vector3.distance(start, end);
		var cylinder: MeshSprite3D = (<MeshSprite3D>sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCylinder(0.004, length, 3))));
		cylinder.transform.rotate(rotate, true, false);
		var cylPos: Vector3 = cylinder.transform.position;
		var x: number = start.x + end.x;
		var y: number = start.y + end.y;
		var z: number = start.z + end.z;
		cylPos.setValue(x / 2, y / 2, z / 2);
		cylinder.transform.position = cylPos;
	}

	constructor() {

	}

}


