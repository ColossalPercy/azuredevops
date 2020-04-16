import task = require('azure-pipelines-task-lib/task');
import tool = require('azure-pipelines-tool-lib/tool');
import path = require('path');
import fs = require('fs');
import http = require('typed-rest-client/HttpClient');

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
        const reportsDirectory: string = path.join(testDirectory, 'dependency-check');

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
        const localPath: string = task.getVariable('Build.Repository.LocalPath');
        if (localPath !== excludePath) {
            args.push(`--exclude "${excludePath}`);
        }

        // Format type
        formats.forEach(f => {
            args.push(`--format ${f}`);
        })

        // Fail on CVSS switch
        if (failOnCVSS) {
            let failOnCVSSValue: number = parseInt(failOnCVSS);
            args.push(`--failOnCvss ${failOnCVSSValue}`);
        }

        // Suppression switch
        if (localPath !== suppressionPath){
            args.push(`--suppression "${suppressionPath}"`);
        }

        // Set enableExperimental option if requested
        if (enableExperimental){
            args.push('--enableExperimental');
        }

        // Set enableRetired option if requested
        if (enableRetired){
            args.push('--enableRetired');
        }

        // Set log switch if requested
        if(enableVerbose) {
            args.push(`--log "${path.join(reportsDirectory, 'log')}"`);
        }

        // additionalArguments
        if(additionalArguments) {
            args.push(additionalArguments);
        }

        // Check for dependency-check in tool cache
        let toolPath: string = tool.findLocalTool('dependency-check', '5.3.2', 'x64');
        
        // Download the tool if it does not exist
        if (!toolPath) {
            const url: string = 'https://dl.bintray.com/jeremy-long/owasp/dependency-check-5.3.2-release.zip';

            // Download the .zip and extract it
            const downloadPath: string = await tool.downloadTool(url);
            const extractPath: string = await tool.extractZip(downloadPath);

            // Add to tool cache
            let toolRoot = path.join(extractPath, 'dependency-check');
            await tool.cacheDir(toolRoot, 'dependency-check', '5.3.2', 'x64');

            // Find the tool that we just installed
            toolPath = tool.findLocalTool('dependency-check', '5.3.2', 'x64');
        }

        // Add the bin folder of the tool to PATH
        tool.prependPath(path.join(toolPath, 'bin'));

        // Get dependency-check data dir path
        const dataDirectory: string = path.join(toolPath, 'data');

        // Pull JSON cached file
        if (dataMirrorJson) {
            console.log('Downloading Dependency Check vulnerability JSON data mirror...');
            await tool.downloadTool(dataMirrorJson, path.join(dataDirectory, 'jsrepository.json'));
        }

        // Pull ODC cached file
        if (dataMirrorOdc) {
            console.log('Downloading Dependency Check vulnerability DB data mirror...');
            await tool.downloadTool(dataMirrorOdc, path.join(dataDirectory, 'odc.mv.db'));
        }
    }
    catch (err) {
        task.setResult(task.TaskResult.Failed, err.message);
    }
}

run();