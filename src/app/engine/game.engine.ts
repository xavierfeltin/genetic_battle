import { ShipRender } from './ship.engine';
import { IBot } from './../bot/bot';
import { TestBot } from './../bot/test';
import { Collision } from './collision.engine';
import { Ship, FactoryShip } from '../models/ship.model';
import { Missile, FactoryMissile } from '../models/missile.model';
import { MissileRender } from './missile.engine';
import { Game } from '../models/game.model';
import { HealthRender } from './health.engine';
import { Health, FactoryHealth } from '../models/health.model';
import { GameObject } from '../models/game-object.model';
import { Vect2D } from '../models/vect2D.model';
import { MyMath } from '../tools/math.tools';
import { Subject } from 'rxjs';
import { Configuration } from '../models/configuration.interface';
import { FactoryADN, ADN } from '../ia/adn';
import { FortuneWheelGA, Individual } from '../ia/ga';
import { Scoring } from '../ia/scoring';
//import * as seedrandom from 'seedrandom';

export class GameEngine {
  private static readonly NB_HEALTH_WHEN_DIE: number = 1;
  private static readonly NB_SHIPS: number = 10;
  private static readonly NB_INIT_HEALTH: number = 0; // 20;
  private static readonly RATE_SPAWN_HEALTH: number = 0; // 0.01;
  private static readonly RATE_CLONE_SHIP: number = 0.005;
  private static readonly RATE_CROSSOVER_SHIP: number = 0.01;
  private static readonly MAX_POPULATION = 100;
  private static readonly GAME_TIMER = 45; // 60; // in seconds

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private fps: number;
  private now: number;
  private then: number;
  private interval: number;
  private delta: number;
  private startTime: number;
  private width: number;
  private height: number;
  private nbGenerations: number;

  private shipRenderer: ShipRender = null;
  private missileRenderer: MissileRender = null;
  private healthRenderer: HealthRender = null;

  private shipFactory: FactoryShip;
  private missileFactory: FactoryMissile;
  private healthFactory: FactoryHealth;

  private ships: Ship[] = [];
  private deadShips: Ship[] = [];
  private missiles: Missile[] = [];
  private health: Health[] = [];
  private bots: IBot[] = [];
  private game: Game;

  // Simulation variables
  private nbStartingShips: number;
  private nbStartingHealth: number;
  private rateHealth: number;
  private nbHealthDestroyingShip: number;
  private cloneRate: number;
  private crossOverRate: number;
  private isNeuroEvolution: boolean;

  private ga: FortuneWheelGA;

  // Output variables
  private oldestShip: Ship;

  private _ships$ = new Subject<Ship[]>();
  public get ships$() { return this._ships$.asObservable() }

  private _deadShips$ = new Subject<Ship[]>();
  public get deadShips$() { return this._deadShips$.asObservable() }

  private _nbShips$ = new Subject<number>();
  public get nbShips$() { return this._nbShips$.asObservable() }

  /*
  private _nbMissiles$ = new Subject<number>();
  public get nbMissiles$() { return this._nbMissiles$.asObservable() }

  private _nbHealth$ = new Subject<number>();
  public get nbHealth$() { return this._nbHealth$.asObservable() }

  private _coordShips$ = new Subject<number[][]>();
  public get coordShips$() { return this._coordShips$.asObservable() }

  private _missiles$ = new Subject<number[][]>();
  public get missiles$() { return this._missiles$.asObservable() }

  private _healths$ = new Subject<(number|boolean)[][]>();
  public get healths$() { return this._healths$.asObservable() }

  private _oldestShip$ = new Subject<Ship>();
  public get oldestShip$() { return this._oldestShip$.asObservable() }
  */

  private _aliveOldestShip$ = new Subject<Ship>();
  public get aliveOldestShip$() { return this._aliveOldestShip$.asObservable() }

  private _elapsedTime$ = new Subject<number>();
  public get elapsedTime$() { return this._elapsedTime$.asObservable() }

  private _generations$ = new Subject<number>();
  public get generations$() { return this._generations$.asObservable() }

  //private _getScores$ = new Subject<Scoring[]>();
  //public get getScore$() { return this._getScores$.asObservable() }


