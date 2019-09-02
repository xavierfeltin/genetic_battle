import { Injectable } from '@angular/core';
import { NetworkEngine } from '../engine/ia/network.engine';
import { RTNeuralNetwork } from '../ia/rt_neat/phenotype/neural-network';

@Injectable({
  providedIn: 'root'
})
export class NetworkVisuService {
  private visualizer: NetworkEngine = null;

  constructor() {
    this.visualizer = new NetworkEngine();
  }

  public getVisualizer(): NetworkEngine {
    return this.visualizer;
  }

  public setNeuralNetwork(nn: RTNeuralNetwork) {
    if (this.visualizer !== null) {
      this.visualizer.neuralNetwork = nn;
    } else {
      console.error('Visualizer is not defined');
    }    
  }
}
