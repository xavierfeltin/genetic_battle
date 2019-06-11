import { ShipRender } from './ship.engine';
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
import { FortuneWheelGA } from '../ia/ga';
import { Scoring } from '../ia/scoring';
import { Phenotype } from '../models/phenotype.interface';

export class GameEngine {
  private static readonly NB_HEALTH_WHEN_DIE: number = 1;
  private static readonly NB_SHIPS: number = 20;
  private static readonly NB_INIT_HEALTH: number = 0; // 20;
  private static readonly RATE_SPAWN_HEALTH: number = 0; // 0.01;
  private static readonly RATE_CLONE_SHIP: number = 0.03;
  private static readonly BREEDING_RATE_SHIP: number = 0.01;
  private static readonly MAX_POPULATION = 20;
  private static readonly GAME_TIMER = 45; // 60; // in seconds
  private static readonly NEURO_EVO_MODE = 'neuroevol';
  private static readonly ALGO_EVO_MODE = 'geneticalgo';
  private static readonly EVOLUTION_MODE = GameEngine.NEURO_EVO_MODE;

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
  private game: Game;

  // Simulation variables
  private nbStartingShips: number;
  private maxShips: number;
  private nbStartingHealth: number;
  private rateHealth: number;
  private nbHealthDestroyingShip: number;
  private cloneRate: number;
  private breedingRate: number;
  private isNeuroEvolution: boolean;

  private ga: FortuneWheelGA;

  // Output variables
  private oldestShip: Ship;

  private _ships$ = new Subject<Phenotype[]>();
  public get ships$() { return this._ships$.asObservable() }

  private _shipsScoring$ = new Subject<Scoring[]>();
  public get shipsScoring$() { return this._shipsScoring$.asObservable() }

  private _deadShipsScoring$ = new Subject<Scoring[]>();
  public get deadShipsScoring$() { return this._deadShipsScoring$.asObservable() }

  private _aliveOldestShip$ = new Subject<Phenotype>();
  public get aliveOldestShip$() { return this._aliveOldestShip$.asObservable() }

  private _elapsedTime$ = new Subject<number>();
  public get elapsedTime$() { return this._elapsedTime$.asObservable() }

