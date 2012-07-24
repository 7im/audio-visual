/**
*
* Loop Waveform Visualizer by Felix Turner
* www.airtight.cc
*
* Audio Reactive Waveform via Web Audio API.
*
*/



var elems = 100,
	barsHTML = '';

$('body').append('<p class="status">Freq Rate: <span id="freqRate"></span> : <span id="barHeight"></span></p>');
for (var i = elems - 1; i >= 0; i--) {
	barsHTML += '<div class="highFq"></div><div class="lowFq"></div>';
};
$('#container').append(barsHTML);

var windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2, container;
var buffer;
var audioBuffer;
var dropArea;
var audioContext;
var source;
var processor;
var analyser;
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
	document.addEventListener('mousemove', onDocumentMouseMove, false);

	onWindowResize(null);
	audioContext = new window.webkitAudioContext();
}

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

function onWindowResize(event) {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	var	barLeft = window.innerWidth / elems,
		barWidth = barLeft - 1,
		totalLeft;

	function updateWidth(i) {
		totalLeft = i * barLeft;
		$(this).css({
			width: barWidth,
			left: totalLeft
		});
	}

	$('#container').find('.highFq').each(updateWidth);
	$('#container').find('.lowFq').each(updateWidth);

}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	LoopVisualizer.update();

}

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

	$('#loading').show().text("loading...");

	var droppedFiles = evt.dataTransfer.files;

	var reader = new FileReader();

	reader.onload = function(fileEvent) {
		var data = fileEvent.target.result;
		initAudio(data);
	};

	reader.readAsArrayBuffer(droppedFiles[0]);
}

function onDocumentMouseMove(event) {
	// mouseX = (event.clientX - windowHalfX) * 2;
	// mouseY = (event.clientY - windowHalfY) * 2;
	mouseX = Math.round((event.clientX + windowHalfX) / 2 / window.innerWidth * 100);
	mouseY = Math.round((event.clientY + windowHalfY) / 2 / window.innerHeight * 100);
	console.log(mouseX);
	console.log(mouseY);
	$('.tunnelContainer').css({
		'-webkit-perspective-origin-x': mouseX + '%',
		'-webkit-perspective-origin-y': mouseY + '%'
	});
}

function initAudio(data) {
	source = audioContext.createBufferSource();

	if(audioContext.decodeAudioData) {
		audioContext.decodeAudioData(data, function(buffer) {
			source.buffer = buffer;
			createAudio();
		}, function(e) {
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

	if (!started) {
		started = true;
		animate();
	}
}
