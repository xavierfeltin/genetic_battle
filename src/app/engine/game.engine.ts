import { ShipRender } from './ship.engine';
import { IBot } from './../bot/bot';
import { TestBot } from './../bot/test';
import { Collision } from './collision.engine';
import { Ship } from '../models/ship.model';
import { Missile } from '../models/missile.model';
import { MissileRender } from './missile.engine';
import { Game } from '../models/game.model';
import { HealthRender } from './health.engine';
import { Health } from '../models/health.model';
import { GameObject } from '../models/game-object.model';
import { Vect2D } from '../models/vect2D.model';
import { MyMath } from '../tools/math.tools';

export class GameEngine {
  private static readonly NB_HEALTH_WHEN_DIE: number = 2;
  private static readonly NB_SHIPS: number = 10;
  private static readonly NB_INIT_HEALTH: number = 20;
  private static readonly RATE_SPAWN_HEALTH: number = 0.005;
  private static readonly RATE_CLONE_SHIP: number = 0.001;


  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  private fps: number;
  private now: number;
  private then: number;
  private interval: number;
  private delta: number;
  private width: number;
  private height: number;

  private ships: ShipRender[] = [];
  private missiles: MissileRender[] = [];
  private health: HealthRender[] = [];
  private bots: IBot[] = [];
  private game: Game;
  private scores: number[] = [0, 0];

  constructor(private readonly idCanvas: string) {
    this.canvas = document.getElementById(idCanvas) as HTMLCanvasElement;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';

    this.fps = 30;
    this.then = Date.now();
    this.interval = 1000 / this.fps;
    this.delta = 0;
    this.now = 0;

    this.game = new Game();
  }

