#!/usr/bin/env node

const yargs = require('yargs')
const path = require('path')
const fs = require('fs')
var datetime = require('node-datetime')

const options = yargs
    .usage("Usage: --fileType <fileType> --directory <absolute-path-to-files>")
    .option("f", {alias: "fileType", describe: "type of files to rename", type: "string", demandOption: true})
    .option("i", {alias: "input", describe: "absolute path to directory containing movies being trimmed", type: "string", demandOption: true})
    .option("o", {alias: "output", describe: "absolute path to directory where trimmed movies will be saved", type: "string", demandOption: true})
    .argv

const framesPerSecond = 25.0;
const framesToTrim = 1;

const processFile = (inputDirectory, outputDirectory, fileName) => {
    console.log(`Processing file ${fileName}`);
    const inputPath = `${inputDirectory}/${fileName}`
    const outputPath = `${outputDirectory}/${fileName}`
    const timestamp = extractTimestamp(inputPath)

    if (fs.existsSync(outputPath)) {
        console.log(`WARN: file ${outputPath} already exists. We will NOT overwrite it. Movie trimming aborted.`)
    } else {
        // first we use ffprobe to establish the movie duration.
        // from the movie duration and expected frames per second, we can compute the total number of frames.
        const totalDurationBuffer = require('child_process').execSync(`ffprobe -v 0 -show_entries format=duration -of compact=p=0:nk=1 '${inputPath}'`)
        const totalDuration = parseFloat(totalDurationBuffer.toString('utf8'));
        const totalFrames = totalDuration * framesPerSecond;
        console.log(`Movie duration is ${totalDuration} seconds and contains ${totalFrames} frames`);

        // we can then compute the total wanted frames (total - trimmed).
        // from the trimmed frames number, we can then compute the expected duration of the trimmed movie.
        const wantedFrames = totalFrames - framesToTrim;
        const wantedDuration = wantedFrames / framesPerSecond;
        console.log(`Movie will be trimmed to ${wantedDuration} seconds, containing ${wantedFrames} frames`);

        // we can now use ffmpeg to trim our movie to the wanted duration.
        // we use '-c copy' to copy the original movie (not re-transcode).
        // we also set the creation time metadata (this may trigger a warning when run)
        require('child_process').execSync(`ffmpeg -t ${wantedDuration} -i '${inputPath}' -c copy -map 0 -metadata creation_time='${timestamp.toISOString()}' '${outputPath}' -loglevel warning`)

        // finally set timestamps on trimmed file to match the original
        fs.utimesSync(outputPath, timestamp, timestamp);
    }
}

// extract timestamp from file in provided filepath
const extractTimestamp = (filePath) => {
    const stats = fs.statSync(filePath)
    return stats.mtime
}

//
// Script Start
//

// file type to be trimmed
if (!options.fileType) {
    console.log("Error: No fileType parameter has been supplied. For example, to rename text files, use --fileType=txt")
    process.exit(1);
}
const fileType = options.fileType

// use provided directory path or default to files sub-directory
const inputDirectoryPath = options.input
const outputDirectoryPath = options.output
if (!fs.existsSync(inputDirectoryPath)) {
    console.log(`ERROR: input directory ${inputDirectoryPath} does not exist. Movie trimming aborted.`)
    process.exit(1)
}
if (!fs.existsSync(outputDirectoryPath)) {
    console.log(`ERROR: output directory ${outputDirectoryPath} does not exist. Movie trimming aborted.`)
    process.exit(1);
}
console.log(`Scanning directory '${inputDirectoryPath}'`)

// find files and iteratively trim them
try{
    const files = fs.readdirSync(inputDirectoryPath)
        .filter(file => file.endsWith(`.${fileType}`))
    
    if (files.length > 0) {
        console.log(`Found ${files.length} matching file/s with file type: ${fileType}`)
        files.forEach(file => processFile(inputDirectoryPath, outputDirectoryPath, file))
        console.log(`Movie trimming completed.`)
    } else {
        console.log(`No matching files found with file type: ${fileType}`)
    }
}
catch(error) {
    console.log(`Error when attempting to trim movies in directory ${inputDirectoryPath}`)
    console.log(`Details: ${error}`)
}
