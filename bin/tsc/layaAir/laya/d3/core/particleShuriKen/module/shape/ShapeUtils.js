/**
 * ...
 * @author ...
 */
export class ShapeUtils {
    static _randomPointUnitArcCircle(arc, out, rand = null) {
        var angle;
        if (rand)
            angle = rand.getFloat() * arc;
        else
            angle = Math.random() * arc;
        out.x = Math.cos(angle);
        out.y = Math.sin(angle);
    }
    static _randomPointInsideUnitArcCircle(arc, out, rand = null) {
        ShapeUtils._randomPointUnitArcCircle(arc, out, rand);
        var range;
        if (rand)
            range = Math.pow(rand.getFloat(), 1.0 / 2.0);
        else
            range = Math.pow(Math.random(), 1.0 / 2.0);
        out.x = out.x * range;
        out.y = out.y * range;
    }
    static _randomPointUnitCircle(out, rand = null) {
        var angle;
        if (rand)
            angle = rand.getFloat() * Math.PI * 2;
        else
            angle = Math.random() * Math.PI * 2;
        out.x = Math.cos(angle);
        out.y = Math.sin(angle);
    }
    static _randomPointInsideUnitCircle(out, rand = null) {
        ShapeUtils._randomPointUnitCircle(out);
        var range;
        if (rand)
            range = Math.pow(rand.getFloat(), 1.0 / 2.0);
        else
            range = Math.pow(Math.random(), 1.0 / 2.0);
        out.x = out.x * range;
        out.y = out.y * range;
    }
    static _randomPointUnitSphere(out, rand = null) {
        var z;
        var a;
        if (rand) {
            z = out.z = rand.getFloat() * 2 - 1.0;
            a = rand.getFloat() * Math.PI * 2;
        }
        else {
            z = out.z = Math.random() * 2 - 1.0;
            a = Math.random() * Math.PI * 2;
        }
        var r = Math.sqrt(1.0 - z * z);
        out.x = r * Math.cos(a);
        out.y = r * Math.sin(a);
    }
    static _randomPointInsideUnitSphere(out, rand = null) {
        ;
        ShapeUtils._randomPointUnitSphere(out);
        var range;
        if (rand)
            range = Math.pow(rand.getFloat(), 1.0 / 3.0);
        else
            range = Math.pow(Math.random(), 1.0 / 3.0);
        out.x = out.x * range;
        out.y = out.y * range;
        out.z = out.z * range;
    }
    static _randomPointInsideHalfUnitBox(out, rand = null) {
        if (rand) {
            out.x = (rand.getFloat() - 0.5);
            out.y = (rand.getFloat() - 0.5);
            out.z = (rand.getFloat() - 0.5);
        }
        else {
            out.x = (Math.random() - 0.5);
            out.y = (Math.random() - 0.5);
            out.z = (Math.random() - 0.5);
        }
    }
    constructor() {
    }
}
