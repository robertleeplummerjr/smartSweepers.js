(function(Brain) {
	"use strict";
	Brain.NeuronLayer = function(numNeurons, numInputs) {
		this.neurons = [];
		for (var i = 0; i < numNeurons; i++) {
			this.neurons.push(new Brain.Neuron(numInputs));
		}
	};
})(Brain);