import { Injectable, Inject } from '@angular/core';
import { GameEngine } from '../engine/game.engine';
import { Observable, of } from 'rxjs';
import { Ship } from '../models/ship.model';

@Injectable({
  providedIn: 'root'
})
export class SimuInfoService {
  private game: GameEngine = null;

  constructor() {
    this.game = new GameEngine();
  }

  public getGame(): GameEngine {
    return this.game;
  }

  public getNbShips(): Observable<number> {
    return this.game.nbShips$;
  }

  public getNbHealth(): Observable<number> {
    return this.game.nbHealth$;
  }

  public getNbMissiles(): Observable<number> {
    return this.game.nbMissiles$;
  }

  public getShips(): Observable<number[][]> {
    return this.game.ships$;
  }

  public getHealths(): Observable<(number|boolean)[][]> {
    return this.game.healths$;
  }

  public getMissiles(): Observable<number[][]> {
    return this.game.missiles$;
  }

  public getOldestShip(): Observable<Ship> {
    return this.game.oldestShip$;
  }

  public getAliveOldestShip (): Observable<Ship> {
    return this.game.aliveOldestShip$;
  }
}
