var displacement_bias = 0;

var displacement_canvas = document.createElement("canvas");

function createDisplacementMap(){

	var img_data = Filters.filterImage(Filters.grayscale, height_image);
	// calc average value at the border of height tex
	var top_left = img_data.data[0];
	var top_right = img_data.data[(img_data.width-1)*4];
	var bottom_left = img_data.data[((img_data.width-1) * (img_data.height-1)*4) - (img_data.width-1)*4];
	var bottom_right = img_data.data[((img_data.width-1) * (img_data.width-1)*4)];
	//console.log((top_left + top_right + bottom_left + bottom_right) / 4.0 / 255.0);
	displacement_bias = (top_left + top_right + bottom_left + bottom_right) / 4.0 / 255.0;
	//console.log(displacement_bias);
	var displace_map = Filters.createImageData(img_data.width, img_data.height);
	
	// invert colors if needed
	var v = 0;
	for (var i=0; i<img_data.data.length; i += 4){
		v = (img_data.data[i] + img_data.data[i+1] + img_data.data[i+2]) * 0.333333;
		v = v < 1.0 || v > 255.0 ? 0 : v;
		displace_map.data[i]   = v;
		displace_map.data[i+1] = v;
		displace_map.data[i+2] = v;
		displace_map.data[i+3] = 255;
	}
	var ctx_displace = displacement_canvas.getContext("2d");
	displacement_canvas.width = img_data.width;
	displacement_canvas.height = img_data.height;
	ctx_displace.clearRect(0, 0, img_data.width, img_data.height);
	ctx_displace.putImageData(displace_map, 0, 0, 0, 0, img_data.width, img_data.height);
	
	setTexturePreview(displacement_canvas, displacement_canvas_preview, "displace_img", img_data.width, img_data.height);
	
	//console.log("w:" + img_data.width + ", h:" + img_data.height);
	
}


function setDisplaceSetting(element, v){
	if (element == "strength")
		setDisplacementScale(-v);
	
		
	if (auto_update && Date.now() - timer > 50){
		createDisplacementMap();
		timer = 0;
	}
}