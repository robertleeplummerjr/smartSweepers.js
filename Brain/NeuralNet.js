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
					new Brain.NeuronLayer(this.numInputs, this.neuronsPerHiddenLayer));
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
				i,
				j,
				k;

			for (i = 0; i < this.layers.length; i++) {
				for (j = 0; j < this.layers[i].neurons.length; j++) {
					for (k = 0; k < this.layers[i].neurons[j].weights.length; k++) {
						weights.push(this.layers[i].neurons[j].weights[k]);
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
			//for each layer
			for (var i = 0; i < this.layers.length; i++) {
				//for each neuron
				for (var j = 0; j < this.layers[i].neurons.length; j++) {
					//for each weight
					for (var k = 0; k < this.layers[i].neurons[j].weights.length; k++) {
						this.layers[i].neurons[j].weights[k] = weights[k];
					}
				}
			}
		},

		/**
		 * returns the total number of weights needed for the net
		 * @returns {number}
		 */
		getNumWeights: function() {
			var weights = 0;

			//for each layer
			for (var i = 0; i < this.layers.length; i++) {
				//for each neuron
				for (var j = 0; j < this.layers[i].neurons.length; j++) {
					//for each weight
					for (var k = 0; k < this.layers[i].neurons[j].weights.length; k++) {
						weights += this.layers[i].neurons[j].weights.length;
					}
				}
			}
			return weights;
		},

		// Looks like this is the important function that runs the neural network and gets our outputs
		update: function(inputs) {

			//stores the resultant outputs from each layer
			var outputs = [],
				output,
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
			for (i = 0; i < this.numHiddenLayers; i++) {
				// After the first layer, the inputs get set to the output
				// of previous layer
				if (i > 0) {
					inputs = outputs;
				}

				while(outputs.length > 0) {outputs.pop()}
				weight = 0;

				//for each neuron sum the (inputs * corresponding weights).Throw
				//the total at our sigmoid function to get the output.
				for (j = 0; j < this.layers[i].neurons.length; j++) {
					netinput = 0;

					numInputs = this.layers[i].neurons[j].weights.length * 1;

					//for each weight
					for (k = 0; k < numInputs - 1; k++) {
						//sum the weights x inputs
						netinput += this.layers[i].neurons[j].weights[k] *
							inputs[weight++];
					}

					//add in the bias
					netinput += this.layers[i].neurons[j].weights[numInputs - 1] *
						this.params.bias;

					//we can store the outputs from each layer as we generate them.
					//The combined activation is first filtered through the sigmoid
					//function
					output = this.sigmoid(netinput, this.params.activationResponse);
					if (NeuralNet.myBrain === this) {
						console.log(output);
					}
					outputs.push(output * 1);

					weight = 0;
				}
			}

			if (NeuralNet.myBrian === undefined) {
				NeuralNet.myBrain = this;
			}

			if (NeuralNet.myBrain === this) {
				//console.log(outputs);
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