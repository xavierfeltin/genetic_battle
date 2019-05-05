import { Component, OnInit } from '@angular/core';

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
