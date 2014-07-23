initHeightMap();
initRenderer();
render();


function activate_texture(type){
	if (type == "normal"){
		document.getElementById('tab_btn_normal').disabled = true;
		document.getElementById('tab_btn_displace').disabled = false;
		document.getElementById('tab_btn_ao').disabled = false;
		//console.log("normal!");
		document.getElementById('normal_map').style.cssText = "";
		document.getElementById('normal_settings').style.cssText = "";
		
		document.getElementById('displacement_map').style.cssText = "display: none;";
		document.getElementById('displacement_settings').style.cssText = "display: none;";
		
		document.getElementById('ao_map').style.cssText = "display: none;";
		document.getElementById('ao_settings').style.cssText = "display: none;";
	}
	
	else if (type == "displace"){
		document.getElementById('tab_btn_normal').disabled = false;
		document.getElementById('tab_btn_displace').disabled = true;
		document.getElementById('tab_btn_ao').disabled = false;
		
		document.getElementById('normal_map').style.cssText = "display: none;";
		document.getElementById('normal_settings').style.cssText = "display: none;";
		
		document.getElementById('displacement_map').style.cssText = "";
		document.getElementById('displacement_settings').style.cssText = "";
		
		document.getElementById('ao_map').style.cssText = "display: none;";
		document.getElementById('ao_settings').style.cssText = "display: none;";
		//console.log("displace!");
	}
	else if (type == "ao"){
		document.getElementById('tab_btn_normal').disabled = false;
		document.getElementById('tab_btn_displace').disabled = false;
		document.getElementById('tab_btn_ao').disabled = true;
		
		document.getElementById('normal_map').style.cssText = "display: none;";
		document.getElementById('normal_settings').style.cssText = "display: none;";
		
		document.getElementById('displacement_map').style.cssText = "display: none;";
		document.getElementById('displacement_settings').style.cssText = "display: none;";
		
		document.getElementById('ao_map').style.cssText = "";
		document.getElementById('ao_settings').style.cssText = "";
		//console.log("displace!");
	}
}


function setTexturePreview(canvas, img_id,  width, height){
	var img = document.getElementById(img_id);
	
	img.src = canvas.toDataURL('image/jpeg');
	
	// set preview canvas	
	canvas.width  = getNextPowerOf2(canvas.width);
	canvas.height = getNextPowerOf2(canvas.height);
		
	
	img.onload = function(){
	
		var new_width  = getNextPowerOf2(width);
		var new_height = getNextPowerOf2(height);
		
		var ctx_preview = canvas.getContext("2d");
		//ctx_normal_preview.clearRect(     0, 0, new_width, new_height);
		ctx_preview.drawImage(img, 0, 0, new_width, new_height);
		
		setRepeat(document.getElementById('repeat_sliderx').value, document.getElementById('repeat_slidery').value);
	}
}


var button = document.getElementById('download');
button.addEventListener('click', function (e) {
	
	var filesize = 0;
	var qual = 0.9;
	var pic;
	
	var canvas;
	if (document.getElementById('normal_map').style.cssText != "display: none;"){
		canvas = normal_canvas;
		button.download="NormalMap.jpg";
	}
	else if (document.getElementById('displacement_map').style.cssText != "display: none;"){
		canvas = displacement_canvas;
		button.download="DisplacementMap.jpg";
	}
	
	
	// reduce file size so that it can be downloaded
	do{
		pic = canvas.toDataURL('image/jpeg', qual);
		filesize = pic.length;
		//console.log("size of pic: " + filesize); 
		qual -= 0.1;
	}while(filesize >= 2000000);
	//pic.src.replace("image/png", "image/octet-stream");
	
    button.href = pic;
});
