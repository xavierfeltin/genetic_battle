import { Injectable, Inject } from '@angular/core';
import { GameEngine } from '../engine/game.engine';
import { Observable, of } from 'rxjs';
import { Ship } from '../models/ship.model';
import { throttleTime, bufferTime } from 'rxjs/operators';
import { Point } from '../tools/statistics.tools';
import { Scoring } from '../ia/scoring';
import { Phenotype } from '../models/phenotype.interface';
import { RTNeuralNetwork } from '../ia/rt_neat/phenotype/neural-network';

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

  public getShips(): Observable<Phenotype[]> {
    return this.game.ships$.pipe(throttleTime(1000));
  }

  public getShipsScoring(): Observable<Scoring[]> {
    return this.game.shipsScoring$.pipe(throttleTime(1000));
  }

  public getDeadShipsScoring(): Observable<(Scoring[])[]> {
    return this.game.deadShipsScoring$.pipe(bufferTime(1000));
  }

  public getNeuralNetwork(): Observable<RTNeuralNetwork> {
    return this.game.selectedShipNN$.pipe(throttleTime(1000));
  }

  /*
  public getNbShips(): Observable<number> {
    return this.game.nbShips$.pipe(throttleTime(1000));
  }
  */

  /*
  public getNbHealth(): Observable<number> {
    return this.game.nbHealth$;
  }

  public getNbMissiles(): Observable<number> {
    return this.game.nbMissiles$;
  }

  public getCoordShips(): Observable<number[][]> {
    return this.game.coordShips$;
  }

  public getHealths(): Observable<(number|boolean)[][]> {
    return this.game.healths$;
  }

  public getMissiles(): Observable<number[][]> {
    return this.game.missiles$;
  }

  public getOldestShip(): Observable<Ship> {
    return this.game.oldestShip$.pipe(throttleTime(1000));
  }
  */

  public getAliveOldestShip(): Observable<Phenotype> {
    return this.game.aliveOldestShip$.pipe(throttleTime(1000));
  }

  public getElapsedTimeInSeconds(): Observable<number> {
    return this.game.elapsedTime$.pipe(throttleTime(1000));
  }

  /*
  public getGenerations(): Observable<number> {
    return this.game.generations$;
  }
  */

  /*
  public getGenerationScores(): Observable<Scoring[]> {
    return this.game.getScores$.pipe(throttleTime(1000));
  }
  */
}
