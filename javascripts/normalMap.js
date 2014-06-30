var invert_red = 0;
var invert_green = 0;
var invert_source = 0;
var smoothing = 0;

var createNormalMap = function(){
	var div_container = document.getElementById("normal_map");
	var img = document.getElementById("normal_img");
	var ctx_normal = normal_canvas.getContext("2d");
	
	// important!
	normal_canvas.width = height_image.width;
	normal_canvas.height = height_image.height;
	
	
	ctx_normal.clearRect(0, 0, height_image.width, height_image.height);
	
	var grayscale = Filters.filterImage(Filters.grayscale, height_image, invert_source);
	
	
	// Note that ImageData values are clamped between 0 and 255, so we need
	// to use a Float32Array for the gradient values because they
	// range between -255 and 255.
	
	var img_data = Filters.newsobelfilter(grayscale, 
			document.getElementById("strength_slider").value, 
			document.getElementById("level_slider").value);
	
	
	
	// smoothing
	var weight_array = []
	for( var i = 0; i < smoothing * smoothing; i++)
		weight_array.push(1.0 / (smoothing * smoothing));
	
	if (smoothing >= 2)
		img_data = Filters.convoluteFloat32(img_data,weight_array);
	
	
	var idata = Filters.createImageData(img_data.width, img_data.height);
	
	
		// invert colors if needed
	for (var i=0; i<img_data.data.length; i++){
		if ((i % 4 == 0 && invert_red)
		|| (i % 4 == 1 && invert_green))
			idata.data[i] = 255.0 - img_data.data[i];
		else
			idata.data[i] = img_data.data[i];
	}
	
		
	ctx_normal.putImageData(idata, 0, 0, 0, 0, img_data.width, img_data.height);
	
	img.src = normal_canvas.toDataURL('image/jpeg');
}

var invertRed = function(){
	if (invert_red)
		invert_red = 0;
	else
		invert_red = 1;
		
	createNormalMap();
}

var invertGreen = function(){
	if (invert_green)
		invert_green = 0;
	else
		invert_green = 1;
		
	createNormalMap();
}

var invertSource = function(){
	if (invert_source)
		invert_source = 0;
	else
		invert_source = 1;
		
	createNormalMap();
}

var setSmoothing = function(v){
	smoothing = v;
	createNormalMap();
}