import { Injectable } from '@angular/core';
import { NetworkEngine } from '../engine/ia/network.engine';

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
}
