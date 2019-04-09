import { GameObject } from '../models/game-object.model';

export class Collision {
    public collTime: number = 0;
    public objA: GameObject = null;
    public objB: GameObject = null;

    public constructor(A: GameObject, B: GameObject, t: number) {
        this.collTime = t;
        this.objA = A;
        this.objB = B;
    }

    public static getDistance2(objA: GameObject, objB: GameObject): number {
        const x = (objA.x_pos - objB.x_pos);
        const y = (objA.y_pos - objB.y_pos);
        return x*x + y*y;
    }

    public static getCoordDistance2(xA: number, yA: number, xB: number, yB: number): number {
        const x = (xA - xB);
        const y = (yA - yB);
        return x*x + y*y;

    }

    public static getCollsion(objA: GameObject, objB: GameObject): Collision {
        //Use square distance to avoid using root function
        const distanceToOther = Collision.getDistance2(objA, objB);
        const radii = (objA.radius + objB.radius);
        const radiiSquared = radii * radii;

        if (distanceToOther < radiiSquared) {
            //Units are already in contact so there is an immediate collision
            return new Collision(objA, objB, 0.0);
        }

        //Optimisation : units with the same vector speed will never collide
        if (objA.x_velo == objB.x_velo && objA.y_velo == objB.y_velo) {
            return null;
        }

        if (distanceToOther > 400) {
            return null;
        }

        //Set other unit as the new reference (other is stationary and is positionned at (0, 0)
        const objA_ref_x_pos = objA.x_pos - objB.x_pos;
        const objA_ref_y_pos = objA.y_pos - objB.y_pos; //pod_in_referential = Point(x, y)
        const objB_ref_x_pos = 0;
        const objB_ref_y_pos = 0; //other_in_referential = Point(0, 0)
        const vx = objA.x_velo - objB.x_velo
        const vy = objA.y_velo - objB.y_velo
        
        //Get the closest point to other unit (which is in (0,0)) on the line described by the pod speed vector
        //closest_projection = other_in_referential.get_closest(pod_in_referential, Point(x + vx, y + vy))
        let x_closest_projection = 0;
        let y_closest_projection = 0;

        //Distance(squared) between the other unit and the closest point to the other unit on the line described by our speed vector
        const distanceUnitClosestProjection = Collision.getCoordDistance2(objB_ref_x_pos, objB_ref_y_pos, x_closest_projection, y_closest_projection);

        //Distance(squared) between the pod and the projection
        let distancePodClosestProjection = Collision.getCoordDistance2(objA_ref_x_pos, objA_ref_y_pos, x_closest_projection, y_closest_projection);

        //If the distance between other unit and this line is less than the sum of the radii, there might be a collision
        if (distanceUnitClosestProjection < radiiSquared) {
            //The pod speed on the line (norm)
            const speedDistance = vx * vx + vy * vy;

            //Project the pod on the line to find the point of impact
            const distanceIntersectionUnits = Math.sqrt(radiiSquared - distanceUnitClosestProjection);
            x_closest_projection = x_closest_projection - distanceIntersectionUnits * (vx / speedDistance);
            y_closest_projection = y_closest_projection - distanceIntersectionUnits * (vy / speedDistance);

            //If the projection point is further away means the pod direction is opposite of the other unit
            //=> no collision will happen
            const updatedDistancePodClosestProjection = Collision.getCoordDistance2(objA_ref_x_pos, objA_ref_y_pos, x_closest_projection, y_closest_projection); 
            if ( updatedDistancePodClosestProjection > distancePodClosestProjection) {
                return null;
            }

            distancePodClosestProjection = Math.sqrt(updatedDistancePodClosestProjection);

            //If the impact point is further than what the pod can travel in one turn
            //Collision will be managed in another turn
            if (distancePodClosestProjection > speedDistance) {
                return null;
            }

            //Get the time needed to reach the impact point during this turn
            const t = (distancePodClosestProjection / speedDistance);

            if (t > 1.0) {
                return null; //no taking into account late collision
            }

            return new Collision(objA, objB, t);
        }
        else {
            return null;
        }
    }
}