  constructor() {
    //seedrandom('hello.', { global: true });

    this.fps = 30;
    this.then = Date.now();
    this.interval = 1000 / this.fps;
    this.delta = 0;
    this.now = 0;
    this.startTime = 0;
    this.game = new Game(GameEngine.NB_SHIPS);
    this.canvas = null;
    this.nbGenerations = -1;

    const adnFactory  = new FactoryADN();
    this.shipFactory = new FactoryShip(adnFactory);
    this.missileFactory = new FactoryMissile();
    this.healthFactory = new FactoryHealth();

    this.oldestShip = null;

    this.nbStartingShips = GameEngine.NB_SHIPS;
    this.nbStartingHealth = GameEngine.NB_INIT_HEALTH;
    this.rateHealth = GameEngine.RATE_SPAWN_HEALTH;
    this.nbHealthDestroyingShip = GameEngine.NB_HEALTH_WHEN_DIE;
    this.cloneRate = GameEngine.RATE_CLONE_SHIP;
    this.crossOverRate = GameEngine.RATE_CROSSOVER_SHIP;

    this.isNeuroEvolution = true;
    this.shipFactory.setNeuroEvolution(this.isNeuroEvolution);

    this.ga = new FortuneWheelGA();
  }

  public setCanvas(idCanvas: string) {
    this.canvas = document.getElementById(idCanvas) as HTMLCanvasElement;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';

    this.shipRenderer = new ShipRender(this.ctx);
    this.missileRenderer = new MissileRender(this.ctx);
    this.healthRenderer = new HealthRender(this.ctx);
  }

  public setConfigucation(config: Configuration) {
    // Missile configuration
    if (config.damageMissile !== this.missileFactory.getDamage()) {
      this.missileFactory.setDamage(config.damageMissile);
      for (const missile of this.missiles) {
        missile.setEnergy(config.damageMissile);
      }
    }

    // Health configuration
    if (config.lifeFromHealth !== this.healthFactory.getHealing()) {
      this.healthFactory.setHealing(config.lifeFromHealth);
      for (const health of this.health) {
        health.setEnergy(config.lifeFromHealth);
      }
    }

    // Ship configuration
    if (config.energyFire !== this.shipFactory.getEnergyFire()
      || config.energyFuel !== this.shipFactory.getEnergyFuel()
      || (this.ships.length  > 0
          && config.mutationRate !== this.ships[0].getADNFactory().getMutationRate())) {

      if (config.energyFire !== this.shipFactory.getEnergyFire()) {
        this.shipFactory.setEnergyFire(config.energyFire);
      }

      if (config.energyFuel !== this.shipFactory.getEnergyFuel()) {
        this.shipFactory.setEnergyFuel(config.energyFuel);
      }

      for (const ship of this.ships) {
        if (config.energyFire !== this.shipFactory.getEnergyFire()) {
          ship.setEnergy(config.energyFire);
        }

        if (config.energyFuel !== this.shipFactory.getEnergyFuel()) {
          ship.setEnergyFuel(config.energyFuel);
        }

        // ADN configuration
        if (config.mutationRate !== ship.getADNFactory().getMutationRate()) {
          ship.getADNFactory().setMutationRate(config.mutationRate);
        }
      }
    }

    // Simulation configuration
    this.nbStartingShips = config.nbStartingShips ;
    this.nbStartingHealth = config.nbStartingHealth ;
    this.rateHealth = config.rateHealth ;
    this.nbHealthDestroyingShip = config.nbHealthDestroyingShip ;
    this.cloneRate = config.cloneRate ;
    this.crossOverRate = config.crossOverRate ;

    if (config.resetSimulation) {
      this.reset(true);
      this.initialize();
    }

    this.shipRenderer.setDebugMode(config.debugMode);
    this.shipFactory.setNeuroEvolution(true);
  }

  public getDefaultConfiguration(): Configuration {
    const config = {
      nbStartingShips: GameEngine.NB_SHIPS,
      energyFuel: Ship.DEFAULT_ENERGY_FUEL,
      energyFire: Ship.DEFAULT_ENERGY_FIRE,
      damageMissile: Missile.DEFAULT_DAMAGE,
      nbStartingHealth: GameEngine.NB_INIT_HEALTH,
      rateHealth: GameEngine.RATE_SPAWN_HEALTH,
      nbHealthDestroyingShip: GameEngine.NB_HEALTH_WHEN_DIE,
      lifeFromHealth: Health.DEFAULT_HEALING,
      cloneRate: GameEngine.RATE_CLONE_SHIP,
      crossOverRate: GameEngine.RATE_CROSSOVER_SHIP,
      mutationRate: ADN.MUTATION_RATE,
      resetSimulation: true,
      debugMode: ShipRender.DEBUG
    };
    return config;
  }

