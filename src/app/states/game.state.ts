import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { NextTurn, ProcessBot, StartGame } from '../actions/game.action';
import { ShipState } from './ship.state';
import { SetDirty, UpdateWorld } from '../actions/world.action';

export class GameStateModel {
    turn: number;
}

@State<GameStateModel> ({
    name: 'game',
    defaults: {
        turn: 0
    }
})
export class GamedState {
    constructor(private store: Store) {}

    @Action(StartGame)
    startGame(ctx: StateContext<GameStateModel>, { }: StartGame) {        
        ctx.dispatch(new NextTurn());
    }

    @Action(NextTurn)
    nextTurn(ctx: StateContext<GameStateModel>, { }: NextTurn) {        
        ctx.dispatch(new SetDirty());
        
        // Asking bots of each ship to process
        const ships = this.store.selectSnapshot(ShipState.getShips);
        const nbShips = ships.length;
        for(let i = 0; i < nbShips; i++) {
            ctx.dispatch(new ProcessBot(i)); 
        }

        const ref = ctx.getState();
        ctx.patchState({
            turn: ref.turn + 1
        });

        //Once all bots have processed update World state
        ctx.dispatch(new UpdateWorld());
    }

    @Action(ProcessBot)
    processBot(ctx: StateContext<GameStateModel>, { id }: ProcessBot) {        
        return; //used to trigger Bot processing
    }
}