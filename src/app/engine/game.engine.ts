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

export class GameEngine {
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
    this.ships.push(new ShipRender(0, 'rgba(255,0,0,0.8)', 0, 0, 0, [0, 300, 0, 800]));
    this.ships.push(new ShipRender(1, 'rgba(0,150,0.6)', 800, 0, 180, [500, 800, 0, 800]));

    this.bots.push(new TestBot(0));
    this.bots.push(new TestBot(1));

    for (let i = 0; i < 40; i++) {
      this.health.push(new HealthRender(i, Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height)));
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
      //const t0 = performance.now();

        if (!this.game.isOver()) {
          this.playGame();
          this.renderGame();
        }
        else {
          this.game.start();
        }

      //const t1 = performance.now();
      //console.log('Solveturn: ' + (t1 - t0) + ' ms');
    }
  }

  public playGame() {
    // Solve bots actions
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

    // Update game state
    const shipsModel = this.ships.map(ship => ship.getModel());
    const missilesModel = this.missiles.map(missile => missile.getModel());
    const healthsModel = this.health.map(health => health.getModel());

    const injuries = this.solveTurn(shipsModel, missilesModel, healthsModel);
    this.game.setScore(injuries);

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

    // Manage fire rate
    for (const ship of this.ships) {
      const shipModel = ship.getModel();
      shipModel.reduceCoolDown();
    }
  }

  private renderGame() {
    // Draw the frame after time interval is expired
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPlayAreas();
    this.drawShips();
    this.drawMissiles();
    this.drawHealth();
    this.drawScores();
  }

  public updateShip(id: number, x: number, y: number, orientation: number, fov: number) {
    this.ships[id].update(x, y, orientation, fov);
  }

  public updateMisile(id: number, x: number, y: number, orientation: number) {
    this.missiles[id].update(x, y, orientation);
  }

  private detectCollision(objA: GameObject, objB: GameObject, previousCollision: Collision,
                          firstCollision: Collision, newCollision: Collision, t: number): Collision[] {
    // Collision is not possible if ships are going in opposite directions
    let collision: Collision = null;

    if ((objA.x_pos < objB.x_pos && objA.x_velo < 0.0 && objB.x_velo > 0.0)
            || (objB.x_pos < objA.x_pos && objB.x_velo < 0.0 && objA.x_velo > 0.0)
            || (objA.y_pos < objB.y_pos && objA.y_velo < 0.0 && objB.y_velo > 0.0)
            || (objB.y_pos < objA.y_pos && objB.y_velo < 0.0 && objA.y_velo > 0.0)) {
      collision = null;
    } else {
      collision = Collision.getCollsion(objB, objA);
    }

    if (collision != null) {
      if ((previousCollision != null)
              && ((collision.objA == previousCollision.objA && collision.objB == previousCollision.objB && collision.collTime == previousCollision.collTime)
                || (collision.objB == previousCollision.objA && collision.objA == previousCollision.objB && collision.collTime == previousCollision.collTime))) {
          newCollision = null;
      } else {
        newCollision = collision;

        // If the collision happens earlier than the current one we keep it
        if ((newCollision.collTime + t) < 1.0 && (firstCollision == null || newCollision.collTime < firstCollision.collTime)) {
          firstCollision = newCollision;
        }
      }
    }

    return [previousCollision, firstCollision, newCollision];
  }

  // Return an array with number of missiles which has touched ship A and ship B
  private solveTurn(ships: Ship[], missiles: Missile[], healths: Health[]): number[] {
    let t  = 0.0;
    const nShips = ships.length;
    const nMissiles = missiles.length;
    const nHealth = healths.length;

    let previousCollision = null;
    let nbTouchShipA = 0;
    let nbTouchShipB = 0;

    while (t < 1.0) {
      let firstCollision = null;
      let newCollision = null;

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

          //Collision is not possible if ships are going in opposite directions
          const collisions = this.detectCollision(ship, missile, previousCollision, firstCollision, newCollision, t);
          previousCollision = collisions[0];
          firstCollision = collisions[1];
          newCollision = collisions[2];

          /*
          let collision: Collision = null;
          if ((ship.x_pos < missile.x_pos && ship.x_velo < 0.0 && missile.x_velo > 0.0)
                  || (missile.x_pos < ship.x_pos && missile.x_velo < 0.0 && ship.x_velo > 0.0)
                  || (ship.y_pos < missile.y_pos && ship.y_velo < 0.0 && missile.y_velo > 0.0)
                  || (missile.y_pos < ship.y_pos && missile.y_velo < 0.0 && ship.y_velo > 0.0)) {
              collision = null;
          } else {
            collision = Collision.getCollsion(missile, ship);
          }

          if (collision != null) {
            if ((previousCollision != null)
                    && ((collision.objA == previousCollision.objA && collision.objB == previousCollision.objB && collision.collTime == previousCollision.collTime)
                      || (collision.objB == previousCollision.objB && collision.objA == previousCollision.objA && collision.collTime == previousCollision.collTime))) {
                newCollision = null;
            } else {
              newCollision = collision;

              // If the collision happens earlier than the current one we keep it
              if ((newCollision.collTime + t) < 1.0 && (firstCollision == null || newCollision.collTime < firstCollision.collTime)) {
                firstCollision = newCollision;
              }
            }
          }
          */
        }

        for (let j = i + 1; j < nMissiles; j++) {
          const otherMissile = missiles[j];

          if (otherMissile.isToDelete()) {
            continue;
          } else if (otherMissile.launchedBy === missile.launchedBy) {
            continue;
          }

          // Collision is not possible if otherMissiles are going in opposite directions
          const collisions = this.detectCollision(otherMissile, missile, previousCollision, firstCollision, newCollision, t);
          previousCollision = collisions[0];
          firstCollision = collisions[1];
          newCollision = collisions[2];
          /*
          let collision: Collision = null;
          if ((otherMissile.x_pos < missile.x_pos && otherMissile.x_velo < 0.0 && missile.x_velo > 0.0)
                  || (missile.x_pos < otherMissile.x_pos && missile.x_velo < 0.0 && otherMissile.x_velo > 0.0)
                  || (otherMissile.y_pos < missile.y_pos && otherMissile.y_velo < 0.0 && missile.y_velo > 0.0)
                  || (missile.y_pos < otherMissile.y_pos && missile.y_velo < 0.0 && otherMissile.y_velo > 0.0)) {
              collision = null;
          } else {
            collision = Collision.getCollsion(missile, otherMissile);
          }

          if (collision != null) {
            if ((previousCollision != null)
                    && ((collision.objA == previousCollision.objA && collision.objB == previousCollision.objB && collision.collTime == previousCollision.collTime)
                      || (collision.objB == previousCollision.objB && collision.objA == previousCollision.objA && collision.collTime == previousCollision.collTime))) {
                newCollision = null;
            } else {
              newCollision = collision;

              // If the collision happens earlier than the current one we keep it
              if ((newCollision.collTime + t) < 1.0 && (firstCollision == null || newCollision.collTime < firstCollision.collTime)) {
                firstCollision = newCollision;
              }
            }
          }
          */
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
          const collisions = this.detectCollision(ship, health, previousCollision, firstCollision, newCollision, t);
          previousCollision = collisions[0];
          firstCollision = collisions[1];
          newCollision = collisions[2];

          /*
          let collision: Collision = null;
          if ((ship.x_pos < health.x_pos && ship.x_velo < 0.0 && health.x_velo > 0.0)
                  || (health.x_pos < ship.x_pos && health.x_velo < 0.0 && ship.x_velo > 0.0)
                  || (ship.y_pos < health.y_pos && ship.y_velo < 0.0 && health.y_velo > 0.0)
                  || (health.y_pos < ship.y_pos && health.y_velo < 0.0 && ship.y_velo > 0.0)) {
              collision = null;
          } else {
            collision = Collision.getCollsion(health, ship);
          }

          if (collision != null) {
            if ((previousCollision != null)
                    && ((collision.objA == previousCollision.objA && collision.objB == previousCollision.objB && collision.collTime == previousCollision.collTime)
                      || (collision.objB == previousCollision.objB && collision.objA == previousCollision.objA && collision.collTime == previousCollision.collTime))) {
                newCollision = null;
            } else {
              newCollision = collision;

              // If the collision happens earlier than the current one we keep it
              if ((newCollision.collTime + t) < 1.0 && (firstCollision == null || newCollision.collTime < firstCollision.collTime)) {
                firstCollision = newCollision;
              }
            }
          }
          */
        }
      }

      if (firstCollision == null) {
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
            // TODO: ship is losing health
            if (firstCollision.objB.id === 0) {
              nbTouchShipA ++;
            } else {
              nbTouchShipB ++;
            }
          }
        } else if (firstCollision.objA instanceof Health) {
          // Health pack are destroyed when taken
          firstCollision.objA.toDelete = true;

          // TODO: ship is gaining health
        }

        t += collisionTime;
        previousCollision = firstCollision;
      }
    }

    return [nbTouchShipB, nbTouchShipA];
  }

  /* SAVE
  private solveTurn(ships: Ship[], missiles: Missile[], healths: Health[]): number[] {
    let t  = 0.0;
    const nShips = ships.length;
    const nMissiles = missiles.length;

    let previousCollision = null;
    let nbTouchShipA = 0;
    let nbTouchShipB = 0;

    while (t < 1.0) {
      let firstCollision = null;
      let newCollision = null;

      // Check for all the collisions occuring during the turn
      for (let i = 0; i < nMissiles; i++) {
        const missile = missiles[i];

        for (let j = 0; j < nShips; j++) {
          let ship = ships[j];

          if (missile.isToDelete()) {
            continue;
          } else if (ship.id === missile.launchedBy) {
            continue;
          }

          //Collision is not possible if ships are going in opposite directions
          let collision: Collision = null;
          if ((ship.x_pos < missile.x_pos && ship.x_velo < 0.0 && missile.x_velo > 0.0)
                  || (missile.x_pos < ship.x_pos && missile.x_velo < 0.0 && ship.x_velo > 0.0)
                  || (ship.y_pos < missile.y_pos && ship.y_velo < 0.0 && missile.y_velo > 0.0)
                  || (missile.y_pos < ship.y_pos && missile.y_velo < 0.0 && ship.y_velo > 0.0)) {
              collision = null;
          } else {
            collision = Collision.getCollsion(missile, ship);
          }

          if (collision != null) {
            if ((previousCollision != null)
                    && ((collision.objA == previousCollision.objA && collision.objB == previousCollision.objB && collision.collTime == previousCollision.collTime)
                      || (collision.objB == previousCollision.objB && collision.objA == previousCollision.b && collision.collTime == previousCollision.collTime))) {
                newCollision = null;
            } else {
              newCollision = collision;

              // If the collision happens earlier than the current one we keep it
              if ((newCollision.collTime + t) < 1.0 && (firstCollision == null || newCollision.collTime < firstCollision.collTime)) {
                firstCollision = newCollision;
              }
            }
          }
        }

        for (let j = i + 1; j < nMissiles; j++) {
          const otherMissile = missiles[j];

          if (otherMissile.isToDelete()) {
            continue;
          } else if (otherMissile.launchedBy === missile.launchedBy) {
            continue;
          }

          // Collision is not possible if otherMissiles are going in opposite directions
          let collision: Collision = null;
          if ((otherMissile.x_pos < missile.x_pos && otherMissile.x_velo < 0.0 && missile.x_velo > 0.0)
                  || (missile.x_pos < otherMissile.x_pos && missile.x_velo < 0.0 && otherMissile.x_velo > 0.0)
                  || (otherMissile.y_pos < missile.y_pos && otherMissile.y_velo < 0.0 && missile.y_velo > 0.0)
                  || (missile.y_pos < otherMissile.y_pos && missile.y_velo < 0.0 && otherMissile.y_velo > 0.0)) {
              collision = null;
          } else {
            collision = Collision.getCollsion(missile, otherMissile);
          }

          if (collision != null) {
            if ((previousCollision != null)
                    && ((collision.objA == previousCollision.objA && collision.objB == previousCollision.objB && collision.collTime == previousCollision.collTime)
                      || (collision.objB == previousCollision.objB && collision.objA == previousCollision.b && collision.collTime == previousCollision.collTime))) {
                newCollision = null;
            } else {
              newCollision = collision;

              // If the collision happens earlier than the current one we keep it
              if ((newCollision.collTime + t) < 1.0 && (firstCollision == null || newCollision.collTime < firstCollision.collTime)) {
                firstCollision = newCollision;
              }
            }
          }
        }
      }

      if (firstCollision == null) {
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
          //ships[i].move(1.0 - collisionTime);
          ships[i].move(collisionTime - t);
        }

        for (let i = 0; i < nMissiles; i++) {
          if (!missiles[i].isToDelete()) {
            //missiles[i].move(1.0 - collisionTime);
            missiles[i].move(collisionTime - t);
          }
        }

        // Solve the collision
        // ObjA is a missile
        firstCollision.objA.toDelete = true;

        if (firstCollision.objB instanceof Missile) {
          firstCollision.objB.toDelete = true;
        } else {
          // TODO: ship is moving back under impact
          // firstCollision.objB.bounce(firstCollision.objA)
          if (firstCollision.objB.id === 0) {
            nbTouchShipA ++;
          } else {
            nbTouchShipB ++;
          }
        }

        t += collisionTime;
        previousCollision = firstCollision;
      }
    }

    return [nbTouchShipB, nbTouchShipA];
  }
  */


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