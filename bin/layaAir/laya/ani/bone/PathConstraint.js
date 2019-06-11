import { Matrix } from "laya/maths/Matrix";
/**
 * @private
 * 路径作用器
 * 1，生成根据骨骼计算控制点
 * 2，根据控制点生成路径，并计算路径上的节点
 * 3，根据节点，重新调整骨骼位置
 */
export class PathConstraint {
    constructor(data, bones) {
        this._debugKey = false;
        this._segments = [];
        this._curves = [];
        this.data = data;
        this.position = data.position;
        this.spacing = data.spacing;
        this.rotateMix = data.rotateMix;
        this.translateMix = data.translateMix;
        this.bones = [];
        var tBoneIds = this.data.bones;
        for (var i = 0, n = tBoneIds.length; i < n; i++) {
            this.bones.push(bones[tBoneIds[i]]);
        }
    }
    /**
     * 计算骨骼在路径上的节点
     * @param	boneSlot
     * @param	boneMatrixArray
     * @param	graphics
     */
    //TODO:coverage
    apply(boneList, graphics) {
        if (!this.target)
            return;
        var tTranslateMix = this.translateMix;
        var tRotateMix = this.translateMix;
        var tTranslate = tTranslateMix > 0;
        var tRotate = tRotateMix > 0;
        var tSpacingMode = this.data.spacingMode;
        var tLengthSpacing = tSpacingMode == "length";
        var tRotateMode = this.data.rotateMode;
        var tTangents = tRotateMode == "tangent";
        var tScale = tRotateMode == "chainScale";
        var lengths = [];
        var boneCount = this.bones.length;
        var spacesCount = tTangents ? boneCount : boneCount + 1;
        var spaces = [];
        this._spaces = spaces;
        spaces[0] = this.position;
        var spacing = this.spacing;
        if (tScale || tLengthSpacing) {
            for (var i = 0, n = spacesCount - 1; i < n;) {
                var bone = this.bones[i];
                var length = bone.length;
                //var x:Number = length * bone.transform.getMatrix().a;
                //var y:Number = length * bone.transform.getMatrix().c;
                var x = length * bone.resultMatrix.a;
                var y = length * bone.resultMatrix.b;
                length = Math.sqrt(x * x + y * y);
                if (tScale)
                    lengths[i] = length;
                spaces[++i] = tLengthSpacing ? Math.max(0, length + spacing) : spacing;
            }
        }
        else {
            for (i = 1; i < spacesCount; i++) {
                spaces[i] = spacing;
            }
        }
        var positions = this.computeWorldPositions(this.target, boneList, graphics, spacesCount, tTangents, this.data.positionMode == "percent", tSpacingMode == "percent");
        if (this._debugKey) {
            for (i = 0; i < positions.length; i++) {
                graphics.drawCircle(positions[i++], positions[i++], 5, "#00ff00");
            }
            var tLinePos = [];
            for (i = 0; i < positions.length; i++) {
                tLinePos.push(positions[i++], positions[i++]);
            }
            graphics.drawLines(0, 0, tLinePos, "#ff0000");
        }
        var skeletonX;
        var skeletonY;
        var boneX = positions[0];
        var boneY = positions[1];
        var offsetRotation = this.data.offsetRotation;
        var tip = tRotateMode == "chain" && offsetRotation == 0;
        var p;
        for (i = 0, p = 3; i < boneCount; i++, p += 3) {
            bone = this.bones[i];
            bone.resultMatrix.tx += (boneX - bone.resultMatrix.tx) * tTranslateMix;
            bone.resultMatrix.ty += (boneY - bone.resultMatrix.ty) * tTranslateMix;
            x = positions[p];
            y = positions[p + 1];
            var dx = x - boneX, dy = y - boneY;
            if (tScale) {
                length = lengths[i];
                if (length != 0) {
                    var s = (Math.sqrt(dx * dx + dy * dy) / length - 1) * tRotateMix + 1;
                    bone.resultMatrix.a *= s;
                    bone.resultMatrix.c *= s;
                }
            }
            boneX = x;
            boneY = y;
            if (tRotate) {
                var a = bone.resultMatrix.a;
                //var b:Number = bone.resultMatrix.b;
                //var c:Number = bone.resultMatrix.c;
                var b = bone.resultMatrix.c;
                var c = bone.resultMatrix.b;
                var d = bone.resultMatrix.d;
                var r;
                var cos;
                var sin;
                if (tTangents) {
                    r = positions[p - 1];
                }
                else if (spaces[i + 1] == 0) {
                    r = positions[p + 2];
                }
                else {
                    r = Math.atan2(dy, dx);
                }
                r -= Math.atan2(c, a) - offsetRotation / 180 * Math.PI;
                if (tip) {
                    cos = Math.cos(r);
                    sin = Math.sin(r);
                    length = bone.length;
                    boneX += (length * (cos * a - sin * c) - dx) * tRotateMix;
                    boneY += (length * (sin * a + cos * c) - dy) * tRotateMix;
                }
                if (r > Math.PI) {
                    r -= (Math.PI * 2);
                }
                else if (r < -Math.PI) {
                    r += (Math.PI * 2);
                }
                r *= tRotateMix;
                cos = Math.cos(r);
                sin = Math.sin(r);
                bone.resultMatrix.a = cos * a - sin * c;
                bone.resultMatrix.c = cos * b - sin * d;
                bone.resultMatrix.b = sin * a + cos * c;
                bone.resultMatrix.d = sin * b + cos * d;
            }
        }
    }
    /**
     * 计算顶点的世界坐标
     * @param	boneSlot
     * @param	boneList
     * @param	start
     * @param	count
     * @param	worldVertices
     * @param	offset
     */
    //TODO:coverage
    computeWorldVertices2(boneSlot, boneList, start, count, worldVertices, offset) {
        var tBones = boneSlot.currDisplayData.bones;
        var tWeights = boneSlot.currDisplayData.weights;
        var tTriangles = boneSlot.currDisplayData.triangles;
        var tMatrix;
        var i = 0;
        var v = 0;
        var skip = 0;
        var n = 0;
        var w = 0;
        var b = 0;
        var wx = 0;
        var wy = 0;
        var vx = 0;
        var vy = 0;
        var bone;
        var len;
        //if (!tTriangles) tTriangles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (tBones == null) {
            if (!tTriangles)
                tTriangles = tWeights;
            if (boneSlot.deformData)
                tTriangles = boneSlot.deformData;
            var parentName;
            parentName = boneSlot.parent;
            if (boneList) {
                len = boneList.length;
                for (i = 0; i < len; i++) {
                    if (boneList[i].name == parentName) {
                        bone = boneList[i];
                        break;
                    }
                }
            }
            var tBoneMt;
            if (bone) {
                tBoneMt = bone.resultMatrix;
            }
            //bone = boneSlot.parent;
            if (!tBoneMt)
                tBoneMt = PathConstraint._tempMt;
            var x = tBoneMt.tx;
            var y = tBoneMt.ty;
            var a = tBoneMt.a, bb = tBoneMt.b, c = tBoneMt.c, d = tBoneMt.d;
            if (bone)
                d *= bone.d;
            for (v = start, w = offset; w < count; v += 2, w += 2) {
                vx = tTriangles[v], vy = tTriangles[v + 1];
                worldVertices[w] = vx * a + vy * bb + x;
                worldVertices[w + 1] = -(vx * c + vy * d + y);
            }
            return;
        }
        for (i = 0; i < start; i += 2) {
            n = tBones[v];
            v += n + 1;
            skip += n;
        }
        var skeletonBones = boneList;
        for (w = offset, b = skip * 3; w < count; w += 2) {
            wx = 0, wy = 0;
            n = tBones[v++];
            n += v;
            for (; v < n; v++, b += 3) {
                tMatrix = skeletonBones[tBones[v]].resultMatrix;
                vx = tWeights[b];
                vy = tWeights[b + 1];
                var weight = tWeights[b + 2];
                wx += (vx * tMatrix.a + vy * tMatrix.c + tMatrix.tx) * weight;
                wy += (vx * tMatrix.b + vy * tMatrix.d + tMatrix.ty) * weight;
            }
            worldVertices[w] = wx;
            worldVertices[w + 1] = wy;
        }
    }
    /**
     * 计算路径上的节点
     * @param	boneSlot
     * @param	boneList
     * @param	graphics
     * @param	spacesCount
     * @param	tangents
     * @param	percentPosition
     * @param	percentSpacing
     * @return
     */
    //TODO:coverage
    computeWorldPositions(boneSlot, boneList, graphics, spacesCount, tangents, percentPosition, percentSpacing) {
        var tBones = boneSlot.currDisplayData.bones;
        var tWeights = boneSlot.currDisplayData.weights;
        var tTriangles = boneSlot.currDisplayData.triangles;
        var tRx = 0;
        var tRy = 0;
        var nn = 0;
        var tMatrix;
        var tX;
        var tY;
        var tB = 0;
        var tWeight = 0;
        var tVertices = [];
        var i = 0, j = 0, n = 0;
        var verticesLength = boneSlot.currDisplayData.verLen;
        var target = boneSlot;
        var position = this.position;
        var spaces = this._spaces;
        var world = [];
        var out = [];
        var closed = false;
        var curveCount = verticesLength / 6;
        var prevCurve = -1;
        var pathLength;
        var o, curve;
        var p;
        var space;
        var prev;
        var length;
        if (!true) { //path.constantSpeed) {
            var lengths = boneSlot.currDisplayData.lengths;
            curveCount -= closed ? 1 : 2;
            pathLength = lengths[curveCount];
            if (percentPosition)
                position *= pathLength;
            if (percentSpacing) {
                for (i = 0; i < spacesCount; i++)
                    spaces[i] *= pathLength;
            }
            world.length = 8;
            //world = this._world;
            for (i = 0, o = 0, curve = 0; i < spacesCount; i++, o += 3) {
                space = spaces[i];
                position += space;
                p = position;
                if (closed) {
                    p %= pathLength;
                    if (p < 0)
                        p += pathLength;
                    curve = 0;
                }
                else if (p < 0) {
                    if (prevCurve != PathConstraint.BEFORE) {
                        prevCurve = PathConstraint.BEFORE;
                        this.computeWorldVertices2(target, boneList, 2, 4, world, 0);
                    }
                    this.addBeforePosition(p, world, 0, out, o);
                    continue;
                }
                else if (p > pathLength) {
                    if (prevCurve != PathConstraint.AFTER) {
                        prevCurve = PathConstraint.AFTER;
                        this.computeWorldVertices2(target, boneList, verticesLength - 6, 4, world, 0);
                    }
                    this.addAfterPosition(p - pathLength, world, 0, out, o);
                    continue;
                }
                // Determine curve containing position.
                for (;; curve++) {
                    length = lengths[curve];
                    if (p > length)
                        continue;
                    if (curve == 0)
                        p /= length;
                    else {
                        prev = lengths[curve - 1];
                        p = (p - prev) / (length - prev);
                    }
                    break;
                }
                if (curve != prevCurve) {
                    prevCurve = curve;
                    if (closed && curve == curveCount) {
                        this.computeWorldVertices2(target, boneList, verticesLength - 4, 4, world, 0);
                        this.computeWorldVertices2(target, boneList, 0, 4, world, 4);
                    }
                    else
                        this.computeWorldVertices2(target, boneList, curve * 6 + 2, 8, world, 0);
                }
                this.addCurvePosition(p, world[0], world[1], world[2], world[3], world[4], world[5], world[6], world[7], out, o, tangents || (i > 0 && space == 0));
            }
            return out;
        }
        // World vertices.
        if (closed) {
            verticesLength += 2;
            world[verticesLength - 2] = world[0];
            world[verticesLength - 1] = world[1];
        }
        else {
            curveCount--;
            verticesLength -= 4;
            this.computeWorldVertices2(boneSlot, boneList, 2, verticesLength, tVertices, 0);
            if (this._debugKey) {
                for (i = 0; i < tVertices.length;) {
                    graphics.drawCircle(tVertices[i++], tVertices[i++], 10, "#ff0000");
                }
            }
            world = tVertices;
        }
        // Curve lengths.
        this._curves.length = curveCount;
        var curves = this._curves;
        pathLength = 0;
        var x1 = world[0], y1 = world[1], cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0, x2 = 0, y2 = 0;
        var tmpx, tmpy, dddfx, dddfy, ddfx, ddfy, dfx, dfy;
        var w;
        for (i = 0, w = 2; i < curveCount; i++, w += 6) {
            cx1 = world[w];
            cy1 = world[w + 1];
            cx2 = world[w + 2];
            cy2 = world[w + 3];
            x2 = world[w + 4];
            y2 = world[w + 5];
            tmpx = (x1 - cx1 * 2 + cx2) * 0.1875;
            tmpy = (y1 - cy1 * 2 + cy2) * 0.1875;
            dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.09375;
            dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.09375;
            ddfx = tmpx * 2 + dddfx;
            ddfy = tmpy * 2 + dddfy;
            dfx = (cx1 - x1) * 0.75 + tmpx + dddfx * 0.16666667;
            dfy = (cy1 - y1) * 0.75 + tmpy + dddfy * 0.16666667;
            pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
            dfx += ddfx;
            dfy += ddfy;
            ddfx += dddfx;
            ddfy += dddfy;
            pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
            dfx += ddfx;
            dfy += ddfy;
            pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
            dfx += ddfx + dddfx;
            dfy += ddfy + dddfy;
            pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
            curves[i] = pathLength;
            x1 = x2;
            y1 = y2;
        }
        if (percentPosition)
            position *= pathLength;
        if (percentSpacing) {
            for (i = 0; i < spacesCount; i++)
                spaces[i] *= pathLength;
        }
        var segments = this._segments;
        var curveLength = 0;
        var segment;
        for (i = 0, o = 0, curve = 0, segment = 0; i < spacesCount; i++, o += 3) {
            space = spaces[i];
            position += space;
            p = position;
            if (closed) {
                p %= pathLength;
                if (p < 0)
                    p += pathLength;
                curve = 0;
            }
            else if (p < 0) {
                this.addBeforePosition(p, world, 0, out, o);
                continue;
            }
            else if (p > pathLength) {
                this.addAfterPosition(p - pathLength, world, verticesLength - 4, out, o);
                continue;
            }
            // Determine curve containing position.
            for (;; curve++) {
                length = curves[curve];
                if (p > length)
                    continue;
                if (curve == 0)
                    p /= length;
                else {
                    prev = curves[curve - 1];
                    p = (p - prev) / (length - prev);
                }
                break;
            }
            // Curve segment lengths.
            if (curve != prevCurve) {
                prevCurve = curve;
                var ii = curve * 6;
                x1 = world[ii];
                y1 = world[ii + 1];
                cx1 = world[ii + 2];
                cy1 = world[ii + 3];
                cx2 = world[ii + 4];
                cy2 = world[ii + 5];
                x2 = world[ii + 6];
                y2 = world[ii + 7];
                tmpx = (x1 - cx1 * 2 + cx2) * 0.03;
                tmpy = (y1 - cy1 * 2 + cy2) * 0.03;
                dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.006;
                dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.006;
                ddfx = tmpx * 2 + dddfx;
                ddfy = tmpy * 2 + dddfy;
                dfx = (cx1 - x1) * 0.3 + tmpx + dddfx * 0.16666667;
                dfy = (cy1 - y1) * 0.3 + tmpy + dddfy * 0.16666667;
                curveLength = Math.sqrt(dfx * dfx + dfy * dfy);
                segments[0] = curveLength;
                for (ii = 1; ii < 8; ii++) {
                    dfx += ddfx;
                    dfy += ddfy;
                    ddfx += dddfx;
                    ddfy += dddfy;
                    curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[ii] = curveLength;
                }
                dfx += ddfx;
                dfy += ddfy;
                curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                segments[8] = curveLength;
                dfx += ddfx + dddfx;
                dfy += ddfy + dddfy;
                curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                segments[9] = curveLength;
                segment = 0;
            }
            // Weight by segment length.
            p *= curveLength;
            for (;; segment++) {
                length = segments[segment];
                if (p > length)
                    continue;
                if (segment == 0)
                    p /= length;
                else {
                    prev = segments[segment - 1];
                    p = segment + (p - prev) / (length - prev);
                }
                break;
            }
            this.addCurvePosition(p * 0.1, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents || (i > 0 && space == 0));
        }
        return out;
    }
    //TODO:coverage
    addBeforePosition(p, temp, i, out, o) {
        var x1 = temp[i], y1 = temp[i + 1], dx = temp[i + 2] - x1, dy = temp[i + 3] - y1, r = Math.atan2(dy, dx);
        out[o] = x1 + p * Math.cos(r);
        out[o + 1] = y1 + p * Math.sin(r);
        out[o + 2] = r;
    }
    //TODO:coverage
    addAfterPosition(p, temp, i, out, o) {
        var x1 = temp[i + 2], y1 = temp[i + 3], dx = x1 - temp[i], dy = y1 - temp[i + 1], r = Math.atan2(dy, dx);
        out[o] = x1 + p * Math.cos(r);
        out[o + 1] = y1 + p * Math.sin(r);
        out[o + 2] = r;
    }
    //TODO:coverage
    addCurvePosition(p, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents) {
        if (p == 0)
            p = 0.0001;
        var tt = p * p, ttt = tt * p, u = 1 - p, uu = u * u, uuu = uu * u;
        var ut = u * p, ut3 = ut * 3, uut3 = u * ut3, utt3 = ut3 * p;
        var x = x1 * uuu + cx1 * uut3 + cx2 * utt3 + x2 * ttt, y = y1 * uuu + cy1 * uut3 + cy2 * utt3 + y2 * ttt;
        out[o] = x;
        out[o + 1] = y;
        if (tangents) {
            out[o + 2] = Math.atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
        }
        else {
            out[o + 2] = 0;
        }
    }
}
PathConstraint.NONE = -1;
PathConstraint.BEFORE = -2;
PathConstraint.AFTER = -3;
PathConstraint._tempMt = new Matrix();
