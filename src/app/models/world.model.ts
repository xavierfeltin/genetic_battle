import { Ship } from './ship.model';
import { GameObject } from './game-object.model';

export interface World {
    ships: Ship[];
    missiles: GameObject[];
}