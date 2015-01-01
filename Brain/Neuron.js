(function (Brain) {
	"use strict";

	function randomClamped() {
		return Math.random() - Math.random();
	}

	Brain.Neuron = function(numInputs) {
		this.weights = [];

		for (var i = 0; i <= numInputs; i++) {
			// Create random weight between -1 and 1
			this.weights.push(randomClamped());
		}
	};
})(Brain);