const { ipcMain, app } = require('electron');
const fs = require('fs');

const testCaseList = [];
const marks = {};
let window = null;

function add(config) {
    testCaseList.push(config);
}

function mark(name) {
    marks[name] = Date.now();
}

function addMarkTest(name, from, to) {
    add({
        name,
        t: marks[to] - marks[from],
    });
}

function prepare(win) {
    window = win;
    addMarkTest('appReady', 'init', 'appReady');
    addMarkTest('crashReporter', 'startCrashReporter', 'stopCrashReporter');
    addMarkTest('windowReadyToShow', 'startCreateWindow', 'windowReadyToShow');
    add({
        name: 'spawnProcess', 
        exec: async () => {
            return require('./spawn-test').spawnExecTime();
        },
    });
    add({
        name: 'calcFibonacci',
        exec: async () => {
            return require('./fibonacci')();
        },
    });

    add({
        name: 'renderer spawnProcess',
        exec: async () => {
            win.webContents.send('renderer-spawn-process');
            return new Promise((resolve) => {
                ipcMain.once('renderer-spawn-process-result', (event, data) => {
                    resolve(data);
                });
            })
        }
    });
    
    add({
        name: 'renderer calcFibonacci',
        exec: async () => {
            win.webContents.send('renderer-calc-fibonacci');
            return new Promise((resolve) => {
                ipcMain.once('renderer-calc-fibonacci-result', (event, data) => {
                    resolve(data);
                });
            })
        }
    });

    add({
        name: 'appMainMemory',
        exec: () => {
            const pList = app.getAppMetrics();
            const mainProcess = pList.find(p => p.type === 'Browser');
            return mainProcess.memory.workingSetSize / 1024;
        }
    });

    add({
        name: 'appRendererMemory',
        exec: () => {
            const pList = app.getAppMetrics();
            const tabProcess = pList.find(p => p.type === 'Tab');
            return tabProcess.memory.workingSetSize / 1024;
        }
    });
}

async function run() {
    let results = [];
    for(const testCase of testCaseList) {
        if (testCase.before) {
            await testCase.before();
        }
        if (testCase.exec) {
            // console.log(testCase.name, 'start to run');
            let t = Date.now();
            const r = await testCase.exec();
            const spent = r || Date.now() - t;
            // console.log(testCase.name, 'finished', spent);
            testCase.t = spent;
        }
        if (testCase.after) {
            await testCase.after();
        }
        const result = `${testCase.name}: ${testCase.t}`;
        console.log(result);
        results.push(result);
    }
    window.webContents.send('perf-results', results);
}

module.exports = {
    mark,
    prepare,
    run,
}