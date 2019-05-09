import { Component, OnInit } from '@angular/core';
import { GameEngine } from '../../engine/game.engine';
import { SimuInfoService } from '../../services/simu-info.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit  {
  private scene: GameEngine;

  constructor(private service: SimuInfoService) { }

  ngOnInit() {
    this.scene = this.service.getGame();
    this.scene.setCanvas('scene');
    this.scene.run();
  }
}
