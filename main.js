(function main(){
	
	const file_btn = document.getElementById('file-btn');
	const fi = new FI({button: file_btn});
	fi.register_callback(function(){
		let file = fi.get_files()[0];
		fi.clear_files();
		new ChunkUploader(file);
	});
	
	
})()


