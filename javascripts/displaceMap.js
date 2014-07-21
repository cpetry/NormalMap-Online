var displacement_bias = 0;

var displacement_canvas = document.createElement("canvas");

function createDisplacementMap(contrast){

	var img_data = Filters.filterImage(Filters.grayscale, height_image);
	
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
	
	// add contrast value
	displace_map = contrastImage(displace_map, contrast * 255);
	
	
	// GET BIAS FOR DISPLACMENT
	// calc average value at the border of height tex
	var top_left = 0;
	var top_right = (displace_map.width-1)*4;
	var bottom_left = ((displace_map.width-1) * (displace_map.height-1)*4) - (displace_map.width-1)*4;
	var bottom_right = (displace_map.width-1) * (displace_map.height-1) * 4;
	displacement_bias = (displace_map.data[top_left] + displace_map.data[top_right] + displace_map.data[bottom_left] + displace_map.data[bottom_right]) / 4.0 / 255.0;
	
	
	
	// write out texture
	var ctx_displace = displacement_canvas.getContext("2d");
	displacement_canvas.width = img_data.width;
	displacement_canvas.height = img_data.height;
	ctx_displace.clearRect(0, 0, img_data.width, img_data.height);
	ctx_displace.putImageData(displace_map, 0, 0, 0, 0, img_data.width, img_data.height);
	
	setTexturePreview(displacement_canvas, displacement_canvas_preview, "displace_img", img_data.width, img_data.height);
	
	
	updateDisplacementBias();
	//console.log("w:" + img_data.width + ", h:" + img_data.height);
	
}


function setDisplaceStrength(v){
	setDisplacementScale(-v);
}

function setDisplacementContrast(v){
	createDisplacementMap(v);
}


function contrastImage(imageData, contrast) {

    var data = imageData.data;
    var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for(var i=0;i<data.length;i+=4)
    {
		greyval = factor * (data[i] - 128) + 128;
        data[i] = greyval;
        data[i+1] = greyval;
        data[i+2] = greyval;
    }
    return imageData;
}