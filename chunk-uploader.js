
class ChunkUploader{
	
	constructor(file, url, opts={}){
		this.file = file;
		this.url = url;
		this.chunk_size = opts.chunk_size || 1000 * 1024;
		this.reader = new FileReader();
		this.hash = null;
		this.current_chunk_size = 0;
		this.onProgress = opts.progress || (()=>{});
		this.onComplete = opts.complete || (()=>{});
		this.onError = message=>{
			var error = new Error(message);
			if(opts.error){
				opts.error(error);
			}else{
				throw error;
			}
		};
		this.data = opts.data || {};
	}
	
	async upload(){
		var init = await this._init();
		this.hash = init.data.hash;
		while(this.current_chunk_size <= this.file.size){
			await this._upload_chunk(this.current_chunk_size);
		}
		var response = await this._final();
		this.onComplete(response);
	}
	
	_upload_chunk(start){
		return new Promise(done=>{
			this.current_chunk_size = start + this.chunk_size + 1;
			var blob = this.file.slice(start, this.current_chunk_size);
			this.reader.onloadend = async e => {
				if(e.target.readyState !== FileReader.DONE) return;
				await this._xhr_chunk(blob);
				var pct = Math.ceil((Math.min(this.current_chunk_size, this.file.size) / this.file.size) * 100);
				this.onProgress(pct);
				done();
			};
			this.reader.readAsDataURL(blob);
		});
			
	}
	
	_xhr_chunk(blob){
		return new Promise(done=>{
			var fd = new FormData();
			fd.append('action', 'upload_chunk');
			fd.append('hash', this.hash);
			fd.append('file', blob);
			var xhr = new XMLHttpRequest();
			xhr.open("POST", this.url, true);
			xhr.onload = ()=>{
				if(xhr.status != 200) return;
				xhr.upload.onprogress = function (e) {
					var pct = Math.ceil((e.loaded / this.file.size) * 100);
					this.onProgress(pct);
				};
				try{
					var data = JSON.parse(xhr.responseText);
				}catch(e){
					this.onError(e.message);
					done(false);
					return;
				}
				if(data.error){
					this.onError(data.message);
					done(false);
				}else{
					done(data);
				}
			};
			xhr.send(fd);
		});
	}
	
	_final(){
		return new Promise(done=>{
			var fd = new FormData();
			fd.append('action', 'final');
			fd.append('hash', this.hash);
			fd.append('size', this.file.size);
			fd.append('name', this.file.name);
			Object.keys(this.data).forEach(key=>{
				fd.append(`data[${key}]`, this.data[key]);
			});
			var xhr = new XMLHttpRequest();
			xhr.open("POST", this.url, true);
			xhr.onload = ()=>{
				if(xhr.status != 200) return;
				try{
					var data = JSON.parse(xhr.responseText);
				}catch(e){
					this.onError(e.message);
					done(false);
					return;
				}
				if(data.error){
					this.onError(data.message);
					done(false);
				}else{
					done(data);
				}
			};
			xhr.send(fd);
		});
	}
	
	_init(){
		return new Promise(done=>{
			var fd = new FormData();
			fd.append('action', 'init');
			var xhr = new XMLHttpRequest();
			xhr.open("POST", this.url, true);
			xhr.onload = ()=>{
				if(xhr.status != 200) return;
				try{
					var data = JSON.parse(xhr.responseText);
				}catch(e){
					this.onError(e.message);
					done(false);
					return;
				}
				if(data.error){
					this.onError(data.message);
					done(false);
				}else{
					done(data);
				}
			};
			xhr.send(fd);
		});
	}
}
