var ao_canvas = document.createElement("canvas");


function createAmbientOcclusionTexture(){
	
	var grayscale = Filters.filterImage(Filters.grayscale, height_image, invert_source);
	
	grayscale = Filters.sobelfilter(grayscale, 0.5, 1);
	
	Filters.gaussianblur(grayscale, height_image.width, height_image.height, Math.abs(smoothing));
	
	var ao_map = Filters.createImageData(height_image.width, height_image.height);
	
	// invert colors if needed
	
	var v = 0;
	for (var i=0; i<grayscale.data.length; i += 4){
		v = (grayscale.data[i] + grayscale.data[i+1]) * 0.5 * 255.0;
		ao_map.data[i]   = v;
		ao_map.data[i+1] = v;
		ao_map.data[i+2] = v;
		ao_map.data[i+3] = 255;
	}
	// write out texture
	var ctx_displace = ao_canvas.getContext("2d");
	ao_canvas.width = grayscale.width;
	ao_canvas.height = grayscale.height;
	ctx_displace.clearRect(0, 0, grayscale.width, grayscale.height);
	ctx_displace.putImageData(ao_map, 0, 0, 0, 0, grayscale.width, grayscale.height);
	
	setTexturePreview(ao_canvas, "ao_img", grayscale.width, grayscale.height);
}