  public run() {
    this.game.start();

    for (let i = 0; i < GameEngine.NB_SHIPS; i++) {
      const pos = new Vect2D(Math.random() * this.width, Math.random() * this.height);
      const orientation = Math.random() * 360;
      this.ships.push(new ShipRender(i, 'rgba(255,0,0,0.8)', pos, orientation, [0, this.width, 0, this.height]));
    }

    this.bots.push(new TestBot(0));
    this.bots.push(new TestBot(1));

    for (let i = 0; i < GameEngine.NB_INIT_HEALTH; i++) {
      this.createHealth(i);
    }

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

      if (!this.game.isOver()) {
        this.playGame();
        this.renderGame();
      } else {
        this.game.start();
      }
    }
  }

  public playGame() {
    // Solve bots actions
    /*
    for(const bot of this.bots) {
      const action = bot.getAction();
      const ship = this.ships[bot.getId()];
      const shipModel = ship.getModel();
      shipModel.applyAction(action);

      if (action.fireAction === 1) {
        const hasFired = shipModel.fire();
        if (hasFired) {
          const startX = shipModel.x_pos; // + shipModel.x_velo;
          const startY = shipModel.y_pos; // + shipModel.y_velo;
          const startOrientation = shipModel.orientation;

          const missile = new MissileRender(this.missiles.length, shipModel.id, startX, startY, startOrientation, [-50, 850, -50, 850]);
          this.missiles.push(missile);
        }
      }
    }
    */

    const missilesModel = this.missiles.map(missile => missile.getModel());
    const healthsModel = this.health.map(health => health.getModel());
    const shipsModel = this.ships.map(ship => ship.getModel());

    // Add possible new health
    if (Math.random() < GameEngine.RATE_SPAWN_HEALTH) {
      this.createHealth(this.health.length);
    }

    // Manage ship actions
    for (const ship of this.ships) {
      const shipModel = ship.getModel();

      // Ship may fire this turn
      if (shipModel.fire(shipsModel)) {
        const startOrientation = shipModel.orientation;
        const missile = new MissileRender(this.missiles.length, shipModel.id, shipModel.pos, startOrientation, [-50, 850, -50, 850]);
        this.missiles.push(missile);
      }

      // Ship may clone this turn
      if (Math.random() < GameEngine.RATE_CLONE_SHIP) {
        const orientation = Math.random() * 360;
        const copy = shipModel.clone(this.ships.length, orientation);

        const renderer = new ShipRender(this.ships.length,
          'rgba(255,0,0,0.8)',
          shipModel.pos,
          orientation,
          [0, this.width, 0, this.height]);
        renderer.setModel(copy);
        this.ships.push(renderer);
      }
    }

    // Update game state
    //const missilesModel = this.missiles.map(missile => missile.getModel());
    //const healthsModel = this.health.map(health => health.getModel());
    //const shipsModel = this.ships.map(ship => ship.getModel());

    for (const ship of shipsModel) {
      ship.behaviors(missilesModel, healthsModel, shipsModel, this.width, this.height);
    }

    const injuries = this.solveTurn(shipsModel, missilesModel, healthsModel);
    // this.game.setScore(injuries);

    // Destroy exploded missiles
    let keep = [];
    for (const missile of this.missiles) {
      const missileModel = missile.getModel();
      if (!missileModel.isOutBorder() && !missileModel.isToDelete()) {
        keep.push(missile);
      }
    }
    this.missiles = keep;

    keep = [];
    for (const health of this.health) {
      const healthModel = health.getModel();
      if (!healthModel.isToDelete()) {
        keep.push(health);
      }
    }
    this.health = keep;

    // Manage ships (fire rate, dead ship, ....)
    keep = [];
    for (const ship of this.ships) {
      const shipModel = ship.getModel();

      if (!shipModel.isDead()) {
        shipModel.acc.mul(0);
        shipModel.updateHeading();
        keep.push(ship);
      } else {
        // Create 2 healths pack
        for (let i = 0; i < GameEngine.NB_HEALTH_WHEN_DIE; i++) {
          const dX = MyMath.random(-50, 50);
          const dY = MyMath.random(-50, 50);
          const coord = new Vect2D(shipModel.pos.x + dX, shipModel.pos.y + dY);
          this.createHealth(this.health.length, coord);
        }
      }
    }

    this.ships = keep;
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
  public updateShip(id: number, pos: Vect2D, orientation: number, fov: number) {
    this.ships[id].update(pos, orientation, fov);
  }
  */

  /*
  public updateMisile(id: number, pos: Vect2D, orientation: number) {
    this.missiles[id].update(pos, orientation);
  }
  */

  private detectCollision(objA: GameObject, objB: GameObject, previousCollision: Collision,
                          firstCollision: Collision, newCollision: Collision, t: number) {
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
      if ((!previousCollision.isEmpty())
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
  private solveTurn(ships: Ship[], missiles: Missile[], healths: Health[]): number[] {

    let t  = 0.0;
    const nShips = ships.length;
    const nMissiles = missiles.length;
    const nHealth = healths.length;

    let previousCollision = Collision.createEmptyCollision();
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

          if (missile.isToDelete()) {
            continue;
          } else if (ship.id === missile.launchedBy) {
            continue;
          }

          // Collision is not possible if ships are going in opposite directions
          this.detectCollision(ship, missile, previousCollision, firstCollision, newCollision, t);
        }

        for (let j = i + 1; j < nMissiles; j++) {
          const otherMissile = missiles[j];

          if (otherMissile.isToDelete()) {
            continue;
          } else if (otherMissile.launchedBy === missile.launchedBy) {
            continue;
          }

          // Collision is not possible if otherMissiles are going in opposite directions
          this.detectCollision(otherMissile, missile, previousCollision, firstCollision, newCollision, t);
        }
      }

      // Check for all the collisions occuring during the turn between Missiles - Ships and Missiles - Missiles
      for (let i = 0; i < nHealth; i++) {
        const health = healths[i];

        for (let j = 0; j < nShips; j++) {
          const ship = ships[j];

          if (health.isToDelete()) {
            continue;
          }

          // Collision is not possible if ships are going in opposite directions
          this.detectCollision(ship, health, previousCollision, firstCollision, newCollision, t);
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
        if (collisionTime === 0.0) {
            collisionTime = 0.0 ; // avoid infinity loop
        }

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
          } else {
            // Ship gets damages
            const missile = firstCollision.objA as Missile;
            const ship = firstCollision.objB as Ship;
            ship.updateLife(missile.getEnergy());

            if (firstCollision.objB.id === 0) {
              nbTouchShipA ++;
            } else {
              nbTouchShipB ++;
            }
          }
        } else if (firstCollision.objA instanceof Health) {
          // Health pack are destroyed when taken
          firstCollision.objA.toDelete = true;

          // Ship is recovering health
          const health = firstCollision.objA as Health;
          const ship = firstCollision.objB as Ship;
          ship.updateLife(health.getEnergy());
        }

        t += collisionTime;
        previousCollision = firstCollision;
      }
    }

    return [nbTouchShipB, nbTouchShipA];
  }

  private createHealth(id: number, pos: Vect2D = null) {
    if (pos == null) {
      pos = new Vect2D(Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height));
    }
    this.health.push(new HealthRender(id, pos));
  }

  private drawShips() {
    for (const ship of this.ships) {
      ship.draw(this.ctx);
    }
  }

  private drawMissiles() {
    for (const missile of this.missiles) {
      missile.draw(this.ctx);
    }
  }

  private drawHealth() {
    for (const health of this.health) {
      health.draw(this.ctx);
    }
  }

  private drawPlayAreas() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.beginPath();
    this.ctx.moveTo(300, 0);
    this.ctx.lineTo(300, this.canvas.height);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(500, 0);
    this.ctx.lineTo(500, this.canvas.height);
    this.ctx.stroke();
  }

  private drawScores() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
    this.ctx.font = '30px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.scores[0].toString() + ' - ' + this.scores[1].toString(), 400, 30);
    this.ctx.restore();
  }
}
