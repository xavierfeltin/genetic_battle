import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { ShipState, ShipStateModel } from 'src/app/states/ship.state';
import { WorldState, WorldStateModel } from 'src/app/states/world.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-viewer',
  templateUrl: './game-viewer.component.html',
  styleUrls: ['./game-viewer.component.css']
})
export class GameViewerComponent implements OnInit {

  //@Select(ShipState.getState) ships$: Observable<ShipStateModel>;
  //@Select(WorldState.getState) world$: Observable<WorldStateModel>;

  constructor() { }

  ngOnInit() {
  }

}
