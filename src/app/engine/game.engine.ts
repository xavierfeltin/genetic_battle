import { ShipRender } from './ship.engine';
import { IBot } from './../bot/bot';
import { TestBot } from './../bot/test';
import { Collision } from './collision.engine';
import { Ship } from '../models/ship.model';
import { Missile } from '../models/missile.model';
import { MissileRender } from './missile.engine';

export class GameEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private fps: number;
  private now: number;
  private then: number;
  private interval: number;
  private delta: number;

  private ships: ShipRender[] = [];
  private missiles: MissileRender[] = [];
  private bots: IBot[] = [];

  constructor(private readonly idCanvas: string) {
    this.canvas = document.getElementById(idCanvas) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';

    this.fps = 30;
    this.then = Date.now();
    this.interval = 1000 / this.fps;
    this.delta = 0;
    this.now = 0;
  }

  public run() {
    this.ships.push(new ShipRender(0, 'rgba(255,0,0,0.8)', 0, 0, 0, [0, 300, 0, 800]));
    this.ships.push(new ShipRender(1, 'rgba(0,150,0.6)', 800, 0, 180, [500, 800, 0, 800]));

    this.bots.push(new TestBot(0));
    this.bots.push(new TestBot(1));

    window.requestAnimationFrame(() => this.animate());
  }

  public updateShip(id: number, x: number, y: number, orientation: number, fov: number) {
    this.ships[id].update(x, y, orientation, fov);
  }

  public updateMisile(id: number, x: number, y: number, orientation: number) {
    this.missiles[id].update(x, y, orientation);
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
      const t0 = performance.now();

      // update game state
      for(const bot of this.bots) {
        const action = bot.getAction();
        const ship = this.ships[bot.getId()];
        const shipModel = ship.getModel();
        shipModel.applyAction(action);

        if (action.fireAction === 1) {
          const startX = shipModel.x_pos; //+ shipModel.x_velo;
          const startY = shipModel.y_pos; //+ shipModel.y_velo;
          const startOrientation = shipModel.orientation;

          const missile = new MissileRender(this.missiles.length, shipModel.id, startX, startY, startOrientation, [-50, 850, -50, 850]);
          this.missiles.push(missile);
        }

        // shipModel.move();
      }

      const shipsModel = this.ships.map(ship => ship.getModel());
      const missilesModel = this.missiles.map(missile => missile.getModel());

      this.solveTurn(shipsModel, missilesModel);

      const keep = [];
      for (const missile of this.missiles) {
        const missileModel = missile.getModel();
        // missileModel.move();
        if (!missileModel.isOutBorder() && !missileModel.isToDelete()) {
          keep.push(missile);
        }
      }
      this.missiles = keep;

      // Draw the frame after time interval is expired
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawPlayAreas();
      this.drawShips();
      this.drawMissiles();

      const t1 = performance.now();
      console.log('Solveturn: ' + (t1 - t0) + ' ms');
    }
  }

  // Return an array with number of missiles which has touched ship A and ship B
  private solveTurn(ships: Ship[], missiles: Missile[]): number[] {
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
          }
          else if (ship.id === missile.launchedBy) {
            continue;
          }

          //Collision is not possible if ships are going in opposite directions
          let collision: Collision = null;
          if ((ship.x_pos < missile.x_pos && ship.x_velo < 0.0 && missile.x_velo > 0.0)
                  || (missile.x_pos < ship.x_pos && missile.x_velo < 0.0 && ship.x_velo > 0.0)
                  || (ship.y_pos < missile.y_pos && ship.y_velo < 0.0 && missile.y_velo > 0.0)
                  || (missile.y_pos < ship.y_pos && missile.y_velo < 0.0 && ship.y_velo > 0.0)) {
              collision = null;
          }
          else {
            collision = Collision.getCollsion(missile, ship);
          }

          if (collision != null) {
            if ((previousCollision != null)
                    && ((collision.objA == previousCollision.objA && collision.objB == previousCollision.objB && collision.collTime == previousCollision.collTime)
                      || (collision.objB == previousCollision.oobjBjA && collision.objA == previousCollision.b && collision.collTime == previousCollision.collTime))) {
                newCollision = null;
            }
            else {
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
          }
          else if (otherMissile.launchedBy === missile.launchedBy) {
            continue;
          }

          // Collision is not possible if otherMissiles are going in opposite directions
          let collision: Collision = null;
          if ((otherMissile.x_pos < missile.x_pos && otherMissile.x_velo < 0.0 && missile.x_velo > 0.0)
                  || (missile.x_pos < otherMissile.x_pos && missile.x_velo < 0.0 && otherMissile.x_velo > 0.0)
                  || (otherMissile.y_pos < missile.y_pos && otherMissile.y_velo < 0.0 && missile.y_velo > 0.0)
                  || (missile.y_pos < otherMissile.y_pos && missile.y_velo < 0.0 && otherMissile.y_velo > 0.0)) {
              collision = null;
          }
          else {
            collision = Collision.getCollsion(missile, otherMissile);
          }

          if (collision != null) {
            if ((previousCollision != null)
                    && ((collision.objA == previousCollision.objA && collision.objB == previousCollision.objB && collision.collTime == previousCollision.collTime)
                      || (collision.objB == previousCollision.oobjBjA && collision.objA == previousCollision.b && collision.collTime == previousCollision.collTime))) {
                newCollision = null;
            }
            else {
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
      }
      else {
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
        }
        else {
          // TODO: ship is moving back under impact
          // firstCollision.objB.bounce(firstCollision.objA)
          if (firstCollision.objB.id === 0) {
            nbTouchShipA ++;
          }
          else {
            nbTouchShipB ++;
          }
        }

        t += collisionTime;
        previousCollision = firstCollision;
      }
    }

    return [nbTouchShipA, nbTouchShipB];
  }


  private drawShips() {
    for (const ship of this.ships) {
      ship.draw(this.canvas, this.ctx);
    }
  }

  private drawMissiles() {
    for (const missile of this.missiles) {
      missile.draw(this.canvas, this.ctx);
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
}