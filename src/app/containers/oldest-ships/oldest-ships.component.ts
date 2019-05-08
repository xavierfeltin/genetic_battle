import { Component, OnInit } from '@angular/core';
import { SimuInfoService } from '../../services/simu-info.service';
import { Ship } from '../../models/ship.model';
import { Point, Stat } from '../../tools/statistics.tools';
import { Observable, of, from } from 'rxjs';

@Component({
  selector: 'app-oldest-ships',
  templateUrl: './oldest-ships.component.html',
  styleUrls: ['./oldest-ships.component.css']
})
export class OldestShipsComponent implements OnInit{
  private static readonly MAX_POP = 50;
  private oldestShip: Ship;
  private aliveOldestShip: Ship;
  private elapsedTime: number;
  private population: Point[] = []; 
  private dataShipFOV: number[];
  private classesShipFOV: string[];
  private dataShipRadar: number[];
  private classesShipRadar: string[];

  constructor(private service: SimuInfoService) { }

  ngOnInit() {
    this.service.getOldestShip().subscribe((ship: Ship) => this.oldestShip = ship.copy());
    this.service.getAliveOldestShip().subscribe((ship: Ship) => this.aliveOldestShip = ship.copy());
    this.service.getElapsedTimeInSeconds().subscribe((time: number) => this.elapsedTime = time);
    
    this.service.getNbShips().subscribe(nbShip => {
      const point: Point = {
        data: nbShip,
        stamp: this.formatTime()
      };
      this.addData(point);
    });
    
    this.service.getShips().subscribe(ships => {
      this.classesShipFOV = Stat.getClasses(Ship.MIN_ANGLE_FOV, Ship.MAX_ANGLE_FOV, 10, 1);
      this.dataShipFOV = Stat.countByClasses(ships.map(ship => ship.getFOV()), Ship.MIN_ANGLE_FOV, Ship.MAX_ANGLE_FOV, 10, 1);
      
      this.classesShipRadar = Stat.getClasses(Ship.MIN_LENGTH_RADAR, Ship.MAX_LENGTH_RADAR, 10, 1);
      this.dataShipRadar = Stat.countByClasses(ships.map(ship => ship.getRadarLen()), Ship.MIN_LENGTH_RADAR, Ship.MAX_LENGTH_RADAR, 10, 1);
    });

  }

  public formatTime(): string {
    const sec = this.elapsedTime % 60;
    const mn = Math.floor(this.elapsedTime / 60) % 60;
    const hh = Math.floor(this.elapsedTime / 3600);
    return hh.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) 
      + ' : ' + mn.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) 
      + ' : ' + sec.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}); 
  }

  addData(point: Point) {
    this.population = [...this.population, point];
    if (this.population.length > OldestShipsComponent.MAX_POP) {
      const _ = this.population.shift();
    }    
  }

  public getPopulation$(): Observable<Point[]> {
    return of(this.population);
  }

  public getDataFOV$(): Observable<number[]> {
    return of(this.dataShipFOV);
  }

  public getLabelsFOV$(): Observable<string[]> {
    return of(this.classesShipFOV);
  }

  public getDataRadar$(): Observable<number[]> {
    return of(this.dataShipRadar);
  }

  public getLabelsRadar$(): Observable<string[]> {
    return of(this.classesShipRadar);
  }
}
