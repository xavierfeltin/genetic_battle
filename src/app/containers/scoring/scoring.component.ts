import { Component, OnInit } from '@angular/core';
import { Scoring } from '../../ia/scoring';
import { SimuInfoService } from '../../services/simu-info.service';
import { of, Observable } from 'rxjs';
import { Point } from '../../tools/statistics.tools';
import { MyMath } from 'src/app/tools/math.tools';

@Component({
  selector: 'app-scoring',
  templateUrl: './scoring.component.html',
  styleUrls: ['./scoring.component.css']
})
export class ScoringComponent implements OnInit {
  private static readonly MAX_POP = 50;
  scores: Scoring[] = [];
  population: Point[] = [];

  constructor(private service: SimuInfoService) { }

  ngOnInit() {
    this.service.getAllShips().subscribe(ships => {
      this.scores = [];
      ships.map(ship => {
        this.scores.push(ship.getScore());
      });

      this.scores.sort((a: Scoring, b: Scoring): number => {
        if (a.score < b.score) {
          return 1;
        } else if (a.score === b.score) {
          return 0;
        } else {
          return -1;
        }
      });
    });

    this.service.getGenerationHighScore().subscribe((score: Scoring) => {
      const point: Point = {
        data: score.score,
        stamp: score.generation.toString()
      };

      this.addData(point);
    });
  }

  addData(point: Point) {
    this.population = [...this.population, point];
    if (this.population.length > ScoringComponent.MAX_POP) {
      const _ = this.population.shift();
    }
  }

  public getPopulation$(): Observable<Point[]> {
    return of(this.population);
  }

  public formatTime(elapsedTime: number, nbGeneration: number = -1): string {
    return MyMath.formatTime(elapsedTime, nbGeneration);
  }
}