  private reset(isHardReset: boolean) {
    this.ships = [];
    this.deadShips = [];
    this.health = [];
    this.missiles = [];
    this.startTime = Date.now();
    this.game.reset();

    if (isHardReset) {
      this.nbGenerations = 0;
    }
  }

  public initialize(ships: Ship[] = []) {

    if (ships.length === 0) {
      for (let i = 0; i < this.nbStartingShips; i++) {
        const pos = new Vect2D(Math.random() * this.width, Math.random() * this.height);
        const orientation = Math.random() * 360;
        const ship = this.shipFactory.create(i, 1);
        ship.setPosition(pos);
        ship.setOrientation(orientation);
        ship.setBorders([0, this.width, 0, this.height]);
        ship.setTime(0, GameEngine.GAME_TIMER);
        this.ships.push(ship);
      }
    } else {
      this.ships = ships;
    }

    this._nbShips$.next(this.ships.length);
    this._ships$.next(this.ships);
    this._deadShips$.next(this.deadShips);

    this.oldestShip = this.ships[0];
    //this._oldestShip$.next(this.oldestShip);
    this._aliveOldestShip$.next(this.oldestShip);

    this.bots.push(new TestBot(0));
    this.bots.push(new TestBot(1));

    for (let i = 0; i < this.nbStartingHealth; i++) {
      this.createHealth(i);
    }
    //this._nbHealth$.next(this.health.length);
  }

  public getElapsedTimeInSeconds() {
    return  Math.round( (this.now - this.startTime) / 1000 );
  }

  public run() {
    this.startTime = Date.now();
    this.now = this.startTime;
    this._elapsedTime$.next(this.getElapsedTimeInSeconds());

    // Need to have an initialization at this moment
    // to allow charts to be initialized with correct values
    // yes I know could be better ...
    this.initialize();
    this.game.start();
    this._generations$.next(this.nbGenerations);

    window.requestAnimationFrame(() => this.animate());
  }

  public animate() {
    window.requestAnimationFrame(() => this.animate());

    this.now = Date.now();
    this.delta = this.now - this.then;

    if (this.delta > this.interval) {
      // update time stuffs

      // From: http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
      // Just `then = now` is not enough.
      // Lets say we set fps at 10 which means
      // each frame must take 100ms
      // Now frame executes in 16ms (60fps) so
      // the loop iterates 7 times (16*7 = 112ms) until
      // delta > interval === true
      // Eventually this lowers down the FPS as
      // 112*10 = 1120ms (NOT 1000ms).
      // So we have to get rid of that extra 12ms
      // by subtracting delta (112) % interval (100).
      // Hope that makes sense.
      this.then = this.now - (this.delta % this.interval);

      const elapsed = this.getElapsedTimeInSeconds();
      /*
      // Uncomment for managing batches of ships with a timer
      if (elapsed >= GameEngine.GAME_TIMER || this.ships.length === 0) {
        elapsed = 0;
        this.game.terminate();
      }
      */
      this._elapsedTime$.next(elapsed);

      /*
      // Uncomment for managing batches of ships
      if (this.game.isGameOver()) {
        const population = [...this.ships, ...this.deadShips];
        this._getHighScore$.next(this.getHighScore(population));
        const newGeneration = this.evolute(population);

        this.reset(false);
        this.initialize(newGeneration);
        this.game.start();

        this.nbGenerations ++;
        this._generations$.next(this.nbGenerations);
      }
      */

      this.playGame();
      this.renderGame();
    }
  }

