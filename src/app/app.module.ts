import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { AppComponent } from './app.component';
import { SceneComponent } from './containers/scene/scene.component';
import { GameViewerComponent } from './containers/game-viewer/game-viewer.component';
import { OldestShipsComponent } from './containers/oldest-ships/oldest-ships.component';
import { SimuConfigComponent } from './containers/simu-config/simu-config.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Tabs } from './common/tabs/tabs.component';
import { Tab } from './common/tab/tab.component';
import { LineChartComponent } from './containers/linechart/linechart.component';
import { BarChartComponent } from './containers/barchart/barchart.component';
import { RadarChartComponent } from './containers/radarchart/radarchart.component';
import { ScoringComponent } from './containers/scoring/scoring.component';

@NgModule({
  declarations: [
    AppComponent,
    SceneComponent,
    GameViewerComponent,
    OldestShipsComponent,
    SimuConfigComponent,
    Tabs,
    Tab,
    LineChartComponent,
    BarChartComponent,
    RadarChartComponent,
    ScoringComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
