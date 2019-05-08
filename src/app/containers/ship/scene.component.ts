import { Component, OnInit, AfterViewInit, Input, NgZone } from '@angular/core';
import { GameEngine } from '../../engine/game.engine';
import { SimuInfoService } from '../../services/simu-info.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css'],
  providers:  []
})
export class SceneComponent implements OnInit  {
  private scene: GameEngine;
  private nbShips: number;
  private nbMissiles: number;
  private nbHealth: number;
  private ships: number[][];
  private healths: (number|boolean)[][];
  private missiles: number[][];

  constructor(private service: SimuInfoService, private ngZone: NgZone) { }

  ngOnInit() {
     // this.configureShips();
    this.service.getNbShips().subscribe((nbShips: number) => this.nbShips = nbShips); 
    this.service.getNbHealth().subscribe((nbHealth: number) => this.nbHealth = nbHealth); 
    this.service.getNbMissiles().subscribe((nbMissiles: number) => this.nbMissiles = nbMissiles);
    this.service.getCoordShips().subscribe((ships: number[][]) => this.ships = ships);
    this.service.getMissiles().subscribe((missiles: number[][]) => this.missiles = missiles);
    this.service.getHealths().subscribe((healths: (number|boolean)[][]) => this.healths = healths);
    
    this.scene = this.service.getGame();
    this.scene.setCanvas('scene');
    this.scene.run();
  }

  ngOnChanges(changes) {    
    if (this.scene) {
      //Manage update game state
      if(changes.scene === true) {
        
      }
    }
  }
}
 