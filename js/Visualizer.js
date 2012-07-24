var LoopVisualizer = (function() {
	
	var RINGCOUNT = 560;
	var SEPARATION = 30;
	var INIT_RADIUS = 50;
	var SEGMENTS = 256;
	var VOL_SENS = 2;

	var currentRingCount;
	var rings = [];
	var geoms = [];
	var materials = [];
	var levels = [];
	var waves = [];
	var colors = [];
	var freqByteData;
	var timeByteData;
	var eleCount = 0;


	function init() {

		// INIT audio in
		freqByteData = new Uint8Array(analyser.frequencyBinCount);
		timeByteData = new Uint8Array(analyser.frequencyBinCount);

		var emptyBinData = [];
		for(var j = 0; j < SEGMENTS; j++) {
			emptyBinData.push(0);
		}

	}

	function remove(from, to) {

		// if (typeof from === 'number' && typeof to === 'number') {
		// 	for(; from < to; from++) {
		// 		loopHolder.remove(rings[from]);
		// 	}
		// } else if (loopHolder) {
		// 	for (var i = 0; i < RINGCOUNT; i++) {
		// 		loopHolder.remove(rings[i]);
		// 	}
		// }
	}

	function update() {

		analyser.smoothingTimeConstant = 0.1;
		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);
		
		//get average level
		var length = freqByteData.length;
		var eleLength = $(".highFq").length;
		var sum = 0;
		
		for(var j = 0; j < length; ++j) {
			sum += freqByteData[j];
		}
		var aveLevel = sum / length;
		var scaled_average = (aveLevel / 256) * VOL_SENS; //256 the highest a level can be?

		var colorInt = parseInt(scaled_average * 1000);
		
		$('#freqRate').html(colorInt);
		  
		 var cssObj = {
			'font-weight' : '',
			// Blue
			// 'background-color' : 'rgb(0,40, ' + colorInt +')'
			// Red
			'background-color' : 'rgb(' + colorInt +', 40, 0)'
		};
		
		if (eleCount < eleLength){
			eleCount = eleCount + 1
		} else {
			eleCount = 0;
		}
		
		var highFqBar = colorInt + 50,
			lowFqBar = colorInt - 10
		
		$('#barHeight').html(highFqBar);
		
		$('.highFq:eq(' + eleCount + ')')
			.css(cssObj)
			.animate({
				opacity: .9,
				//left: '+=50',
				height: highFqBar
			}, 0, function() {
				console.log(highFqBar);
				console.log(colorInt);
				// Animation complete.
				$(this).animate({
					opacity: .9,
					//left: '+=50',
					height: 60
				}, 4000, function() {
					//callback
				});
			});
		
		$('.lowFq:eq(' + eleCount + ')').animate({
			opacity: .9,
			//left: '+=50',
			height: lowFqBar
		}, 0, function() {
			// Animation complete.
			$(this).animate({
				//left: '+=50',
				height: 40
			}, 1000, function() {
				//callback
			});
		});
		
	}

	return {
		init:init,
		update:update,
		remove:remove
	};
	}());