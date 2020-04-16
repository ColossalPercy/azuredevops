import tl = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();