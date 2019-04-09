import { Injectable } from '@angular/core';
import { Store, Actions, ofActionDispatched, ofActionSuccessful } from '@ngxs/store';
import { MoveForward } from '../actions/ship.action';
import { NextTurn, ProcessBot } from '../actions/game.action';

@Injectable({
  providedIn: 'root'
})
export class BotService {

  constructor(private store: Store, private actions$: Actions) {
    //Call this routinge each time a next turn starts
    this.actions$.pipe(ofActionSuccessful(ProcessBot)).subscribe((id: number) => {
      //Delay is used to allow the UI to finish rendering properly
      this.delay(5000).then(() => { 
        //this.store.dispatch(new BeginProcessing());
        this.playBot(id);
        //this.store.dispatch(new EndProcessing());
      })      
    });
  }

  private async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) ); 
  }

  private  playBot(id: number) {
    this.store.dispatch(new MoveForward(id)); //ships can go only forward for now :p   
  }
}