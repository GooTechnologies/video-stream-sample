# video-stream-sample

A sample server for serving a Goo Create scene with streaming support.

# Install and run

You'll need [Node.js](http://nodejs.org).

To install and run the server:

```sh
npm install;
npm start;
```

## Goo Create video texture script

The following script can be used to put a video texture on a mesh. Follow the instructions carefully! Hopefully we'll soon fix the video loader in Goo Engine so you won't need this script.

```js
var setup = function (args, ctx) {
	var video = document.createElement('video');
	video.autoplay = true;
	video.loop = true;

	if (!video.canPlayType("video/mp4").match(/maybe|probably/i))	{
		console.error('mp4 is not supported');
	}

	video.onerror = function(){
		var err = "unknown error";
		switch(video.error.code){
			case 1: err = "video loading aborted"; break;
			case 2: err = "network loading error"; break;
			case 3: err = "video decoding failed / corrupted data or unsupported codec"; break;
			case 4: err = "video not supported"; break;
		}
		console.error("Error: " + err + " (errorcode="+video.error.code+")");
	};

	video.oncanplay = function(){
		// try to start playing - this may fail on some devices
		video.play();
	};
	video.src = args.videoUrl;

	video.width = video.videoWidth;
	video.height = video.videoHeight;
	var texture = new goo.Texture();
	texture.wrapT = texture.wrapS = 'EdgeClamp';
	texture.generateMipmaps = false;
	texture.minFilter = 'BilinearNoMipMaps';
	texture.setImage(video);
	ctx.entity.meshRendererComponent.materials[0].setTexture('DIFFUSE_MAP', texture);
	texture.updateCallback = function () {
		return !video.paused;
	};
	video.onprogress = function(){
		video.dataReady = true;
	};

	ctx.listeners = {
		touchend: function(){
			console.log("Got touchend, trying to play...");
			ctx.domElement.removeEventListener('touchend', ctx.listeners.touchend);
			video.play();
		}
	};
	for(var key in ctx.listeners){
		ctx.domElement.addEventListener(key, ctx.listeners[key]);
	}
};

var cleanup = function (args, ctx) {
	for(var key in ctx.listeners){
		ctx.domElement.removeEventListener(key, ctx.listeners[key]);
	}
};

var parameters = [{
	key: 'videoUrl',
	type: 'string',
	'default': ''
},{
	key: 'videoTexture',
	type: 'texture'
},{
	key: 'eventChannel',
	description: '',
	type: 'string',
	'default': 'videoPlay'
}];
```