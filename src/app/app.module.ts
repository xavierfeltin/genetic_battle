import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { AppComponent } from './app.component';
import { SceneComponent } from './containers/scene/scene.component';
import { ShipState } from './states/ship.state';
import { WorldState } from './states/world.state';
import { GamedState } from './states/game.state';
import { GameViewerComponent } from './containers/game-viewer/game-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    SceneComponent,
    GameViewerComponent
  ],
  imports: [
    BrowserModule,
    NgxsModule.forRoot([
      //States used in application
      ShipState,
      WorldState,
      GamedState
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
