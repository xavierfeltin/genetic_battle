import { ShipRender } from './ship.engine';
import { Collision } from './collision.engine';
import { Ship, FactoryShip } from '../models/ship.model';
import { Missile, FactoryMissile } from '../models/missile.model';
import { MissileRender } from './missile.engine';
import { Game } from '../models/game.model';
import { HealthRender } from './health.engine';
import { Health, FactoryHealth } from '../models/health.model';
import { Vect2D } from '../models/vect2D.model';
import { MyMath } from '../tools/math.tools';
import { Subject } from 'rxjs';
import { Configuration } from '../models/configuration.interface';
import { ADN } from '../ia/adn';
import { FactoryADN } from '../ia/adn.factory';
import { GeneticAlgorithm } from '../ia/ga';
import { FortuneWheelGA } from '../ia/fortunewheel';
import { Scoring } from '../ia/scoring';
import { Phenotype } from '../models/phenotype.interface';
import { ShipNeurEvo } from '../models/shipNeuroEvo.model';
import { Matrix } from '../ia/matrix';
import { ShipScoring } from '../models/shipScoring.model';
import { RTADNGA } from '../ia/rt_neat/population';
import { RTADN } from '../ia/rt_neat/adn';

export class GameEngine {
  private static readonly NB_HEALTH_WHEN_DIE: number = 1;
  private static readonly NB_SHIPS: number = 12;
  private static readonly NB_INIT_HEALTH: number = 0; // 20;
  private static readonly RATE_SPAWN_HEALTH: number = 0.03; // 0.01;
  private static readonly RATE_CLONE_SHIP: number = 0.03;
  private static readonly BREEDING_RATE_SHIP: number = 0.001;
  private static readonly MAX_POPULATION = 12;
  private static readonly MAX_DEAD_POPULATION = 3;
  private static readonly MAX_RANDOM_HEALTH_PACK = GameEngine.MAX_POPULATION;
  private static readonly GAME_TIMER = 30; // in seconds
  private static readonly NEURO_EVO_MODE = 'neuroevol';
  private static readonly ALGO_EVO_MODE = 'geneticalgo';
  private static readonly EVOLUTION_MODE = GameEngine.NEURO_EVO_MODE;
  private static readonly MINMUM_AGE_BEFORE_REPLACEMENT = 10; // in seconds
  private static readonly LEVEL_OF_INEGIBILITY = 0.5; // pct of population with age < MINMUM_AGE_BEFORE_REPLACEMENT

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
  private deadShips: Ship[] = []; // dead during the last turn
  private memoryShips: Ship[] = []; // the MAX_DEAD_POPULATION best dead ships
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

  private ga: GeneticAlgorithm;
  private bestShip: Ship;
  private minimumAgeBeforeReplacement: number;
  private ticksBeforeReplacement: number;
  private levelOfInegibility: number;
  private lastEvaluationForReplacement: number;

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

    const adnFactory  = new FactoryADN(RTADN.DEFAULT_RATES, FactoryADN.TYPE_RT_ADN);
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
    // this.ga = new FortuneWheelGA();

    this.ga = new RTADNGA();

    this.bestShip = null;
    this.minimumAgeBeforeReplacement = GameEngine.MINMUM_AGE_BEFORE_REPLACEMENT;
    this.levelOfInegibility = GameEngine.LEVEL_OF_INEGIBILITY;
    this.ticksBeforeReplacement = this.computeFrequencyOfReplacement();
    this.lastEvaluationForReplacement = 0;
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

    // Scoring configuration
    const currentShipScoringCoefficients = this.shipFactory.getShipScoringCoefficients();
    const coeffs = currentShipScoringCoefficients.getCoefficients();
    let hasScoringCoeffsChanged = false;
    for (const key in coeffs) {
      if (coeffs[key].value !== config.scoringCoeffs[key]) {
        currentShipScoringCoefficients.setCoefficient(key, config.scoringCoeffs[key]);
        hasScoringCoeffsChanged = true;
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

    const nnStructure = this.shipFactory.getNeuronalNetworkStructure();
    if (JSON.stringify(config.nnStructure) !== JSON.stringify(nnStructure)) {
      this.shipFactory.setNeuronalNetworkStructure(config.nnStructure);
      needToReset = true;
    }

    let isInputNeuroEvoDifferent = false;
    const currentShipNeuroEvo = this.shipFactory.getShipNeuroEvo();
    const inputs = currentShipNeuroEvo.getInputs();
    for (const key in inputs) {
      if (inputs[key].status !== config.neuroInvoInputs[key]) {
        isInputNeuroEvoDifferent = true;
        currentShipNeuroEvo.activateInput(key, config.neuroInvoInputs[key]);
      }
    }
    needToReset = needToReset || isInputNeuroEvoDifferent;

    if (config.resetSimulation || needToReset) {
      this.reset(true);
      this.initialize();
    } else {
        // Change current ships configuration
        if (config.energyFire !== this.shipFactory.getEnergyFire()
        || config.energyFuel !== this.shipFactory.getEnergyFuel()
        || hasScoringCoeffsChanged
        || (this.ships.length  > 0
            && ( config.mutationRate !== this.ships[0].getADNFactory().getMutationRate()
                || config.crossOverRate !== this.ships[0].getADNFactory().getCrossOverRate()))) {

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

          if (hasScoringCoeffsChanged) {
            ship.setScoringCoefficients(currentShipScoringCoefficients);
          }
        }
      }
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
      nnStructure: Ship.DEFAULT_NN_HIDDEN_LAYERS,
      resetSimulation: true,
      debugMode: ShipRender.DEBUG,
      neuroInvoInputs: ShipNeurEvo.DEFAULT_INPUT_CONFIGURATION,
      scoringCoeffs: ShipScoring.DEFAULT_SCORING_CONFIGURATION
    };
    return config;
  }

