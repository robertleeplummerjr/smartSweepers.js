var Neuron = function(numInputs) {
	this.weights = [];
	for (var i = 0; i < numInputs; i++) {
		// Create random weight between -1 and 1
		this.weights.push(Math.random() - Math.random());
	}
};