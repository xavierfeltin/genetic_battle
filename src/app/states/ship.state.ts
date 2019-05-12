import { State, Action, StateContext, Selector } from '@ngxs/store';
import { SetShip, TurnLeft, TurnRight, MoveForward, Fire, ChangeFOV } from '../actions/ship.action';
import { Ship } from '../models/ship.model';
import { PhysicsEngine } from '../engine/physics.engine';
//import { HelperGameObject } from '../models/game-object.model';

export class ShipStateModel {
    ships: Ship[];
}

@State<ShipStateModel> ({
    name: 'ships',
    defaults: {
        ships: []
    }
})
export class ShipState {
    @Selector()
    static getShips(state: ShipStateModel) {
        return state.ships;
    }

    @Selector()
    static getState(state: ShipStateModel) {
        return state;
    }

    @Action(SetShip)
    setShip(ctx: StateContext<ShipStateModel>, { id, xInit, yInit, orientInit, fovInit }: SetShip) {        
        const ref = ctx.getState();
        const updShips = [...ref.ships];
        const results = updShips.filter(ship => ship.id == id);

        if (results.length == 1) {
            let ship = results[0]; 
            /*ship = {
                id: ship.id,
                x_pos: xInit,
                y_pos: yInit,
                x_orient: 0,
                y_orient: 0,
                orientation: orientInit,
                x_velo: 0,
                y_velo: 0,
                fov: fovInit,
                speed: 10, //TODO: make it a constant somewhere...
                x_min: 0, //TODO: make bound var as paramaters
                x_max: 300,
                y_min: 0,
                y_max: 800
            }
            */
        }
        else if (results.length == 0) {
            let ship = {
                id: id,
                x_pos: xInit,
                y_pos: yInit,
                x_orient: 0,
                y_orient: 0,
                orientation: orientInit,
                x_velo: 0,
                y_velo: 0,
                fov: fovInit,
                speed: 10, //TODO: make it a constant somewhere...
                x_min: 0, //TODO: make bound var as paramaters
                x_max: 300,
                y_min: 0,
                y_max: 800
            }
            //updShips.push(ship);
        }
        //else TODO manage multiple same ids... 

        ctx.patchState({
            ships: updShips
        });                      
    }

    @Action(TurnLeft)
    turnLeft(ctx: StateContext<ShipStateModel>, { id }: TurnLeft) { 
        const ref = ctx.getState();
        const updShips = [...ref.ships];
        const results = updShips.filter(ship => ship.id == id);

        if (results.length == 1) {
            let ship = results[0]; 
            ship.orientation -=3; //TODO make it a constant
            //HelperGameObject.move(ship);
        }
        //else: TODO id absent or multiple reference
        
        ctx.patchState({
            ships: updShips
        });  
    }

    @Action(TurnRight)
    turnRight(ctx: StateContext<ShipStateModel>, { id }: TurnRight) { 
        const ref = ctx.getState();
        const updShips = [...ref.ships];
        const results = updShips.filter(ship => ship.id == id);

        if (results.length == 1) {
            let ship = results[0]; 
            ship.orientation +=3; //TODO make it a constant
            //HelperGameObject.move(ship);
        }
        //else: TODO id absent or multiple reference
        
        ctx.patchState({
            ships: updShips
        });  
    }

    @Action(MoveForward)
    moveForward(ctx: StateContext<ShipStateModel>, { id }: MoveForward) { 
        const ref = ctx.getState();

        const updShips = [...ref.ships];
        const results = updShips.filter(ship => ship.id == id);

        if (results.length == 1) {
            let ship = results[0]; 
            //HelperGameObject.move(ship);
            console.log("move ship " + id);
        }
        //else: TODO id absent or multiple reference
        
        ctx.patchState({
            ships: updShips
        });  
    }

    @Action(Fire)
    fire(ctx: StateContext<ShipStateModel>, { id }: Fire) { 
        //Do nothing for now  
    }

    @Action(ChangeFOV)
    changeFOV(ctx: StateContext<ShipStateModel>, { id, newFOV }: ChangeFOV) { 
        const ref = ctx.getState();
        const updShips = [...ref.ships];
        const results = updShips.filter(ship => ship.id == id);

        if (results.length == 1) {
            let ship = results[0]; 
            //ship.fov = newFOV;
        }
        //else: TODO id absent or multiple reference
        
        ctx.patchState({
            ships: updShips
        });  
    }
}