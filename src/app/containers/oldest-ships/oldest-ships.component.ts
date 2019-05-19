import { Component, OnInit } from '@angular/core';
import { SimuInfoService } from '../../services/simu-info.service';
import { Ship } from '../../models/ship.model';
import { Point, Stat } from '../../tools/statistics.tools';
import { Observable, of } from 'rxjs';
import { MyMath } from '../../tools/math.tools';

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

  private dataShipFOV: number[][] = [];
  private classesShipFOV: string[] = [];

  private dataShipRadar: number[][] = [];
  private classesShipRadar: string[] = [];

  private dataShipFire: number[][] = [];
  private classesShipFire: string[] = [];

  private dataShipAttractions: number[][] = [];
  private classesShipAttractions: string[] = [];
  private titlesShipAttractions: string[] = [];

  private dataOldestShips: number[][] = [];
  private axisOldestShips: string[] = ['Missile Attraction', 'Health Attraction', 'Ship Attraction', 'Center Attraction', 'Fire Rate', 'Radar Length', 'FOV Angle'];
  private titlesOldestShips: string[] = ['Alive Oldest Ship'];

  constructor(private service: SimuInfoService) { }

  ngOnInit() {
    this.service.getOldestShip().subscribe((ship: Ship) => this.oldestShip = ship.copy());
    this.service.getAliveOldestShip().subscribe((ship: Ship) => {
      //this.aliveOldestShip = ship.copy();
      this.dataOldestShips = [];
      const data = [];
      data.push(MyMath.map(ship.getMissileshAttraction(), Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, 0, 100));
      data.push(MyMath.map(ship.getHealthAttraction(), Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, 0, 100));
      data.push(MyMath.map(ship.getShipsAttraction(), Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, 0, 100));
      data.push(MyMath.map(ship.getCenterAttraction(), Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, 0, 100));
      data.push(MyMath.map(ship.getFireRate(), Ship.MIN_FIRE_RATE, Ship.MAX_FIRE_RATE, 0, 100));
      data.push(MyMath.map(ship.getRadarLen(), Ship.MIN_LENGTH_RADAR, Ship.MAX_LENGTH_RADAR, 0, 100));
      data.push(MyMath.map(ship.getFOV(), Ship.MIN_ANGLE_FOV, Ship.MAX_ANGLE_FOV, 0, 100));
      this.dataOldestShips.push(data);
    });

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
      this.dataShipFOV = [];
      this.dataShipFOV.push(Stat.countByClasses(ships.map(ship => ship.getFOV()), Ship.MIN_ANGLE_FOV, Ship.MAX_ANGLE_FOV, 10, 1));

      this.classesShipRadar = Stat.getClasses(Ship.MIN_LENGTH_RADAR, Ship.MAX_LENGTH_RADAR, 10, 1);
      this.dataShipRadar = [];
      this.dataShipRadar.push(Stat.countByClasses(ships.map(ship => ship.getRadarLen()),
        Ship.MIN_LENGTH_RADAR, Ship.MAX_LENGTH_RADAR, 10, 1));
      
      this.classesShipFire = Stat.getClasses(Ship.MIN_FIRE_RATE, Ship.MAX_FIRE_RATE, 10, 1);
      this.dataShipFire = [];
      this.dataShipFire.push(Stat.countByClasses(ships.map(ship => ship.getFireRate()), Ship.MIN_FIRE_RATE, Ship.MAX_FIRE_RATE, 10, 1));

      this.classesShipAttractions = Stat.getClasses(Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, 10, 0.01);
      this.dataShipAttractions = [];
      this.dataShipAttractions.push(Stat.countByClasses(ships.map(ship => ship.getHealthAttraction()),
        Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, 10, 0.01));
      this.dataShipAttractions.push(Stat.countByClasses(ships.map(ship => ship.getMissileshAttraction()),
        Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, 10, 0.01));
      this.dataShipAttractions.push(Stat.countByClasses(ships.map(ship => ship.getShipsAttraction()),
        Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, 10, 0.01));
      this.dataShipAttractions.push(Stat.countByClasses(ships.map(ship => ship.getCenterAttraction()),
        Ship.MIN_ATTRACTION, Ship.MAX_ATTRACTION, 10, 0.01));
      this.titlesShipAttractions = ['Health', 'Missiles', 'Ships', 'Center'];
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

  public getDataFOV$(): Observable<number[][]> {
    return of(this.dataShipFOV);
  }

  public getLabelsFOV$(): Observable<string[]> {
    return of(this.classesShipFOV);
  }

  public getDataRadar$(): Observable<number[][]> {
    return of(this.dataShipRadar);
  }

  public getLabelsRadar$(): Observable<string[]> {
    return of(this.classesShipRadar);
  }

  public getDataFire$(): Observable<number[][]> {
    return of(this.dataShipFire);
  }

  public getLabelsFire$(): Observable<string[]> {
    return of(this.classesShipFire);
  }

  public getDataShipAttractions$(): Observable<number[][]> {
    return of(this.dataShipAttractions);
  }

  public getLabelsShipAttractions$(): Observable<string[]> {
    return of(this.classesShipAttractions);
  }

  public getSerieTitlesShipAttractions$(): Observable<string[]> {
    return of(this.titlesShipAttractions);
  }

  public getDataOldestShips$(): Observable<number[][]> {
    return of(this.dataOldestShips);
  }

  public getLabelsOldestShips$(): Observable<string[]> {
    return of(this.axisOldestShips);
  }

  public getSerieTitlesOldestShips$(): Observable<string[]> {
    return of(this.titlesOldestShips);
  }
}
