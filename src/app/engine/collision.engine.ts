import { GameObject } from '../models/game-object.model';
import { Vect2D } from '../models/vect2D.model';

export class Collision {
    public collTime: number;
    public objA: GameObject = null;
    public objB: GameObject = null;
    public idA = -1;
    public idB = -1;

    public constructor(A: GameObject, B: GameObject, indexA: number, indexB: number,  t: number) {
        this.collTime = t;
        this.objA = A;
        this.objB = B;
        this.idA = indexA;
        this.idB = indexB;
    }

    public static createEmptyCollision() {
        return new Collision(null, null, -1, -1, -1.0);
    }

    private static get_closest(vOther: Vect2D, vA: Vect2D, vB: Vect2D): Vect2D {
        const ax = vA.x;
        const bx = vB.x;
        const ay = vA.y;
        const by = vB.y;

        const da = by - ay;
        const db = ax - bx;
        const c1 = da * ax + db * ay;
        const c2 = -db * vOther.x + da * vOther.y;
        const det = da * da + db * db;

        let closestPointX = 0;
        let closestPointY = 0;
        if (det === 0) {
            // Point is already on the line (ab)
            closestPointX = vOther.x;
            closestPointY = vOther.y;
        } else {
            // Compute orthogonal projection of current point on the line (ab)
            closestPointX = (da * c1 - db * c2) / det;
            closestPointY = (da * c2 + db * c1) / det;
        }

        return new Vect2D(closestPointX, closestPointY);
    }

    public static getCollsion(objA: GameObject, objB: GameObject, indexA: number, indexB: number): Collision {
        // Use square distance to avoid using root function
        const distanceToOther = objA.pos.distance2(objB.pos);
        const radii = (objA.radius + objB.radius);
        const radiiSquared = radii * radii;

        if (distanceToOther <= radiiSquared) {
            // Units are already in contact so there is an immediate collision
            return new Collision(objA, objB, indexA, indexB, 0.0);
        }

        // Optimisation : units with the same vector speed will never collide
        if (objA.velo.eq(objB.velo)) {
            return Collision.createEmptyCollision();
        }

        if (distanceToOther > 100) {
            return Collision.createEmptyCollision();
        }

        // Set other unit as the new reference (other is stationary and is positionned at (0, 0)
        const vObjARef = Vect2D.sub(objA.pos, objB.pos);
        const vObjBRef = new Vect2D(0, 0);
        const dVelo = Vect2D.sub(objA.velo, objB.velo);

        // Get the closest point to other unit (which is in (0,0)) on the line described by the pod speed vector
        // closest_projection = other_in_referential.get_closest(pod_in_referential, Point(x + vx, y + vy))
        const vClosestProjection = Collision.get_closest(vObjBRef, vObjARef, Vect2D.add(objA.pos, objA.velo));

        // Distance(squared) between the other unit and the closest point to the other unit on the line described by our speed vector
        const distanceUnitClosestProjection = vObjBRef.distance2(vClosestProjection);

        // Distance(squared) between the pod and the projection
        let distancePodClosestProjection = vObjARef.distance2(vClosestProjection);

        // If the distance between other unit and this line is less than the sum of the radii, there might be a collision
        if (distanceUnitClosestProjection <= radiiSquared) {
            // The pod speed on the line (norm)
            const speedDistance = dVelo.norm;

            // Project the pod on the line to find the point of impact
            const distanceIntersectionUnits = Math.sqrt(radiiSquared - distanceUnitClosestProjection);
            vClosestProjection.x = vClosestProjection.x - distanceIntersectionUnits * (dVelo.x / speedDistance);
            vClosestProjection.y = vClosestProjection.y - distanceIntersectionUnits * (dVelo.y / speedDistance);

            // If the projection point is further away means the pod direction is opposite of the other unit
            // => no collision will happen
            const updatedDistancePodClosestProjection = vObjARef.distance2(vClosestProjection);
            if ( updatedDistancePodClosestProjection > distancePodClosestProjection) {
                return Collision.createEmptyCollision();
            }

            distancePodClosestProjection = Math.sqrt(updatedDistancePodClosestProjection);

            // If the impact point is further than what the pod can travel in one turn
            // Collision will be managed in another turn
            if (distancePodClosestProjection > speedDistance) {
                return Collision.createEmptyCollision();
            }

            // Get the time needed to reach the impact point during this turn
            const t = (distancePodClosestProjection / speedDistance);

            if (t > 1.0) {
                return Collision.createEmptyCollision(); // no taking into account late collision
            }

            return new Collision(objA, objB, indexA, indexB, t);
        } else {
            return Collision.createEmptyCollision();
        }
    }

    public setCollision(collision: Collision) {
        this.collTime = collision.collTime;
        this.objA = collision.objA;
        this.objB = collision.objB;
        this.idA = collision.idA;
        this.idB = collision.idB;
    }

    public isEmpty(): boolean {
        return this.collTime === -1 && this.objA == null && this.objB == null;
    }
}