  public playGame() {
    // Add possible new health
    if (Math.random() < this.rateHealth) {
      this.createHealth(this.generateId());
    }

    // respawn new ships
    /*
    const newShips = this.continuousEvolutionWhenDying(this.deadShips, this.ships);
    for (const ship of newShips) {
      this.ships.push(ship)  
    }
    */
    this.deadShips  = [];

    // Manage ship actions
    const t = this.getElapsedTimeInSeconds();
    for (const ship of this.ships) {
      ship.setTime(t, GameEngine.GAME_TIMER);

      // Ship may fire this turn
      if (ship.fire(this.ships, this.missiles)) {
        const missile = this.missileFactory.create(this.generateId(), ship, ship.getFOVLen());

        missile.setBorders([-50, 850, -50, 850]);
        missile.setPosition(ship.pos);
        missile.setOrientation(ship.orientation);

        this.missiles.push(missile);
      } else {
        ship.reduceCoolDown();
      }

      // this.continuousEvolutionWhenLiving(ship);
    }

    for (const ship of this.ships) {
      ship.behaviors(this.missiles, this.health, this.ships, this.width, this.height);
    }

    this.solveTurn(this.ships, this.missiles, this.health);

    // Destroy exploded missiles
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const missileModel = this.missiles[i];
      missileModel.consumeFuel();
      if (missileModel.isDead() || missileModel.isToDelete()) {
        this.missiles.splice(i, 1);
      }
    }
    //this._nbMissiles$.next(this.missiles.length);
    //const Mcoordinates = this.missiles.map(missile => [missile.id, missile.getLife()]);
    //this._missiles$.next(Mcoordinates);

    for (let i = this.health.length - 1; i >= 0; i--) {
      const healthModel = this.health[i];
      if (healthModel.isToDelete()) {
        this.health.splice(i, 1);
      }
    }
    //this._nbHealth$.next(this.health.length);
    //const Hcoordinates = this.health.map(health => [health.id, Math.round(health.pos.x), Math.round(health.pos.y), health.isToDelete()]);
    //this._healths$.next(Hcoordinates);

    // Manage ships (fire rate, dead ship, ....)
    for (let i = this.ships.length - 1; i >= 0; i--) {
      const shipModel = this.ships[i];
      shipModel.consumeFuel();

      if (shipModel.isDead()) {
        // Create healths pack
        const dispersion = Math.round(MyMath.map(this.nbHealthDestroyingShip, 0, 5, 0, 70));
        for (let j = 0; j < this.nbHealthDestroyingShip; j++) {
          const dX = MyMath.random(-dispersion, dispersion);
          const dY = MyMath.random(-dispersion, dispersion);

          let x = shipModel.pos.x + dX;
          if ( this.width - 20 < x) { x = this.width - 20;}
          if ( x < 0) { x = 0; }

          let y = shipModel.pos.y + dY;
          if ( this.height - 20 < y) { y = this.height - 20;}
          if ( y < 0) { y = 0; }

          const coord = new Vect2D(x, y);
          this.createHealth(this.generateId(), coord);
        }

        const deleted = this.ships.splice(i, 1);
        this.deadShips.push(deleted[0]);
      } else {
        shipModel.acc.mul(0);
        shipModel.updateHeading();
        shipModel.older();
      }
    }

    const aliveOldestShip = this.getOldestShip(this.ships);
    if (aliveOldestShip !== null) {
      if (this.oldestShip.getAge() < aliveOldestShip.getAge()) {
        this.oldestShip = aliveOldestShip;
      }
      //this._oldestShip$.next(this.oldestShip);
      this._aliveOldestShip$.next(aliveOldestShip);
    }

    this._nbShips$.next(this.ships.length);
    //const coordinates = this.ships.map(ship => [ship.id, Math.round(ship.pos.x), Math.round(ship.pos.y)]);
    //this._coordShips$.next(coordinates);
    this._ships$.next(this.ships);

    if (this.deadShips.length > 0) {
      this._deadShips$.next(this.deadShips);
    }
    
