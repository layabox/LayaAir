import path from 'path';
import spawn from 'cross-spawn';

export function shellExec(command, args, fetchOutput) {
    let ret = spawn.sync(command, args, fetchOutput ? null : { stdio: 'inherit' });
    if (ret.status != 0) {
        console.error(ret.error);
        process.exit(1);
    }

    if (fetchOutput)
        return ret.output?.[1]?.toString().trim();
}

export function onRollupWarn(ignoreCircularDependencyWarnings) {
    return function (warning) {
        let msg = warning.message;
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
            if (ignoreCircularDependencyWarnings)
                return;

            let arr = msg.split("->");
            arr = arr.map(e => {
                e = e.trim();
                return path.basename(e, path.extname(e));
            });
            msg = arr.join(" -> ");
            msg = "(C_D) " + msg;
            console.warn(msg);
        } else
            console.warn("rollup: " + warning.message);
    }
}