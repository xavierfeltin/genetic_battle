import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { GameEngine } from '../../engine/game.engine'
import { WorldStateModel, WorldState } from 'src/app/states/world.state';
import { ShipStateModel, ShipState } from 'src/app/states/ship.state';
import { Store, Select } from '@ngxs/store';
import { StartGame, NextTurn } from 'src/app/actions/game.action';
import { SetShip } from 'src/app/actions/ship.action';
import { BotService } from 'src/app/services/bot.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit, AfterViewInit  {
  private scene: GameEngine;

  @Input() ships: ShipStateModel = null;
  @Input() world: WorldStateModel = null;
  
  constructor(/*private store: Store, private botService: BotService*/) { }

  ngOnInit() {
   // this.configureShips();
  }

  ngAfterViewInit() {
    // Create our scene class using the render canvas element
    this.scene = new GameEngine('scene');
    this.scene.run();
    /*
    for(const ship of this.ships.ships) {
      this.scene.updateShip(ship.id, ship.x_pos, ship.y_pos, ship.orientation, ship.getFOV());
    }

    this.store.dispatch(new StartGame());
    */
  }

  /*
  ngOnChanges(changes) {    
    if (this.scene) {
      //Manage update game state
      if(changes.world.currentValue.isUpdated === true) {
        for(const ship of this.ships.ships) {
          this.scene.updateShip(ship.id, ship.x_pos, ship.y_pos, ship.orientation, ship.fov);
        }

        //TODO missiles

        this.store.dispatch(new NextTurn());
      }
    }
  }
  */

  /*
  private configureShips() {
    this.store.dispatch(new SetShip(0, 100, 100, 0, 45)); 
    this.store.dispatch(new SetShip(0, 600, 600, 180, 45));
  }
  */
}
 