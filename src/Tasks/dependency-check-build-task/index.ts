import task = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        // Get inputs from build task.
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

        // Create reports directory
        const testDirectory: string = task.getVariable('Common.TestResultsDirectory');
        const reportsDirectory: string = testDirectory + '/dependency-check';

        // Check if report directory does not exist
        if (!task.exist(reportsDirectory)) {
            console.log(`Creating dependency check test results directory at ${reportsDirectory}`);
            task.mkdirP(reportsDirectory);
        }

        // Default args
        let args: string[] = [];
        args.push(`--project "${projectName}"`);
        args.push(`--scan "${scanPath}"`);
        args.push(`--out "${reportsDirectory}"`);

        // Exclude switch
        const localPath = task.getVariable('Build.Repository.LocalPath');
        if (localPath !== excludePath) {
            args.push(`--exclude "${excludePath}`);
        }

        // Format type
        formats.forEach(f => {
            args.push(`--format ${f}`);
        })

        // Fail on CVSS switch
        if (typeof failOnCVSS !== 'undefined') {
            let failOnCVSSValue = parseInt(failOnCVSS);
            args.push(`--failOnCvss ${failOnCVSSValue}`);
        }

        // Suppression switch
        if (localPath !== suppressionPath){
            args.push(`--suppression "${suppressionPath}"`);
        }

        //Set enableExperimental option if requested
        if (enableExperimental){
            args.push('--enableExperimental');
        }

        //Set enableRetired option if requested
        if (enableRetired){
            args.push('--enableRetired');
        }

        //Set log switch if requested
        if(enableVerbose) {
            args.push(`--log "${reportsDirectory}/log"`);
        }

        // additionalArguments
        if(typeof additionalArguments !== 'undefined') {
            args.push(additionalArguments);
        }

    }
    catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();