initHeightMap();
initRenderer();
render();


function activate_texture(type){
	if (type == "normal"){
		document.getElementById('tab_btn_normal').disabled = true;
		document.getElementById('tab_btn_displace').disabled = false;
		//console.log("normal!");
		document.getElementById('normal_map').style.cssText = "";
		document.getElementById('normal_settings').style.cssText = "";
		
		document.getElementById('displacement_map').style.cssText = "display: none;";
		document.getElementById('displacement_settings').style.cssText = "display: none;";
	}
	
	else if (type == "displace"){
		document.getElementById('tab_btn_normal').disabled = false;
		document.getElementById('tab_btn_displace').disabled = true;
		
		document.getElementById('normal_map').style.cssText = "display: none;";
		document.getElementById('normal_settings').style.cssText = "display: none;";
		
		document.getElementById('displacement_map').style.cssText = "";
		document.getElementById('displacement_settings').style.cssText = "";
		//console.log("displace!");
	}
}


function setTexturePreview(canvas, canvas_preview, img_id,  width, height){
	var img = document.getElementById(img_id);
	
	img.src = canvas.toDataURL('image/jpeg');
	
	// set preview canvas	
	canvas_preview.width  = getNextPowerOf2(canvas.width);
	canvas_preview.height = getNextPowerOf2(canvas.height);
		
	
	img.onload = function(){
	
		var new_width  = getNextPowerOf2(width);
		var new_height = getNextPowerOf2(height);
		
		var ctx_preview = canvas_preview.getContext("2d");
		//ctx_normal_preview.clearRect(     0, 0, new_width, new_height);
		ctx_preview.drawImage(img, 0, 0, new_width, new_height);
		
		setRepeat(document.getElementById('repeat_sliderx').value, document.getElementById('repeat_slidery').value);
	}
}