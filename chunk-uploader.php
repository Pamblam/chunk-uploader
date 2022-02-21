<?php

/**
 * The response object.
 */
$response = [
	'error' => false,
	'message' => '',
	'data' => []
];

/**
 * The temporary path where files will be uploaded
 */
define('UPLOAD_PATH', realpath(dirname(__FILE__))."/uploads/");

/**
 * User configurable function to handle completed file uploads with 
 * data from the client side
 * @param type $temp_name - The temporary path to the completed file upload
 * @param type $filename - The filename of the file from the client side
 * @param type $data - anything from the opts.data object passed to the ChunkUploader constructor.
 */
function processUploadedFile($temp_name, $filename, $data=[]){
	$GLOBALS['response']['data'] = [
		'temp_name' => $temp_name,
		'filename' => $filename,
		'data' => $data
	];
}

/******************************************************************************/
/** Do not change below this line                                            **/
/******************************************************************************/

if(empty($_POST['action'])) error('Invalid request');

switch($_POST['action']){
	
	case "init":
		$hash = bin2hex(random_bytes(18));
		$filename = UPLOAD_PATH.$hash.".part";
		$created = touch($filename);
		if(!$created) error('Could not initiate upload.');
		$response['data']['hash'] = $hash;
		output();
		break;
		
	case "upload_chunk":
		if(empty($_POST['hash'])) error('Invalid hash.');
		$filename = UPLOAD_PATH.$_POST['hash'].".part";
		if(!file_exists($filename)) error("No valid file.");
		$dest_fh = fopen($filename, "a");
		$src_fh = fopen($_FILES['file']['tmp_name'], "r");
		$line = fgets($src_fh, 4096);
		while ($line !== false) {
			fputs($dest_fh, $line);
			$line = fgets($src_fh, 4096);
		}
		fclose($src_fh);
		fclose($dest_fh);
		output();
		break;
	
	case "final":
		if(empty($_POST['hash'])) error('Invalid hash.');
		$filename = UPLOAD_PATH.$_POST['hash'].".part";
		if(empty($_POST['size'])) error('Invalid filesize.');
		if(filesize($filename) !== intval($_POST['size'])) error('Upload failed.');
		$data = empty($_POST['data']) ? [] : $_POST['data'];
		if(empty($_POST['name'])) error('Invalid filename.');
		$ext = pathinfo($_POST['name'], PATHINFO_EXTENSION);
		$new_filename = UPLOAD_PATH.$_POST['hash'].".".$ext;
		$renamed = rename($filename, $new_filename);
		if(!$renamed) error("Error moving file.");
		processUploadedFile($new_filename, $_POST['name'], $data);
		output();
		break;
}

function error($message){
	$GLOBALS['response']['error'] = true;
	$GLOBALS['response']['message'] = $message;
	output();
}

function output(){
	header('Content-Type: application/json');
	echo json_encode($GLOBALS['response'], JSON_PRETTY_PRINT);
	exit;
}