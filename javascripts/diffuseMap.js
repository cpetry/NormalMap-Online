var diffuse_canvas = document.createElement("canvas");

function handleDiffuseFileSelect(evt) {
    var files = evt.target.files; // FileList object
    readDiffuseImage(evt.target.files[0]); // files is a FileList of File objects. List some properties.
}

document.getElementById('select_diffuse_file').addEventListener('change', handleDiffuseFileSelect, false);

var readDiffuseImage = function(imgFile){
	//console.log(imgFile);
	if(!imgFile.type.match(/image.*/)){
		console.log("The dropped file is not an image: ", imgFile.type);
		return;
	}

	var reader = new FileReader();
	reader.onload = function(e){
		var data = e.target.result;
		if (imgFile.type == "image/targa"){
			//console.log(uint8ArrayNew);
			var tga = new TGA();
			tga.load(new Uint8Array(data));
			data = tga.getDataURL('image/png');
		}
		loadDiffuseMap(data);
		document.getElementById('input_diffuse').disabled = false;
	};
	if (imgFile.type == "image/targa")
		reader.readAsArrayBuffer(imgFile);
	else
		reader.readAsDataURL(imgFile);
};

var loadDiffuseMap = function(source){
	diffuse_image = new Image();
	//console.log(source);
			
	diffuse_image.onload = function(){
		var ctx_diffuse = diffuse_canvas.getContext("2d");
		diffuse_canvas.width = diffuse_image.width;
		diffuse_canvas.height = diffuse_image.height;
		ctx_diffuse.clearRect(0, 0, diffuse_image.width, diffuse_image.height);
		ctx_diffuse.drawImage(diffuse_image,0,0, diffuse_image.width, diffuse_image.height);
		NMO_RenderView.diffuse_map.needsUpdate = true;
		
		NMO_RenderView.enableDiffuse();
	};

	diffuse_image.src = source;
};