  constructor() {
    // seedrandom('hello.', { global: true });

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
    this.maxShips = GameEngine.MAX_POPULATION;
    this.nbStartingHealth = GameEngine.NB_INIT_HEALTH;
    this.rateHealth = GameEngine.RATE_SPAWN_HEALTH;
    this.nbHealthDestroyingShip = GameEngine.NB_HEALTH_WHEN_DIE;
    this.cloneRate = GameEngine.RATE_CLONE_SHIP;
    this.breedingRate = GameEngine.BREEDING_RATE_SHIP;

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
          && ( config.mutationRate !== this.ships[0].getADNFactory().getMutationRate()
               || config.crossOverRate !== this.ships[0].getADNFactory().getCrossOverRate()))) {

      // Update configuration for future ships
      if (config.energyFire !== this.shipFactory.getEnergyFire()) {
        this.shipFactory.setEnergyFire(config.energyFire);
      }

      if (config.energyFuel !== this.shipFactory.getEnergyFuel()) {
        this.shipFactory.setEnergyFuel(config.energyFuel);
      }

      const adnFactory = this.shipFactory.getADNFactory();
      if (config.mutationRate !== adnFactory.getMutationRate()) {
        adnFactory.setMutationRate(config.mutationRate);
      }

      if (config.crossOverRate !== adnFactory.getCrossOverRate()) {
        adnFactory.setCrossOverRate(config.crossOverRate);
      }

      // Update configuration for current ships
      for (const ship of this.ships) {
        if (config.energyFire !== ship.getEnergyFire()) {
          ship.setEnergy(config.energyFire);
        }

        if (config.energyFuel !== ship.getEnergyFuel()) {
          ship.setEnergyFuel(config.energyFuel);
        }

        // ADN configuration
        if (config.mutationRate !== ship.getADNFactory().getMutationRate()) {
          ship.getADNFactory().setMutationRate(config.mutationRate);
        }

        if (config.crossOverRate !== ship.getADNFactory().getCrossOverRate()) {
          ship.getADNFactory().setCrossOverRate(config.crossOverRate);
        }
      }
    }

    // Simulation configuration
    this.nbStartingShips = config.nbStartingShips ;
    this.maxShips = config.maxShips;
    this.nbStartingHealth = config.nbStartingHealth ;
    this.rateHealth = config.rateHealth ;
    this.nbHealthDestroyingShip = config.nbHealthDestroyingShip ;
    this.cloneRate = config.cloneRate ;
    this.breedingRate = config.breedingRate ;

    let needToReset = false;
    const evolutionMode = this.shipFactory.getNeuroEvolution() ? GameEngine.NEURO_EVO_MODE : GameEngine.ALGO_EVO_MODE;
    if (config.evolutionMode !== evolutionMode) {
      this.shipFactory.setNeuroEvolution(config.evolutionMode === GameEngine.NEURO_EVO_MODE);
      needToReset = true;
    }

    if (config.resetSimulation || needToReset) {
      this.reset(true);
      this.initialize();
    }

    this.shipRenderer.setDebugMode(config.debugMode);
  }

  public getDefaultConfiguration(): Configuration {
    const config = {
      nbStartingShips: GameEngine.NB_SHIPS,
      maxShips: GameEngine.MAX_POPULATION,
      energyFuel: Ship.DEFAULT_ENERGY_FUEL,
      energyFire: Ship.DEFAULT_ENERGY_FIRE,
      damageMissile: Missile.DEFAULT_DAMAGE,
      nbStartingHealth: GameEngine.NB_INIT_HEALTH,
      rateHealth: GameEngine.RATE_SPAWN_HEALTH,
      nbHealthDestroyingShip: GameEngine.NB_HEALTH_WHEN_DIE,
      lifeFromHealth: Health.DEFAULT_HEALING,
      cloneRate: GameEngine.RATE_CLONE_SHIP,
      breedingRate: GameEngine.BREEDING_RATE_SHIP,
      mutationRate: ADN.MUTATION_RATE,
      crossOverRate: ADN.CROSSOVER_RATE,
      evolutionMode: GameEngine.EVOLUTION_MODE,
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

    const phenotypes = [];
    const scores = [];
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
        phenotypes.push(ship.getPhenotype());
      }
    } else {
      this.ships = ships;
      for (const ship of this.ships) {
        phenotypes.push(ship.getPhenotype());
        scores.push(ship.getScore());
      }
    }

    // this._nbShips$.next(this.ships.length);

    this._ships$.next(phenotypes);
    this._shipsScoring$.next(scores);
    this._deadShipsScoring$.next(this.deadShips.map(ship => ship.getScore()));

    this.oldestShip = this.ships[0];
    // this._oldestShip$.next(this.oldestShip);
    this._aliveOldestShip$.next(this.oldestShip.getPhenotype());

    for (let i = 0; i < this.nbStartingHealth; i++) {
      this.createHealth(i);
    }
    // this._nbHealth$.next(this.health.length);
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
    // this._generations$.next(this.nbGenerations);

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
        const accuracy = 0; // MyMath.random(-ship.getFOV() / 2, ship.getFOV() / 2);
        missile.setOrientation(ship.orientation + accuracy);
        this.missiles.push(missile);
      } else {
        ship.reduceCoolDown();
      }
    }

    const newShips = this.continuousEvolutionWithReference(this.ships);
    for (const newShip of newShips) {
      this.ships.push(newShip);
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

    for (let i = this.health.length - 1; i >= 0; i--) {
      const healthModel = this.health[i];
      if (healthModel.isToDelete()) {
        this.health.splice(i, 1);
      }
    }

    // Manage ships (fire rate, dead ship, ....)
    const phenotypes = [];
    const scoring = [];
    for (let i = this.ships.length - 1; i >= 0; i--) {
      const ship = this.ships[i];
      ship.consumeFuel();

      if (ship.isDead()) {
        // Create healths pack
        const dispersion = Math.round(MyMath.map(this.nbHealthDestroyingShip, 0, 5, 0, 70));
        for (let j = 0; j < this.nbHealthDestroyingShip; j++) {
          const dX = MyMath.random(-dispersion, dispersion);
          const dY = MyMath.random(-dispersion, dispersion);

          let x = ship.pos.x + dX;
          if ( this.width - 20 < x) { x = this.width - 20; }
          if ( x < 0) { x = 0; }

          let y = ship.pos.y + dY;
          if ( this.height - 20 < y) { y = this.height - 20; }
          if ( y < 0) { y = 0; }

          const coord = new Vect2D(x, y);
          this.createHealth(this.generateId(), coord);
        }

        const deleted = this.ships.splice(i, 1);
        this.deadShips.push(deleted[0]);
      } else {
        ship.acc.mul(0);
        ship.updateHeading();
        ship.older();
        phenotypes.push(ship.getPhenotype());
        scoring.push(ship.getScore());
      }
    }

    const aliveOldestShip = this.getOldestShip(this.ships);
    if (aliveOldestShip !== null) {
      if (this.oldestShip.scoring() < aliveOldestShip.scoring()) {
        this.oldestShip = aliveOldestShip;
      }

      this._aliveOldestShip$.next(aliveOldestShip.getPhenotype());
    }

    this._ships$.next(phenotypes);
    this._shipsScoring$.next(scoring);

    if (this.deadShips.length > 0) {
      this._deadShipsScoring$.next(this.deadShips.map(ship => ship.getScore()));
    }
  }

  private renderGame() {
    // Draw the frame after time interval is expired
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawShips();
    this.drawMissiles();
    this.drawHealth();
  }

  private configureContinuousEvolutionWithReference(referenceShips: Ship[]) {
    if (this.ships.length < this.maxShips) {

      const refIndividuals = [];
      for (const ship of referenceShips) {
        const ind = {
          adn: ship.getADN(),
          fitness: ship.scoring()
        };
        refIndividuals.push(ind);
      }
      this.ga.populateReference(refIndividuals);
    }
  }

  // Evolution performed once the ship is dead
  // The ship is cloning itself if it was good enough
  // or a new ship is created based on two ships with a good score
  // private continuousEvolutionWithReference(shipToEvolve: Ship): Ship {
  private continuousEvolutionWithReference(ships: Ship[]): Ship[] {
    const isCloning = Math.random() < this.cloneRate;
    const newShips = [];
    const deltaPop = this.maxShips - this.ships.length;
    let nbMaxCrossingShips = isCloning ? deltaPop - 1 : deltaPop;

    if (deltaPop > 0) {
      // Select an individual to clone or reproduce
      const individuals = [];
      for (const pop of ships) {

        // Transform ships into individuals
        if (isCloning) {
          const ind = {
            id: pop.id,
            adn: pop.getADN(),
            fitness: pop.scoring()
          };
          individuals.push(ind);
        }

        if (nbMaxCrossingShips > 0) {
          const isReproducing = Math.random() < this.breedingRate;
          if (isReproducing && pop.hasPartner()) {
            const id = this.generateId();
            const orientation = Math.random() * 360;
            const newShip = pop.reproduce(id, orientation);
            newShips.push(newShip);
          }
          pop.setPartner(null); // reset ptoential partner each frame
          nbMaxCrossingShips --;
        }
      }

      if (isCloning) {
        this.ga.populate(individuals);
        this.ga.computeProbas();
        const picked = this.ga.pickOne(individuals);
        const pickedShip = ships.find((value: Ship, index: number, allShips: Ship[]) => {
          return value.id === picked.id;
        });

        this.ga.populate([picked]);
        this.ga.evolveFromReference();
        const newIndividuals = this.ga.getPopulation();

        const orientation = Math.random() * 360;
        const ship = this.shipFactory.create(this.generateId(), pickedShip.getGeneration() + 1, pickedShip.id);
        ship.setADN(newIndividuals[0].adn);
        ship.setPosition(pickedShip.pos);
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
      ship.setOldest(false);
      if (result === null) {
        result = ship;
        ship.setOldest(true);
      } else if (result.scoring() < ship.scoring()) {
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
          this.detectCollision(shipA, shipB, previousCollision, firstCollision, newCollision, t); // , previousCollisions);
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
        const collisionTime = firstCollision.collTime;
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
            if (ship.isDead()) {
              missile.getLauncher().ennemyDown();
            } else {
              missile.getLauncher().ennemyWounded();
            }

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

          // Uncomment to activate cloning when picking up a health pack
          // const newShips = this.continuousEvolutionWhenDying([ship], this.ships);
          // newShips[0].id = this.generateId();
          // this.ships.push(newShips[0]);

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
    return new Date().getTime(); // .getUTCMilliseconds();
  }
}
