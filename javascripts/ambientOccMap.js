
function createAmbientOcclusionTexture(img_data){
	
	var ao_map = Filters.createImageData(img_data.width, img_data.height);
	
	// invert colors if needed
	var v = 0;
	for (var i=0; i<img_data.data.length; i += 4){
		v = (img_data.data[i] + img_data.data[i+1] + img_data.data[i+2]) * 0.33 * 255.0;
		ao_map.data[i]   = v;
		ao_map.data[i+1] = v;
		ao_map.data[i+2] = v;
		ao_map.data[i+3] = 255;
	}
	var ctx_ao = ao_canvas.getContext("2d");
	ao_canvas.width = img_data.width;
	ao_canvas.height = img_data.height;
	ctx_ao.clearRect(0, 0, img_data.width, img_data.height);
	ctx_ao.putImageData(ao_map, 0, 0, 0, 0, img_data.width, img_data.height);	
}