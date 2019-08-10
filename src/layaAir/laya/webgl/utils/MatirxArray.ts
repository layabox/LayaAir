export class MatirxArray {

    /**
     * 4*4矩阵数组相乘。
     * o=a*b;
     * @param	a 4*4矩阵数组。
     * @param	b 4*4矩阵数组。
     * @param	o 4*4矩阵数组。
     */
    //TODO:coverage
    static ArrayMul(a: any[], b: any[], o: any[]): void {
        if (!a) {
            MatirxArray.copyArray(b, o);
            return;
        }

        if (!b) {
            MatirxArray.copyArray(a, o);
            return;
        }

        var ai0: number, ai1: number, ai2: number, ai3: number;
        for (var i: number = 0; i < 4; i++) {
            ai0 = a[i];
            ai1 = a[i + 4];
            ai2 = a[i + 8];
            ai3 = a[i + 12];
            o[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
            o[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
            o[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
            o[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
        }
    }

    //TODO:coverage
    static copyArray(f: any[], t: any[]): void {
        if (!f) return;
        if (!t) return;
        for (var i: number = 0; i < f.length; i++) {
            t[i] = f[i];
        }
    }
}

