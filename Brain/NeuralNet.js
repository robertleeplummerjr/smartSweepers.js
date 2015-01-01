(function(Brain) {
	"use strict";

	function NeuralNet(params) {
		this.params = params;

		this.numInputs = params.numInputs;
		this.numOutputs = params.numOutputs;
		this.numHiddenLayers = params.numHidden;
		this.neuronsPerHiddenLayer = params.neuronsPerHiddenLayer;

		this.layers = [];

		this.createNet();
	}

	NeuralNet.prototype = {
		/**
		 * this method builds the ANN. The weights are all initially set to
		 * random values -1 < w < 1
		 */
		createNet: function() {

			//create the layers of the network
			if (this.numHiddenLayers > 0) {
				//create first hidden layer
				this.layers.push(new Brain.NeuronLayer(this.neuronsPerHiddenLayer, this.numInputs));
				for (var i = 0; i < this.numHiddenLayers - 1; i++) {
					this.layers.push(new Brain.NeuronLayer(
						this.neuronsPerHiddenLayer, this.neuronsPerHiddenLayer));
				}

				//create output layer
				this.layers.push(
					new Brain.NeuronLayer(this.numOutputs, this.neuronsPerHiddenLayer));
			} else {
				//create output layer
				this.layers.push(new Brain.NeuronLayer(this.numOutputs, this.numInputs));
			}
		},

		/**
		 * returns a vector containing the weights
		 * @returns {Array}
		 */
		getWeights: function() {
			var weights = [],
				layer,
				neuron,
				i,
				j,
				k;

			//for each layer
			for (i = 0; i < this.numHiddenLayers + 1; i++) {
				layer = this.layers[i];

				//for each neuron
				for (j = 0; j < layer.neurons.length; j++) {
					neuron = layer.neurons[j];

					//for each weight
					for (k = 0; k < neuron.weights.length; k++) {
						weights.push(neuron.weights[k]);
					}
				}
			}
			return weights;
		},

		/**
		 * given a vector of doubles this function replaces the weights in the NN
		 * with the new values
		 * @param weights
		 */
		putWeights: function(weights) {

			var cWeight = 0,
				layer,
				neuron,
				i,
				j,
				k;

			//for each layer
			for (i = 0; i < this.numHiddenLayers + 1; i++) {
				layer = this.layers[i];

				//for each neuron
				for (j = 0; j < layer.neurons.length; j++) {
					neuron = layer.neurons[j];

					//for each weight
					for (k = 0; k < neuron.weights.length; k++) {
						neuron.weights[k] = weights[cWeight++];
					}
				}
			}
		},

		/**
		 * returns the total number of weights needed for the net
		 * @returns {number}
		 */
		getNumWeights: function() {
			var weights = 0,
				layer,
				neuron,
				i,
				j,
				k;

			//for each layer
			for (i = 0; i < this.layers.length; i++) {
				layer = this.layers[i];

				//for each neuron
				for (j = 0; j < layer.neurons.length; j++) {
					neuron = layer.neurons[j];

					//for each weight
					for (k = 0; k < neuron.weights.length; k++) {
						weights++;
					}
				}
			}

			return weights;
		},

		// Looks like this is the important function that runs the neural network and gets our outputs
		update: function(inputs) {
			//stores the resultant outputs from each layer
			var outputs = [],
				layer,
				neurons,
				neuron,
				weight = 0,
				netinput,
				numInputs,
				i,
				j,
				k;

			//first check that we have the correct amount of inputs
			if (inputs.length != this.numInputs) {
				//just return an empty vector if incorrect.
				return outputs;
			}

			//For each layer....
			for (i = 0; i < this.numHiddenLayers + 1; i++) {
				layer = this.layers[i];
				neurons = layer.neurons;
				// After the first layer, the inputs get set to the output
				// of previous layer
				if (i > 0) {
					//note: we clone the output so it isn't cleared after this step
					inputs = outputs.slice(0);
				}

				while(outputs.length > 0) {outputs.pop()}

				weight = 0;

				//for each neuron sum the (inputs * corresponding weights).Throw
				//the total at our sigmoid function to get the output.
				for (j = 0; j < neurons.length; j++) {
					neuron = neurons[j];
					netinput = 0;

					numInputs = neuron.weights.length * 1;

					//for each weight
					for (k = 0; k < numInputs - 1; k++) {

						//sum the weights x inputs
						netinput += neuron.weights[k] *
							inputs[weight++];
					}

					//add in the bias
					netinput += neuron.weights[numInputs - 1] *
						this.params.bias;

					//we can store the outputs from each layer as we generate them.
					//The combined activation is first filtered through the sigmoid
					//function
					outputs.push(this.sigmoid(netinput, this.params.activationResponse));

					weight = 0;
				}
			}

			return outputs;
		},

		// Sigmoid!!!
		sigmoid: function(netinput, response) {
			return (1 / (1 + Math.exp(-netinput / response)));
		}
	};

	Brain.NeuralNet = NeuralNet;
})(Brain);