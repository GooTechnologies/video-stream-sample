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
/**
 * Stream video in Goo Create!
 * 1. Upload a video to Create by dropping the file into the asset bin.
 * 2. Put it in the videoTexture slot in this script (this is needed, otherwise the video file won't get published).
 * 3. Publish.
 * 4. Copy the URL of the video in the published scene (check the network panel in Chrome Devtools).
 * 5. Paste the URL in the videoUrl parameter input.
 * 6. Set the texture as lazy load.
 * 7. Done!
 */

'use strict';

/* global goo */

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
		console.log('canplay');
		ctx.canPlay = true;
		ctx.video = video;
	};

	video.src = args.videoUrl;

	if(video.paused){
		console.log('Needs touch to start video');
	}

	ctx.listeners = {
		mousedown: function(){
			console.log('touchend');
			if(ctx.canPlay && !ctx.started){
				console.log('play()');
				video.play();
				video.width = video.videoWidth;
				video.height = video.videoHeight;
				var texture = new goo.Texture();
				texture.generateMipmaps = false;
				texture.minFilter = 'BilinearNoMipMaps';
				texture.setImage(video);
				ctx.entity.meshRendererComponent.materials[0].setTexture('DIFFUSE_MAP', texture);
				texture.updateCallback = function () {
					return !video.paused;
				};
				ctx.texture = texture;
				ctx.started = true;
				video.dataReady = true;
			}
		}
	};
	ctx.domElement.ontouchend = ctx.listeners.mousedown;
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
}];
```