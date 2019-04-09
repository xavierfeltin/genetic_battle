import { State, Action, StateContext, Selector } from '@ngxs/store';
import { UpdateWorld , SetDirty} from '../actions/world.action';

export class WorldStateModel {
    isUpdated: boolean;
}

@State<WorldStateModel> ({
    name: 'world',
    defaults: {
        isUpdated: false
    }
})
export class WorldState {
    @Selector()
    static getState(state: WorldStateModel) {
        return state;  
    }

    @Action(UpdateWorld)
    updateWorld(ctx: StateContext<WorldStateModel>, { }: UpdateWorld) {        
        ctx.patchState({
            isUpdated: true
        });
    }

    @Action(SetDirty)
    setDirty(ctx: StateContext<WorldStateModel>, { }: SetDirty) {        
        ctx.patchState({
            isUpdated: false
        });
    }
}