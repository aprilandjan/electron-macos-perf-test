const {spawn} = require('child_process');

exports.spawnTest = function spawnTest(log) {
    for (let i = 0; i < 10; i++) {
        log(`${i}: spawning "ls" process`);
        const start = Date.now();
        spawn('ls', ['.']).once('exit', () => {
            log(`${i}: ls exited in ${Date.now() - start} ms`);
        });
        log(`${i}: spawn launched in ${Date.now() - start} ms`);
    }
};

function sum(...args) {
    let r = 0;
    for(let i = 0; i < args.length; i++) {
        r += args[i];
    }
    return r;
}


exports.spawnTestAvg = function spawnTestAvg(log) {
    const pList = [];
    const tExecList = [];
    const size = 10;
    for (let i = 0; i < size; i++) {
        // log(`${i}: spawning "ls" process`);
        const p = new Promise((resolve) => {
            const start = Date.now();
            spawn('ls', ['.']).once('exit', () => {
                // log(`${i}: ls exited in ${Date.now() - start} ms`);
                resolve(Date.now() - start);
            });
            // log(`${i}: spawn launched in ${Date.now() - start} ms`);
            tExecList.push(Date.now() - start);
        })
        pList.push(p);
    }

    Promise.all(pList).then((tExitList) => {
        const avgExit = sum(...tExitList) / size;
        const avgExec = sum(...tExecList) / size;
        log(`avg exec time: ${avgExec}ms, avg exit time: ${avgExit}ms`);
    });
};


exports.spawnExecTime = function spawnExecTime() {
    const pList = [];
    const tExecList = [];
    const size = 10;
    for (let i = 0; i < size; i++) {
        const p = new Promise((resolve) => {
            const start = Date.now();
            spawn('ls', ['.']).once('exit', () => {
                resolve(Date.now() - start);
            });
            tExecList.push(Date.now() - start);
        })
        pList.push(p);
    }

    return Promise.all(pList).then((tExitList) => {
        const avgExit = sum(...tExitList) / size;
        const avgExec = sum(...tExecList) / size;
        return Promise.resolve(avgExec);
    });
};