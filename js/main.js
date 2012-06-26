/**
*
* Loop Waveform Visualizer by Felix Turner
* www.airtight.cc
*
* Audio Reactive Waveform via Web Audio API.
*
*/

var mouseX = 0, mouseY = 0, windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2, camera, scene, renderer, material, container;
var ringcount = 560;
var source;
var analyser;
var buffer;
var audioBuffer;
var dropArea;
var audioContext;
var source;
var processor;
var analyser;
var xhr;
var started = false;

$(document).ready(function() {

	//Chrome is only browser to currently support Web Audio API
	var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
	var is_webgl = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();

	if(!is_chrome){
		$('#loading').html("This demo requires <a href='https://www.google.com/chrome'>Google Chrome</a>.");
	} else if(!is_webgl){
		$('#loading').html('Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>.<br />' +
		'Find out how to get it <a href="http://get.webgl.org/">here</a>, or try restarting your browser.');
	}else {
		$('#loading').html('drag audio source here...');
		init();
	}

});

function init() {

	//init 3D scene
	container = document.createElement('div');
	document.body.appendChild(container);
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000000);
	camera.position.z = 2000;
	scene = new THREE.Scene();
	scene.add(camera);
	renderer = new THREE.WebGLRenderer({
		antialias : false,
		sortObjects : false
	});
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);

	// stop the user getting a text cursor
	document.onselectStart = function() {
		return false;
	};

	//init listeners
	//$("#loadSample").click( loadSampleAudio);
	// $(document).mousemove(onDocumentMouseMove);
	$(window).resize(onWindowResize);
	document.addEventListener('drop', onDocumentDrop, false);
	document.addEventListener('dragover', onDocumentDragOver, false);

	onWindowResize(null);
	audioContext = new window.webkitAudioContext();

	// Bind form control elements event
	bindControl();
}

/*
function loadSampleAudio() {
	$('#loading').text("loading...");

	source = audioContext.createBufferSource();
	analyser = audioContext.createAnalyser();
	analyser.fftSize = 1024;

	// Connect audio processing graph
	source.connect(analyser);
	analyser.connect(audioContext.destination);

	loadAudioBuffer("audio/Beytah_-_10_-_Screw_Base.mp3");
}
*/


function loadAudioBuffer(url) {
	// Load asynchronously
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	request.onload = function() {
		audioBuffer = audioContext.createBuffer(request.response, false );
		finishLoad();
	};

	request.send();
}

function finishLoad() {
	source.buffer = audioBuffer;
	source.looping = true;
	source.noteOn(0.0);
	startViz();
}

// TO REMOVE
// function onDocumentMouseMove(event) {
// 	mouseX = (event.clientX - windowHalfX)*2;
// 	mouseY = (event.clientY - windowHalfY)*2;
// }

function onWindowResize(event) {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	LoopVisualizer.update({
		ringcount: ringcount
	});

	var xrot = mouseX * Math.PI*2 + Math.PI;
	var yrot = mouseY * Math.PI*2 + Math.PI;

	LoopVisualizer.loopHolder.rotation.x += (-yrot - LoopVisualizer.loopHolder.rotation.x) * 0.3;
	LoopVisualizer.loopHolder.rotation.y += (xrot - LoopVisualizer.loopHolder.rotation.y) * 0.3;

	renderer.render(scene, camera);
}

// $(window).mousewheel(function(event, delta) {
// 	//set camera Z
// 	camera.position.z -= delta * 50;
// });

function onDocumentDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	return false;
}

function onDocumentDrop(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	//clean up previous mp3
	if (source) source.disconnect();
	LoopVisualizer.remove();

	$('#loading').show();
	$('#loading').text("loading...");

	var droppedFiles = evt.dataTransfer.files;

	var reader = new FileReader();

	reader.onload = function(fileEvent) {
		var data = fileEvent.target.result;
		initAudio(data);
	};

	reader.readAsArrayBuffer(droppedFiles[0]);

}

function initAudio(data) {
	source = audioContext.createBufferSource();

	if(audioContext.decodeAudioData) {
		audioContext.decodeAudioData(data, function(buffer) {
			source.buffer = buffer;
			createAudio();
		}, function(e) {
			console.log(e);
			$('#loading').text("cannot decode mp3");
		});
	} else {
		source.buffer = audioContext.createBuffer(data, false );
		createAudio();
	}
}


function createAudio() {
	processor = audioContext.createJavaScriptNode(2048 , 1 , 1 );
	//processor.onaudioprocess = processAudio;

	analyser = audioContext.createAnalyser();

	source.connect(audioContext.destination);
	source.connect(analyser);

	analyser.connect(processor);
	processor.connect(audioContext.destination);

	source.noteOn(0);

	startViz();
}

function startViz(){
	$('#loading').hide();
	LoopVisualizer.init();

	if (!started){
		started = true;
		animate();
	}
}

function bindControl() {
	$('#cameraDistance').on('change', function() {
		camera.position.z = this.value;
	});
	$('#cameraX').on('change', function() {
		mouseX = this.value;
	});
	$('#cameraY').on('change', function() {
		mouseY = this.value;
	});
	$('#ringcount').on('change', function() {
		ringcount = this.value;
	});
}
