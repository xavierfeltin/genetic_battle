import { Component, OnInit } from '@angular/core';
import { NetworkEngine } from '../../engine/ia/network.engine';
import { NetworkVisuService } from '../../services/network-visu.service';
import { SimuInfoService } from 'src/app/services/simu-info.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-network-visualization',
  templateUrl: './network-visualization.component.html',
  styleUrls: ['./network-visualization.component.css']
})
export class NetworkVisualizationComponent implements OnInit {
    private scene: NetworkEngine;
    private subscription: Subscription;
    
    constructor(private serviceSimu: SimuInfoService,
                private serviceNetwork: NetworkVisuService) { }

    ngOnInit() {
      this.scene = this.serviceNetwork.getVisualizer();
      this.scene.setCanvas('visualizer');
      this.scene.run();

      this.subscription = this.serviceSimu.getNeuralNetwork().subscribe(nn => {
        this.serviceNetwork.setNeuralNetwork(nn);
      });
    }

    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
}
