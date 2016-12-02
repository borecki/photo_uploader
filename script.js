(function() {
	var imageUploader = {
		addPropertyToDropArea: function(e) {
			dropZoneArea.style.setProperty("border-color", "#373737", "important");
		},
		removePropertyFromDropArea: function(e) {
			dropZoneArea.style.setProperty("border-color", "#dddddd", "important");	
		},
		onDragOverActions: function(e) {
			e.preventDefault();
		},
		onDropActions: function(e) {
			dropZoneArea.style.setProperty("border-color", "#dddddd", "important");
			e.preventDefault();
			e.stopPropagation();
			transferedFilesQuantity = transferedFilesQuantity + e.dataTransfer.files.length;
			if(transferedFilesQuantity>6) {
				alert("The maximum quantity of transferred files are 6.");
				transferedFilesQuantity = transferedFilesQuantity - e.dataTransfer.files.length;
				return;
			}
			[].forEach.call(e.dataTransfer.files, function(file) {
				imageUploader.generateThumbnail(file);
			})
		},
		generateThumbnail: function(file) {
			var fileSize = file.size/1024;
			fileSize = Math.round(fileSize*100)/100;
			if(file.type.match("image.*")) {
				if(fileSize>=256) {
					alert("Invalid file size: " + file.name + ".\nMax size: 256 KB.");
					transferedFilesQuantity--;
					return;
				}
				var reader = new FileReader();	
					reader.onload = function() {
						singleImgCon = document.createElement('div');
						singleImgCon.dataset.content = "File name:\n "+file.name+"\nFile size:\n "+fileSize+" KB";	
						singleImgCon.classList.add("singleImg", "hvr-sweep-to-bottom");	
						img = new Image();
						img.src = this.result;
						singleImgCon.appendChild(img);
						imagesCon.appendChild(singleImgCon);		
					}
				reader.readAsDataURL(file);
				imageUploader.addFilesToUploadList(file);
			} else {
				alert("Invalid file extenstion: " + file.name + ".\nPermitted formats: jpg, jpeg, gif, png.");
				transferedFilesQuantity--;
				return;	
			}
		},
		addFilesToUploadList: function(file) {
			formData.append("images[]", file);
			addedFiles++;
		},
		fileInputActions: function() {
			var file = this.files[0];
			imageUploader.generateThumbnail(file);
		},
		sendFilesToServer: function() {
			if(addedFiles == 0) return;
			sendButton.onclick = null;
				
			ajaxRequest.open("POST", "uploader.php", true);
			
			ajaxRequest.onload = function(e) {
				serverResponse = JSON.parse( e.target.responseText);	
				imageUploader.generateLinkToImg(serverResponse.links);
			}
			ajaxRequest.send(formData);
			formData.delete('images[]');		
		},
		generateLinkToImg: function(links) {
			filesQuantity = links.length;
			[].forEach.call(links, function(singleLink) {	
				imageUploader.shortenUrl(singleLink);			
			})
		}, 
		showModal: function() {
			modal.style.display = "block";	
		},
		hideModal: function() {
			modal.style.display = "none";
			while (imagesCon.firstChild) {
				imagesCon.removeChild(imagesCon.firstChild);
			}
			while (modalBody.firstChild) {
				modalBody.removeChild(modalBody.firstChild);
			}
			sendButton.onclick = imageUploader.sendFilesToServer;
			progressBar.setAttribute("value", "0");
			progressSpan.innerHTML = "0%";
			addedFiles = 0;
			transferedFilesQuantity = 0;	
		},
		windowClickActions: function(event) {
			if (event.target == modal) {
				imageUploader.hideModal();
			}
		},
		shortenUrl: function(linkToImg) {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open("POST", "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyAjwmpIQ8946TGVBWCGquRj7LONedJSMBE", true);
			xmlHttp.setRequestHeader("Content-Type", "application/json; charset=utf-8");
			
			var req = new Object();
			req.longUrl = linkToImg;
			
			var jsonStr = JSON.stringify(req);
			
			xmlHttp.onload = function(e) {
				data = JSON.parse(e.target.response);
				data = data.id;
				linkInput = document.createElement('div');
				linkInput.innerHTML = data;
				modalBody.appendChild(linkInput);
				if(modalOperator >= filesQuantity) {
					imageUploader.showModal();	
				};
				modalOperator++;	
			}
			xmlHttp.send(jsonStr);
		},
		progressActions: function(e){
			if (e.lengthComputable) {
				var percent = (e.loaded / e.total) * 100;
				progressBar.setAttribute("value", percent);
				progressSpan.innerHTML = Math.round(percent)+ "%";
			}
		},
		init: function() {
			dropZoneCon = document.querySelector("#dropZoneContainer"),
			dropZoneArea = document.querySelector("#dropZone"),
			fileInput = document.querySelector("input[type='file']"),
			imagesCon = document.querySelector("#images"),
			imgCoverDiv = document.querySelectorAll(".hvr-sweep-to-bottom");
			sendButton = document.querySelector("#send");
			
			dropZoneArea.ondragenter = imageUploader.addPropertyToDropArea;
			dropZoneArea.ondragleave = imageUploader.removePropertyFromDropArea;
			dropZoneArea.ondragover = imageUploader.onDragOverActions; 
			dropZoneArea.ondrop = imageUploader.onDropActions;
			
			transferedFilesQuantity = 0;
			
			fileInput = document.querySelector("#file");
			fileInput.onchange = imageUploader.fileInputActions;
			
			sendButton.onclick = imageUploader.sendFilesToServer;
			
			modal = document.getElementById('myModal');
			modalBtn = document.getElementById("myBtn");
			modalClose = modal.getElementsByClassName("close")[0];
			modalClose.onclick = imageUploader.hideModal;
			modalBody = modal.querySelector('.modal-body');
			modalOperator = 1;
			filesQuantity = 0;
			window.onclick = imageUploader.windowClickActions;
			
			progressBar = document.querySelector('progress');
			progressSpan = document.querySelector('#progressContainer p span');
			
			ajaxRequest	= new XMLHttpRequest();
			ajaxRequest.upload.onprogress = imageUploader.progressActions;
			
			addedFiles = 0;
			formData = new FormData();
		}	
	}
	imageUploader.init();
})();