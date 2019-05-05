import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SimuInfoService } from '../../services/simu-info.service';
import { Ship } from '../../models/ship.model';

@Component({
  selector: 'app-ship',
  templateUrl: './ship.component.html',
  styleUrls: ['./ship.component.css']
})
export class ShipComponent implements OnInit, OnChanges {
  @Input() ship: Ship = null;
  @Input() name: string = '';

  private id: number = -1; 
  private age: number = 0;
  private fovAngle: number = 0;
  private fovLen: number = 0;
  private radar: number = 0;
  private life: number = 0;
  private fireRate: string = '0';
  private pctChildren: number = 0;
  private pctClones: number = 0;
  private nbTotalChildren: number = 0;
  private attractHealth: string = '0.0000';
  private attractShip: string = '0.0000';
  private attractMissile: string = '0.0000';

 
  constructor() { }

  ngOnInit() {
    /*
    if (this.ship !== null) {
      this.id = this.ship.id;
      this.age = Math.round(this.ship.getAge() / 30);
      this.fovAngle = Math.round(this.ship.getFOV());
      this.fovLen = Math.round(this.ship.getFOVLen());
      this.radar = Math.round(this.ship.getRadarLen());
      this.life = this.ship.getLife();
      this.speed = Math.round(this.ship.velo.norm);
    }
    */
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    
    const ship: Ship = changes.ship.currentValue as Ship; 
    if (ship !== undefined) {
      this.id = ship.id;
      this.age = Math.round(ship.getAge() / 30);
      this.fovAngle = Math.round(ship.getFOV());
      this.fovLen = Math.round(ship.getFOVLen());
      this.radar = Math.round(ship.getRadarLen());
      this.life = ship.getLife();
      this.fireRate = (30 / ship.getFireRate()).toPrecision(2);

      this.attractHealth = ship.getHealthAttraction().toFixed(4);
      this.attractMissile = ship.getMissileshAttraction().toFixed(4);
      this.attractShip = ship.getShipsAttraction().toFixed(4);

      const nbClones = this.ship.getNbClones();
      const nbChildren = this.ship.getNbChildren();
      this.nbTotalChildren = nbClones + nbChildren;

      if (this.nbTotalChildren !== 0) {
        this.pctClones = Math.round((nbClones / this.nbTotalChildren) * 100);
        this.pctChildren = Math.round((nbChildren / this.nbTotalChildren) * 100);
      }
    }
  }   
}
