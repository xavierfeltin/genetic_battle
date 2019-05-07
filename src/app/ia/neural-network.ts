import { Matrix } from './matrix';

export class Activation {
    static sigmoid(x: number): number {
        return 1 / (1 + Math.exp(-x));
    }
      
    static tanh(x: number): number {
        return Math.tanh(x);
    }
}

export class NeuralNetwork {
  // Implementation of multiperceptron for neuroevolution
  // No backpropagation and learning rate
  
  // Number of neurons of each layer
  private nIn: number;
  private nHid: number[];
  private nOut: number;
  private nLayer: number;

  // Weights (full connexions between two layers of neurons)
  private HHWeights: Matrix[]; // N Input - Hidden and Hidden - Hidden 
  private HOWeights: Matrix; // Hidden - Output
  
  // Biases (1D matrix)
  private HBias: Matrix[];
  private OBias: Matrix;

  constructor(nInput: number, nHidden: number[], nOutput: number) {
    this.nIn = nInput;
    this.nHid = [...nHidden];
    this.nOut = nOutput;
    this.nLayer = nHidden.length;

    for(let i = 0; i < this.nLayer-1; i++) {
      if (i < this.nLayer-1 ) {
        const weights = Matrix.random(nHidden[i+1], nHidden[i]);
        this.HHWeights.push(weights);
      }

      const bias = Matrix.random(nHidden[i], 1);
      this.HBias.push(bias);
    }
    
    this.HOWeights = Matrix.random(nOutput, nHidden[this.nLayer-1]);
    this.OBias = Matrix.random(nOutput, 1);
  }

  feedForward(inputArr: number[]): number[] {
    const input = Matrix.fromArray(inputArr);

    let hidden: Matrix = null;
    for (let i = 0; i < this.nLayer; i++) {
      // generating hidden inputs
      if (i === 0) {
        hidden = Matrix.product(this.HHWeights[i], input);
      }
      else {
        hidden = Matrix.product(this.HHWeights[i], hidden);
      }
      
      hidden.add(this.HBias[i]);

      // activation function for hidden nodes
      this.activate(hidden);
    }

    // generatin hidden outputs
    const output = Matrix.product(this.HOWeights, hidden);
    output.add(this.OBias);

    // activation function for output nodes
    this.activate(output);

    //generating output array
    return output.toArray();
  }

  private activate(neurons: Matrix) {
    for (let i = 0; i < neurons.rows; i++) {
      for (let j = 0; j < neurons.columns; j++) {
        const val = neurons.values[i][j];
        neurons.values[i][j] = Activation.sigmoid(val);
      }
    }
  }
}