    // this._getScores$.next(this.getScores(this.ships));
  }

  private renderGame() {
    // Draw the frame after time interval is expired
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawShips();
    this.drawMissiles();
    this.drawHealth();
  }

  /*
  private evolute(ships: Ship[]): Ship[] {
    const ga = new FortuneWheelGA();

    const individuals = new Array<Individual>(ships.length);
    for (let i = 0;  i < ships.length; i++) {
      const ind = {
        adn: ships[i].getADN(),
        fitness: ships[i].scoring()
      };
      individuals[i] = ind;
    }

    ga.populate(individuals);
    ga.evolve();
    const newIndividuals = ga.getPopulation();

    const newShips = new Array<Ship>(ships.length);
    for (let i = 0;  i < ships.length; i++) {
      const pos = new Vect2D(Math.random() * this.width, Math.random() * this.height);
      const orientation = Math.random() * 360;
      const ship = this.shipFactory.create(i);
      ship.setADN(newIndividuals[i].adn);
      ship.setPosition(pos);
      ship.setOrientation(orientation);
      ship.setBorders([0, this.width, 0, this.height]);
      newShips[i] = ship;
    }

    return newShips;
  }
  */

  /**
   * Return the minimal score, the average score and the highest
   * Warning use only score and generation property of these scorings
   * @param ships 
   */
  /*
  private getScores(ships: Ship[]): Scoring[] {
    let maxScore = -Infinity;
    let minScore = Infinity;
    let avgScore = 0;

    for (const ship of ships) {
      const shipScore = ship.getScore();
      if (shipScore.score > maxScore) {
        maxScore = shipScore.score;
      }
      else if (shipScore.score <  minScore) {
        minScore = shipScore.score;
      }
      avgScore += shipScore.score;
    }

    const currentTime = this.getElapsedTimeInSeconds();
    const minScoring = ships[0].getScore();
    minScoring.score = minScore;
    minScoring.generation = currentTime; 

    const maxScoring = ships[0].getScore();
    maxScoring.score = maxScore;
    maxScoring.generation = currentTime; 

    const avgScoring = ships[0].getScore();
    avgScoring.score = avgScore;
    avgScoring.generation = currentTime; 

    const scorings = [];
    scorings.push(minScoring, avgScoring, maxScoring);
    return scorings;
  }
  */

  // Evolution performed while the ship is living
  // The ship is cloning itself or reproduce with another ship if meeting it
  private continuousEvolutionWhenLiving(ship: Ship) {
    if (this.ships.length > GameEngine.MAX_POPULATION) {
      ship.setPartner(null); // if it fails, it fails
    } else {
      // Ship may clone this turn
      if (Math.random() < this.cloneRate) {
        const orientation = Math.random() * 360;
        const id = this.generateId();
        const copy = ship.clone(id, orientation);
        this.ships.push(copy);
      }

      // Manage ship cross over
      if (ship.hasPartner()) {
        if (Math.random() < this.crossOverRate) {
          const id = this.generateId();
          const orientation = Math.random() * 360;
          const newShip = ship.reproduce(id, orientation);
          this.ships.push(newShip);
        }
        ship.setPartner(null); // if it fails, it fails
      }
    }
  }

  // Evolution performed once the ship is dead
  // The ship is cloning itself if it was good enough
  // or a new ship is created based on two ships with a good score
  private continuousEvolutionWhenDying(deadShips: Ship[], referenceShips: Ship[]): Ship[] {
    const newShips = [];

    if (deadShips.length > 0) {
      
      const individuals = [];
      for (let i = 0;  i < deadShips.length; i++) {
        const ind = {
          adn: deadShips[i].getADN(),
          fitness: deadShips[i].scoring()
        };
        individuals.push(ind);
      }

      const refIndividuals = [];
      for (let i = 0;  i < referenceShips.length; i++) {
        const ind = {
          adn: referenceShips[i].getADN(),
          fitness: referenceShips[i].scoring()
        };
        refIndividuals.push(ind);
      }

      this.ga.populate(individuals);
      this.ga.populateReference(refIndividuals);
      this.ga.evolveFromReference();
      const newIndividuals = this.ga.getPopulation();

      for (let i = 0;  i < deadShips.length; i++) {
        const pos = new Vect2D(Math.random() * this.width, Math.random() * this.height);
        const orientation = Math.random() * 360;
        const ship = this.shipFactory.create(deadShips[i].id, deadShips[i].getGeneration() + 1);
        ship.setADN(newIndividuals[i].adn);
        ship.setPosition(pos);
        ship.setOrientation(orientation);
        ship.setBorders([0, this.width, 0, this.height]);
        newShips.push(ship);
      }
    }

    return newShips;
  }


  private getOldestShip(ships: Ship[]): Ship {
    let result = null;
    for (const ship of ships) {
      if (result === null) {
        result = ship;
        ship.setOldest(true);
      } else if (result.getAge() < ship.getAge()) {
        result.setOldest(false);
        ship.setOldest(true);
        result = ship;
      }
    }
    return result;
  }

  private detectCollision(objA: GameObject, objB: GameObject, previousCollision: Collision,
                          firstCollision: Collision, newCollision: Collision, t: number,
                          /*previousCollisions: {}*/) {
    // Collision is not possible if ships are going in opposite directions
    let collision: Collision = Collision.createEmptyCollision();

    if ((objA.pos.x < objB.pos.x && objA.velo.x < 0.0 && objB.velo.x > 0.0)
            || (objB.pos.x < objA.pos.x && objB.velo.x < 0.0 && objA.velo.x > 0.0)
            || (objA.pos.y < objB.pos.y && objA.velo.y < 0.0 && objB.velo.y > 0.0)
            || (objB.pos.y < objA.pos.y && objB.velo.y < 0.0 && objA.velo.y > 0.0)) {
      collision = Collision.createEmptyCollision();
    } else {
      collision = Collision.getCollsion(objB, objA);
    }

    if (!collision.isEmpty()) {
      const keyA = collision.objA.id + '_' + collision.objA.constructor.name;
      const keyB = collision.objA.id + '_' + collision.objA.constructor.name;

      if ((!previousCollision.isEmpty())
              /*&& ((keyA in previousCollisions && previousCollisions[keyA].includes(keyB))
                || (keyB in previousCollisions && previousCollisions[keyB].includes(keyA)))*/
              && ((collision.objA === previousCollision.objA
                && collision.objB === previousCollision.objB
                && collision.collTime === previousCollision.collTime)
                || (collision.objB === previousCollision.objA
                  && collision.objA === previousCollision.objB
                  && collision.collTime === previousCollision.collTime))) {
          const emptyCollision = new Collision(null, null, -1.0);
          newCollision.setCollision(emptyCollision);
      } else {
        newCollision.setCollision(collision);

        // If the collision happens earlier than the current one we keep it
        if ((newCollision.collTime + t) < 1.0 && (firstCollision.isEmpty() || newCollision.collTime < firstCollision.collTime)) {
          firstCollision.setCollision(newCollision);
        }
      }
    }
  }

  // Return an array with number of missiles which has touched ship A and ship B
  private solveTurn(ships: Ship[], missiles: Missile[], healths: Health[]) {

    let t  = 0.0;
    const nShips = ships.length;
    const nMissiles = missiles.length;
    const nHealth = healths.length;

    let previousCollision = Collision.createEmptyCollision();
    // let previousCollisions = {};

    let nbTouchShipA = 0;
    let nbTouchShipB = 0;

    while (t < 1.0) {
      const firstCollision = Collision.createEmptyCollision();
      const newCollision = Collision.createEmptyCollision();

      // Check for all the collisions occuring during the turn between Missiles - Ships and Missiles - Missiles
      for (let i = 0; i < nMissiles; i++) {
        const missile = missiles[i];

        for (let j = 0; j < nShips; j++) {
          const ship = ships[j];

          if (missile.isToDelete() || ship.isDead()) {
            continue;
          } else if (ship.id === missile.getLauncher().id) {
            continue;
          }

          // Collision is not possible if ships are going in opposite directions
          this.detectCollision(ship, missile, previousCollision, firstCollision, newCollision, t /*, previousCollisions*/);
        }

        for (let j = i + 1; j < nMissiles; j++) {
          const otherMissile = missiles[j];

          if (missile.isToDelete() || otherMissile.isToDelete()) {
            continue;
          } else if (otherMissile.launchedBy === missile.launchedBy) {
            continue;
          }

          // Collision is not possible if otherMissiles are going in opposite directions
          this.detectCollision(otherMissile, missile, previousCollision, firstCollision, newCollision, t /*, previousCollisions*/);
        }
      }

      // Check for all the collisions occuring during the turn between Missiles - Ships and Missiles - Missiles
      for (let i = 0; i < nHealth; i++) {
        const health = healths[i];

        for (let j = 0; j < nShips; j++) {
          const ship = ships[j];

          if (health.isToDelete() || ship.isDead()) {
            continue;
          }

          // Collision is not possible if ships are going in opposite directions
          this.detectCollision(ship, health, previousCollision, firstCollision, newCollision, t /*, previousCollisions*/);
        }
      }

      // Check collision between ships for reproduction
      for (let i = 0; i < nShips - 1; i++) {
        const shipA = ships[i];

        for (let j = i + 1; j < nShips; j++) {
          const shipB = ships[j];

          if (shipA.hasPartner() || shipB.hasPartner() || shipA.isDead() || shipB.isDead()) {
            continue;
          }

          // Collision is not possible if ships are going in opposite directions
          this.detectCollision(shipA, shipB, previousCollision, firstCollision, newCollision, t /*, previousCollisions*/);
        }
      }

      if (firstCollision.isEmpty()) {
        // No collision so the pod is following its path until the end of the turn
        for (let i = 0; i < nShips; i++) {
          ships[i].move(1.0 - t);
        }

        for (let i = 0; i < nMissiles; i++) {
          if (!missiles[i].isToDelete()) {
            missiles[i].move(1.0 - t);
          }
        }

        t = 1.0; // end of the turn
      } else {
        let collisionTime = firstCollision.collTime;
        /*
        if (collisionTime === 0.0) {
            collisionTime = 0.0 ; // avoid infinity loop
        }
        */

        // Move the pod normally until collision time
        for (let i = 0; i < nShips; i++) {
          ships[i].move(collisionTime - t);
        }

        for (let i = 0; i < nMissiles; i++) {
          if (!missiles[i].isToDelete()) {
            missiles[i].move(collisionTime - t);
          }
        }

        // Solve the collision
        if (firstCollision.objA instanceof Missile) {
          // Missiles are destroyed when they hit
          firstCollision.objA.toDelete = true;

          if (firstCollision.objB instanceof Missile) {
            firstCollision.objB.toDelete = true;
            const missileA = firstCollision.objA as Missile;
            const missileB = firstCollision.objB as Missile;

            // update ships statistics
            missileA.getLauncher().missileDestroyed();
            missileB.getLauncher().missileDestroyed();
          } else {
            // Ship gets damages
            const missile = firstCollision.objA as Missile;
            const ship = firstCollision.objB as Ship;
            ship.updateLife(missile.getEnergy(), Ship.DUE_TO_MISSILE);

            // update ships statistics
            missile.getLauncher().ennemyDown();

            if (firstCollision.objB.id === 0) {
              nbTouchShipA ++;
            } else {
              nbTouchShipB ++;
            }
          }

        } else if (firstCollision.objA instanceof Health) {
          // Ship is recovering health
          const health = firstCollision.objA as Health;
          health.toDelete = true;

          const ship = firstCollision.objB as Ship;
          ship.updateLife(health.getEnergy(), Ship.DUE_TO_HEALTH_PACK);

          const newShips = this.continuousEvolutionWhenDying([ship], this.ships);
          this.ships.push(newShips[0]);

        } else if (firstCollision.objA instanceof Ship) {
          const shipA = firstCollision.objA as Ship;
          const shipB = firstCollision.objB as Ship; // Obj B is a ship
          shipA.setPartner(shipB);
        }

        t += collisionTime;
        previousCollision = firstCollision;

        /*
        if (firstCollision !== null) {
          const keyA = firstCollision.objA.id + '_' + firstCollision.objA.constructor.name;
          const keyB = firstCollision.objA.id + '_' + firstCollision.objA.constructor.name;
          if (keyA in previousCollisions) {
            if (!(previousCollisions[keyA].includes(keyB))) {
              previousCollisions[keyA].push(keyB);
            }
          }
          else {
            previousCollisions[keyA] = [];
          }

          if (keyB in previousCollisions) {
            if (!(previousCollisions[keyB].includes(keyA))) {
              previousCollisions[keyB].push(keyA);
            }
          }
          else {
            previousCollisions[keyB] = [];
          }
        }
        */
      }
    }
  }

  private createHealth(id: number, pos: Vect2D = null) {
    if (pos == null) {
      pos = new Vect2D(Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height));
    }
    const health = this.healthFactory.create(id);
    health.setPosition(pos);
    this.health.push(health);
  }

  private drawShips() {
    for (const ship of this.ships) {
      this.shipRenderer.draw(ship);
    }
  }

  private drawMissiles() {
    for (const missile of this.missiles) {
      this.missileRenderer.draw(missile);
    }
  }

  private drawHealth() {
    for (const health of this.health) {
      this.healthRenderer.draw(health);
    }
  }

  private generateId(): number {
    return new Date().getTime(); //.getUTCMilliseconds();
  }
}
