
//https://deliciousbrains.com/using-javascript-file-api-to-avoid-file-upload-limits/

class ChunkUploader{
	
	constructor(file, url, chunk_size){
		this.file = file;
		this.url = url;
		this.chunk_size = chunk_size || 1000 * 1024;
		this.reader = new FileReader();
	}
	
	start(){
		
	}
	
	_upload_chunk(start){
		var next_chunk = start + this.chunk_size + 1;
		var blob = this.file.slice(start, next_chunk);
		var blob_size = blob.size;
		this.reader.onloadend = function(event){
			if(event.target.readyState !== FileReader.DONE) return;
			
		};
		this.reader.readAsDataURL(blob);
	}
	
}
