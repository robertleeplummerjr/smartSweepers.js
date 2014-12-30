(function(Brain) {
	function NeuralNet(params) {
		// @TODO(richard-to): Also need to handle case where there are no hidden layers, which means linear regression?
		this.numInputs = params.numInputs;
		this.numOutputs = params.numOutputs;
		this.numHiddenLayers = params.numHidden;
		this.neuronsPerHiddenLayer = params.neuronsPerHiddenLayer;
		// Not really sure how to deal with bias? Why -1 for default?
		this.bias = params.bias;
		// Why 1 again?
		this.activationResponse = params.activationResponse;

		this.layers = [];

		this.createNet();
	}

	NeuralNet.prototype = {
		createNet: function() {
			if (this.numHiddenLayers > 0) {
				this.layers.push(new NeuronLayer(this.neuronsPerHiddenLayer, this.numInputs));
				for (var i = 0; i < this.numHiddenLayers - 1; i++) {
					this.layers.push(new NeuronLayer(
						this.neuronsPerHiddenLayer, this.neuronsPerHiddenLayer));
				}
				this.layers.push(
					new NeuronLayer(this.numInputs, this.neuronsPerHiddenLayer));
			} else {
				this.layers.push(new NeuronLayer(this.numOutputs, this.numInputs));
			}
		},

		// Looks like purpose for this method is
		// to get all the weights in a vector use in genetic algorithm?
		getWeights: function() {
			var weights = [];
			for (var i = 0; i < this.layers.length; i++) {
				for (var j = 0; j < this.layers[i].neurons.length; j++) {
					for (var h = 0; h < this.layers[i].neurons[j].weights.length; h++) {
						weight.push(this.layers[i].neurons[j].weights[h]);
					}
				}
			}
			return weights;
		},

		putWeights: function(weights) {
			for (var i = 0; i < this.layers.length; i++) {
				for (var j = 0; j < this.layers[i].neurons.length; j++) {
					for (var h = 0; h < this.layers[i].neurons[j].weights.length; h++) {
						this.layers[i].neurons[j].weights[h] = weights[h];
					}
				}
			}
		},

		getNumWeights: function() {
			var count = 0;
			for (var i = 0; i < this.layers.length; i++) {
				for (var j = 0; j < this.layers[i].neurons.length; j++) {
					count += this.layers[i].neurons[j].weights.length;
				}
			}
			return count;
		},

		// Looks like this is the important function that runs the neural network and gets our outputs
		update: function(inputs) {

			// This array keeps track of outputs after each layer
			var outputs = [];
			if (inputs.length != this.numInputs) {
				return outputs;
			}

			for (var i = 0; i < this.numHiddenLayers; i++) {
				// After the first layer, the inputs get set to the output
				// of previous layer
				if (i > 0) {
					inputs = outputs;
				}

				for (var j = 0; j < this.layers[i].neurons.length; j++) {
					// Correct term for this? Or is the result after going through Sigmoid?
					var activation = 0;
					for (var h = 0; h < this.layers[i].neurons[j].weights.length; h++) {
						// sum += wN * iN
						activation += this.layers[i].neurons[j].weights[h] * inputs[h];
					}
					activation += this.layers[i].neurons[j].weights[this.layers[i].neurons[j].weights.length - 1] * this.bias;
					outputs.push(this.sigmoid(activation, this.activationResponse));
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