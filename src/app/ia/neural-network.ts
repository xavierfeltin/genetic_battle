import { Matrix } from './matrix';

export class Activation {
  static sigmoid(x: number): number {
      return 1 / (1 + Math.exp(-x));
  }

  static tanh(x: number): number {
      return Math.tanh(x);
  }

  static softmax(inputs: number[]): number[] {
    let sum = 0;
    for (const x of inputs) {
      sum += Math.exp(x);
    }

    const scores = [];
    for (const x of inputs) {
      scores.push(Math.exp(x) / sum);
    }
    return scores;
  }
}

export abstract class NeuralNetwork {

  // neurons is a 1D-array of activated neurons
  public static activateOutput(neurons: Matrix): number[] {
    let output = [];
    if (neurons.rows === 1) {
        output.push(Activation.tanh(neurons.toArray()[0])); // tanh(sum of neurons connected to this output)
    } else {
        output = Activation.softmax(neurons.toArray());
    }
    return output;
  }

  public abstract feedForward(inputArr: number[]): number[][];
  public abstract getNbCoefficients(): number;
}
