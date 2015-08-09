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
 
var height_image;
container_height = 300;


function handleDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    readImage(evt.target.files[0]); // files is a FileList of File objects. List some properties.
}

document.getElementById('select_file').addEventListener('change', handleFileSelect, false);
/*var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', function(e){
	e.preventDefault(); 
	readImage(e.dataTransfer.files[0]);
}, true);*/

var height_map_drop = document.getElementById("height_map");
var height_canvas = document.getElementById("height_canvas");
height_map_drop.addEventListener("dragover", function(e) {e.preventDefault();}, true);
height_map_drop.addEventListener("drop", function(e){
	e.preventDefault(); 
	readImage(e.dataTransfer.files[0]);
}, true);


function isPowerOf2(val){
	if((val & -val) == val)
		return true;
	else 
		return false;
}

var readImage = function(imgFile){
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
		loadHeightmap(data);
	};
	if (imgFile.type == "image/targa")
		reader.readAsArrayBuffer(imgFile);
	else
		reader.readAsDataURL(imgFile);
};



var loadHeightmap = function(source){
	height_image = new Image();
	console.log(source);
			
	height_image.onload = function(){
		//console.log("creating height image");

		height_image.width = container_height;
		height_image.height = container_height;
		
		var context = height_canvas.getContext("2d");
		context.clearRect(0, 0, height_canvas.width, height_canvas.height);
		
		height_canvas.width = height_image.width;
		height_canvas.height = height_image.height;
		
		var ratio = height_image.naturalWidth / height_image.naturalHeight;
		var draw_width = ratio > 1 ? height_canvas.width : (height_canvas.width * ratio);
		var draw_height = ratio > 1 ? (height_canvas.height / ratio) : height_canvas.height;
		context.drawImage(height_image, container_height/2 - draw_width/2, container_height/2 - draw_height/2 , draw_width, draw_height);
		//context.drawImage(height_image, height_image.width, height_image.height );
		//console.log('draw_width ' + height_image.naturalWidth);
		//console.log('draw_height ' + height_image.naturalHeight);
		height_image.width = height_image.naturalWidth;
		height_image.height = height_image.naturalHeight;
		
		var size_text = "" + (height_image.width) + " x " + (height_image.height);
		size_text += (!isPowerOf2(height_image.width) && !isPowerOf2(height_image.height)) ? " NOT POWER OF 2 !" : "";
		document.getElementById("size").value = size_text;
		
		renderNormalview_update();
		/*renderer_Normalview.setSize(height_image.naturalWidth, height_image.naturalHeight);
		composer_Normalview.setSize(height_image.naturalWidth, height_image.naturalHeight);
		
		height_map = new THREE.Texture( height_image );
		normalmap_uniforms["tDiffuse"].value = height_map;
		normalmap_uniforms["dimensions"].value = [height_image.naturalWidth, height_image.naturalHeight, 0];
		gaussian_shader_x.uniforms["dimensions"].value = [height_image.naturalWidth, height_image.naturalHeight, 0];
		gaussian_shader_y.uniforms["dimensions"].value = [height_image.naturalWidth, height_image.naturalHeight, 0];
		*/
		
		createNormalMap();
		height_map.needsUpdate = true;
		
		setNormalSetting('strength', document.getElementById('strength_nmb').value);
		setNormalSetting('level', document.getElementById('level_nmb').value);
		setNormalSetting('blur_sharp', document.getElementById('blur_sharp_nmb').value);
		
		createDisplacementMap(document.getElementById('dm_contrast_nmb').value);
		setDisplacementScale(-document.getElementById('dm_strength_nmb').value);
		
		createAmbientOcclusionTexture();
		createSpecularTexture();
	};

	height_image.src = source;
};

var initHeightMap = function(){
	var div_container = document.getElementById("height_map");	
	var context = height_canvas.getContext('2d');
	

	//height_canvas.height = document.getElementById("height_canvas").height;
	height_canvas.height = container_height;
	height_canvas.width = container_height;
	
    height_image = new Image();
	height_image.onload = function () {
		//height_canvas.height = height_image.naturalWidth;
		//height_canvas.width = height_image.naturalHeight;
	
		context.drawImage(height_image, 0, 0, height_image.width, height_image.height, 0,0, height_canvas.width, height_canvas.height);
		height_image.width = height_image.naturalWidth;
		height_image.height = height_image.naturalHeight;
		
		document.getElementById("size").value = "" +(height_image.naturalWidth) + " x " + (height_image.naturalHeight);
		
		renderNormalview_init();
			
		createNormalMap(); // height map was loaded... so create standard normal map!
		height_map.needsUpdate = true;

		setNormalSetting('strength', document.getElementById('strength_nmb').value);
		setNormalSetting('level', document.getElementById('level_nmb').value);
		setNormalSetting('blur_sharp', document.getElementById('blur_sharp_nmb').value);
		
		
		createDisplacementMap(document.getElementById('dm_contrast_nmb').value);
		setDisplacementScale(-document.getElementById('dm_strength_nmb').value);
		
		createAmbientOcclusionTexture();
		createSpecularTexture();
    };
	
    height_image.src = './images/standard_height.png';	
}


