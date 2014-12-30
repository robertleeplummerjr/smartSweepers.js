var NeuronLayer = function(numNeurons, numInputs) {
	this.neurons = [];
	for (var i = 0; i < numNeurons; i++) {
		this.neurons.push(new Neuron(numInputs));
	}
};