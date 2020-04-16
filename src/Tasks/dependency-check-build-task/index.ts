import task = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        const projectName: string = task.getInput('projectName', true);
        const scanPath: string = task.getPathInput('scanPath', true);
        const excludePath: string = task.getPathInput('excludePath');
        const formats: string[] = task.getDelimitedInput('format', ',', true);
        const failOnCVSS: string = task.getInput('failOnCVSS');
        const suppressionPath: string = task.getPathInput('suppressionPath');
        const enableExperimental: boolean = task.getBoolInput('enableExperimental', true);
        const enableRetired: boolean = task.getBoolInput('enableRetired', true);
        const enableVerbose: boolean = task.getBoolInput('enableVerbose', true);
        const dataMirrorJson: string = task.getInput('dataMirrorJson');
        const dataMirrorOdc: string = task.getInput('dataMirrorOdc');
        const additionalArguments: string = task.getInput('additionalArguments');

    }
    catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();