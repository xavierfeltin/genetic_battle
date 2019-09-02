import { Component, OnInit } from '@angular/core';
import { NetworkEngine } from '../../engine/ia/network.engine';
import { NetworkVisuService } from '../../services/network-visu.service';

@Component({
  selector: 'app-network-visualization',
  templateUrl: './network-visualization.component.html',
  styleUrls: ['./network-visualization.component.css']
})
export class NetworkVisualizationComponent implements OnInit {
    private scene: NetworkEngine;
    constructor(private service: NetworkVisuService) { }

    ngOnInit() {
        this.scene = this.service.getVisualizer();
        this.scene.setCanvas('visualizer');
        this.scene.run();
    }
}
