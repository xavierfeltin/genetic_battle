import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { AppComponent } from './app.component';
import { SceneComponent } from './containers/scene/scene.component';
import { ShipState } from './states/ship.state';
import { WorldState } from './states/world.state';
import { GamedState } from './states/game.state';
import { GameViewerComponent } from './containers/game-viewer/game-viewer.component';
import { ShipComponent } from './containers/ship/ship.component';
import { OldestShipsComponent } from './containers/oldest-ships/oldest-ships.component';
import { SimuConfigComponent } from './containers/simu-config/simu-config.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Tabs } from './common/tabs/tabs.component';
import { Tab } from './common/tab/tab.component';
import { LineChartComponent } from './containers/linechart/linechart.component';
import { BarChartComponent } from './containers/barchart/barchart.component';

@NgModule({
  declarations: [
    AppComponent,
    SceneComponent,
    GameViewerComponent,
    ShipComponent,
    OldestShipsComponent,
    SimuConfigComponent,
    Tabs,
    Tab,
    LineChartComponent,
    BarChartComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
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
