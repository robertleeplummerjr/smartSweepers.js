(function (Brain) {
	"use strict";

	function randomClamped() {
		return Math.random() - Math.random();
	}

	Brain.Neuron = function(inputCount) {
		this.weights = [];

		for (var i = 0; i <= inputCount; i++) {
			// Create random weight between -1 and 1
			this.weights.push(randomClamped());
		}
	};
})(Brain);