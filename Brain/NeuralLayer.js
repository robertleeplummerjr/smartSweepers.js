(function(Brain) {
	"use strict";
	Brain.NeuronLayer = function(neuronCount, inputCount) {
		this.neurons = [];
		for (var i = 0; i < neuronCount; i++) {
			this.neurons.push(new Brain.Neuron(inputCount));
		}
	};
})(Brain);