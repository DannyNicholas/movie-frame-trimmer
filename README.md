# Movie Frames Trimmer

Trims unwanted frames from a movie. This resolved an issue where each movie file extracted from a camcorder ended with the first frame of the following movie. This script was written to strip out this final frame from all movies within a directory.

Movies will be loaded from an input directory and the trimmed movie files will be saved to an output directory. Each file's filename will remain the same.

The new trimmed file will inherit the last modified timestamp from the original file. This timestamp will also be used to set the creation timestamp metadata.

## Pre-requisites

The video trimmer uses `ffmpeg` and `ffprobe`. Please ensure these are available from the command line. See [ffmpeg documentation](https://www.ffmpeg.org/).

The technique to strip out frames using ffmpeg was inspired from by [this question](https://superuser.com/questions/459313/how-to-cut-at-exact-frames-using-ffmpeg) in superuser.

## Install with Node Package Manager

```
npm install
```

## Run with Node

```
node trimmer.js --fileType=mov --input=/c/dev/movies/ --output=/c/dev/trimmed-movies/
```

Additional parameters:

`fileType` - **mandatory** file type of all movie files you want to trim (e.g `mov` or `mp4`). Any files of other types will be ignored.

`input` - **mandatory** absolute path to the directory containing the files you want to trim (e.g `/user/me/files`).

`output` - **mandatory** absolute path to the directory where the trimmed files will be saved (e.g `/user/me/trimmed-files`).

Code is configured to assume:
- movie has a frame rate of 25 frames-per-second.
- 1 frame will be stripped from the movie

These can be modified in the code if these don't suit your movie files.



## Run from command line

```
./trimmer.js --fileType=mov --input=/c/dev/movies/ --output=/c/dev/trimmed-movies/
```