  private reset(isHardReset: boolean) {
    this.ships = [];
    this.deadShips = [];
    this.health = [];
    this.missiles = [];
    this.startTime = Date.now();
    this.lastEvaluationForReplacement = 0;
    this.game.reset();

    if (isHardReset) {
      this.nbGenerations = 0;
    }
  }

  public initialize(ships: Ship[] = []) {

    const phenotypes = [];
    const scores = [];
    if (ships.length === 0) {
      // Evolution from worst require everyone starting with same conditions
      const pos = new Vect2D(this.width / 2, this.height / 2);

      for (let i = 0; i < this.nbStartingShips; i++) {
        // const pos = new Vect2D(Math.random() * this.width, Math.random() * this.height);
        // const orientation = Math.random() * 360;
        const ship = this.shipFactory.create(i, 1);
        ship.setPosition(pos);
        const orientation = Math.random() * 360;
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
    if (Math.random() < this.rateHealth && this.health.length < GameEngine.MAX_RANDOM_HEALTH_PACK) {
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

    // this.continuousEvolutionWithRTNeat();

    /*
    const newShips = this.continuousEvolutionWithReference(this.ships);
    for (const newShip of newShips) {
      this.ships.push(newShip);
    }
    */

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

    /*
    TODO:
    You could use the standard normalized scores: For each population (in this case each input collection)
    you can calculate the score of an individual by subtracting the population mean from it,
    and then dividing it by their standard deviation.
    This does not leave you with numbers between 0 and 1 but does allow you to compare two populations with each other
    => Compute for each possible component in the fitness function and use this mean and std deviation when computing scoring of each ship
    */
    // const eligibleShips = this.ships.filter(ship => ship.getAgeInSeconds() >= GameEngine.MINMUM_AGE_BEFORE_REPLACEMENT);
    Ship.updateStatistics(this.ships);

    // Manage ships states after solving actions (fire rate, dead ship, ....)
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
        this.deadShips.push(deleted[0]); // dead this turn for plotting

        this.memoryShips.push(deleted[0]);
        this.memoryShips = this.memoryShips.sort((a: Ship, b: Ship): number => {
          return (a.scoring() > b.scoring()) ? -1 : (a.scoring() < b.scoring()) ? 1 : 0;
        });
        if (GameEngine.MAX_DEAD_POPULATION < this.memoryShips.length) {
          this.memoryShips.pop();
        }
      } else {
        ship.acc.mul(0);
        ship.updateHeading();
        ship.older();
        ship.updateScoring();
        phenotypes.push(ship.getPhenotype());
        scoring.push(ship.getScore());

        // Evaluate the ship after its TTL
        ship.evaluate();
      }
    }

    this.continuousEvolutionOfWorst();

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

  // Evolution performed once the ship is dead
  // The ship is cloning itself if it was good enough
  // or a new ship is created based on two ships with a good score
  // private continuousEvolutionWithReference(shipToEvolve: Ship): Ship {
  /*
  private continuousEvolutionWithReference(ships: Ship[]): Ship[] {
    const isCloning = Math.random() < this.cloneRate;
    const newShips = [];
    const deltaPop = this.maxShips - this.ships.length;
    let nbMaxCrossingShips = isCloning ? deltaPop - 1 : deltaPop;

    if (deltaPop > 0) {

      // const shipsToEval = [...this.ships, ...this.memoryShips];
      const shipsToEval = [...this.ships, ...this.memoryShips];

      // Select an individual to clone or reproduce
      const individuals = [];
      for (const pop of shipsToEval) {

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
            const newId = this.generateId();
            const orientation = Math.random() * 360;
            const newShip = pop.reproduce(newId, orientation);
            newShips.push(newShip);
          }
          pop.setPartner(null); // reset ptoential partner each frame
          nbMaxCrossingShips --;
        }
      }

      if (isCloning) {
        this.ga.populate(individuals);
        // this.ga.updateBest();
        // this.ga.integrateBestToPopulation();
        this.ga.computeProbas();

        const picked = this.ga.pickOne(this.ga.getPopulation());
        const pickedShip = shipsToEval.find((value: Ship, index: number, allShips: Ship[]) => {
          return value.id === picked.metadata.id;
        });
        // pickedShip = pickedShip ? pickedShip : this.bestShip;

        this.ga.populate([picked]);
        this.ga.basicEvolve();

        const newIndividuals = this.ga.getPopulation();
        const orientation = Math.random() * 360;
        // const pickedGeneration = pickedShip ? pickedShip.getGeneration() + 1 : this.bestShip.getGeneration() + 1;
        // const pickedId = pickedShip ? pickedShip.id : this.bestShip.id;
        const ship = this.shipFactory.create(this.generateId(), pickedShip.getGeneration() + 1, [pickedShip.id]);
        ship.setADN(newIndividuals[0]);
        const pos = new Vect2D(Math.random() * this.width, Math.random() * this.height);
        ship.setPosition(pos);
        ship.setOrientation(orientation);
        ship.setBorders([0, this.width, 0, this.height]);
        newShips.push(ship);
      }
    }

    return newShips;
  }
  */

  private computeFrequencyOfReplacement() {
    return Math.ceil(this.minimumAgeBeforeReplacement / (this.nbStartingShips * this.levelOfInegibility));
  }

  private findWorstShip(ships: Ship[]): Ship {
    const sorted = ships.sort((a, b) => {
      const aScore = a.getADN().metadata.fitness;
      const bScore = b.getADN().metadata.fitness;

      if (aScore < bScore) {
        return -1;
      } else if (aScore > bScore) {
        return 1;
      } else {
        return 0;
      }
    });

    let worst: Ship = null;
    if (sorted.length > 0) {
      worst = sorted[0];
    }

    return worst;
  }

  /**
   * Evolve the worst ship if old enough to be evaluated
   * If no ship is of age, do not perform an evolution
   * Perform evolution only every ticksBeforeReplacement seconds.
   */
  private continuousEvolutionOfWorst() {

    // Check if timing is right for checking if worst needs to be replaced ?
    const t = this.getElapsedTimeInSeconds();
    const isTooSoonForReplacement = (t <= this.lastEvaluationForReplacement) || (t % this.ticksBeforeReplacement !== 0);
    if (isTooSoonForReplacement) {
      return;
    }
    this.lastEvaluationForReplacement = t;

    const eligibleShips = this.ships.filter(ship => ship.getAgeInSeconds() >= GameEngine.MINMUM_AGE_BEFORE_REPLACEMENT);
    const worst = this.findWorstShip(eligibleShips);
    if (worst) {
      console.log('worst fitness: ' + worst.getADN().metadata.fitness);

      const adns: ADN[] = this.ships.map(ship => {
        const adn = ship.getADN();
        adn.metadata.id = ship.id;
        return adn;
      });

      this.ga.populate(adns);
      const newADNs = this.ga.evolve(1);
      if (newADNs !== null) {
        const newADN = newADNs[0];
        const newShip = this.shipFactory.createFromADN(this.generateId(), newADN);
        newShip.setPosition(new Vect2D(400, 400));
        const orientation = Math.random() * 360;
        newShip.setOrientation(orientation);
        // TODO set invulnerability

        // replace worst ship by new one and position it in starting area
        const worstADN = this.ga.worstIndividual;
        const index = this.ships.findIndex(ship => ship.id === worstADN.metadata.id);
        this.ships[index] = newShip;
      }
    }
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

  // Return an array with number of missiles which has touched ship A and ship B
  private solveTurn(ships: Ship[], missiles: Missile[], healths: Health[]) {

    let t  = 0.0;
    const nShips = ships.length;
    const nMissiles = missiles.length;
    const nHealth = healths.length;

    const matrixShipColl = new Matrix(nShips, nShips);

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
          Collision.detectCollision(ship, missile, i, j, previousCollision, firstCollision, newCollision, t /*, previousCollisions*/);
        }

        for (let j = i + 1; j < nMissiles; j++) {
          const otherMissile = missiles[j];

          if (missile.isToDelete() || otherMissile.isToDelete()) {
            continue;
          } else if (otherMissile.launchedBy === missile.launchedBy) {
            continue;
          }

          // Collision is not possible if otherMissiles are going in opposite directions
          Collision.detectCollision(otherMissile, missile, i, j, previousCollision,
            firstCollision, newCollision, t /*, previousCollisions*/);
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
          Collision.detectCollision(ship, health, i, j, previousCollision, firstCollision, newCollision, t /*, previousCollisions*/);
        }
      }

      // Check collision between ships for reproduction
      for (let i = 0; i < nShips - 1; i++) {
        const shipA = ships[i];

        for (let j = i + 1; j < nShips; j++) {
          const shipB = ships[j];

          if (shipA.hasPartner() || shipB.hasPartner() || shipA.isDead()
              || shipB.isDead() || shipA.isFamily(shipB) || matrixShipColl.getValueAt(i, j) === 1) {
            continue;
          }

          // Collision is not possible if ships are going in opposite directions
          Collision.detectCollision(shipA, shipB, i, j, previousCollision, firstCollision, newCollision, t); // , previousCollisions);
        }
      }

      if (firstCollision.isEmpty()) {
        // No collision so the ship is following its path until the end of the turn
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
          matrixShipColl.setValueAt(1, firstCollision.idA, firstCollision.idB);
        }

        t += collisionTime;
        previousCollision = firstCollision;
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
