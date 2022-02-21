(function main(){
	
	const file_input = document.getElementById('file-input');
	const result = document.getElementById('result');
	
	file_input.addEventListener('change', function(){
		let file = this.files[0];
		this.value = null;
		
		let cu = new ChunkUploader(file, '../chunk-uploader.php', {
			progress: function(pct){
				result.innerHTML = `${pct}% completed`;
			},
			complete: function(response){
				result.innerHTML = `Done.`;
				console.log(response);
			},
			error(error){
				result.innerHTML = `Error: ${error.message}`;
			},
			chunk_size: 500,
			
			// optional data to be passed to the back end
			data: {
				some: 'arbitrty',
				data: 123
			}
		});
		cu.upload();
	});
	
	
})()


