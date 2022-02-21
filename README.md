# Chunk Uploader

A Javascript font end component and a PHP back-end component which work together to allow for segmented file uploads from the browser to server.

## Front end

On the front end, the `ChunkUploader` class is used to segment and upload the file in pieces to the server.

The class takes three arguments: The File to be uploaded, the URL of the PHP script to handle the upload, and an options object.

`var cu = new ChunkUploader(file, url, options);`

All options are optional, and they are as follows:

 - `options.chunk_size` - an integer representing the maximum size of any chunk to be uploaded. The default is `1000 * 1024`.
 - `options.progress` - a function to be called as the upload progresses which will receive one argument: an integer representing the percent of completion of the upload.
 - `options.complete` - a function which is called when the upload has finished successfully. This function will receive the final response from the server, which may be altered by the `processUploadedFile` function on the server-side.
 - `options.error` - a function that is called when there is an error. The Error object is passed as this functions only argument.
 - `options.data` - an object containing arbitrary data that is passed to the user-configurable PHP function.

To start the upload, the `upload` method must be called: `cu.upload()`.

## Back end

There are two configurable components of the back-end script.

 - the `UPLOAD_PATH` constant, which specifies the temporary directory in which files are uploaded.
 - the `processUploadedFile` function, which provides a space to handle the successfully completed file upload.

The `processUploadedFile` function has three arguments: The path to the temporary location of the successfully uploaded file, the filename as it was uploaded, and an associative array containing the `data` property that was passed to the constructor on the client side, if any.

```php
/**
 * User configurable function to handle completed file uploads with 
 * data from the client side
 * @param type $temp_name - The temporary path to the completed file upload
 * @param type $filename - The filename of the file from the client side
 * @param type $data - anything from the opts.data object passed to the ChunkUploader constructor.
 */
function processUploadedFile($temp_name, $filename, $data=[])
```

This function may modify the `$GLOBALS['response']` object as needed. The `$GLOBALS['response']` object will then be passed to the `completed` callback on the client side.

If neccesary, the `processUploadedFile` may also call the `error(String $message)` function as well, which will trigger the `error` callback on the client side.

## Working demo

See the working demo code in the `/demo` directory.