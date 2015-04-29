/*
 * Author: Christian Petry
 * Homepage: www.petry-christian.de
 *
 * License: MIT
 * Copyright (c) 2014 Christian Petry
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or 
 * substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR 
 * OTHER DEALINGS IN THE SOFTWARE.
 */
var displacement_bias = 0;
var invert_displacement = false;

var displacement_canvas = document.createElement("canvas");

function createDisplacementMap(){

	var st = new Date().getTime();
	var img_data = Filters.filterImage(Filters.grayscale, height_image);
	var displace_map = Filters.createImageData(img_data.width, img_data.height);

	var contrast = document.getElementById('dm_contrast_nmb').value;
	
	// invert colors if needed
	var v = 0;
	for (var i=0; i<img_data.data.length; i += 4){
		v = (img_data.data[i] + img_data.data[i+1] + img_data.data[i+2]) * 0.333333;
		v = v < 1.0 || v > 255.0 ? 0 : v;
		if (invert_displacement)
			v = 255.0 - v;
		displace_map.data[i]   = v;
		displace_map.data[i+1] = v;
		displace_map.data[i+2] = v;
		//displace_map.data[i+3] = img_data.data[i+3];
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
	
	setTexturePreview(displacement_canvas, "displace_img", img_data.width, img_data.height);
	
	
	updateDisplacementBias();
	//console.log("w:" + img_data.width + ", h:" + img_data.height);
	if (render_model.material.uniforms[ "enableDisplacement" ].value == true){
		render_model.geometry.computeTangents();
	}
	//console.log("Displacement: " + (new Date().getTime() - st));
}


	
var invertDisplacement = function(){
	invert_displacement = !invert_displacement;
	
	if (auto_update && Date.now() - timer > 50)
		createDisplacementMap();
}
	

function setDisplaceStrength(v){
	if(timer == 0)
		timer = Date.now();
		
	if (auto_update && Date.now() - timer > 50){
		setDisplacementScale(-v);
		
		timer = 0;
	}
}

function setDisplacementContrast(){
	if(timer == 0)
		timer = Date.now();
		
	if (auto_update && Date.now() - timer > 50){
		createDisplacementMap();
		timer = 0;
	}
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