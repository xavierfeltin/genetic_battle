import { Component, OnInit, OnDestroy } from '@angular/core';
import { Scoring } from '../../ia/scoring';
import { SimuInfoService } from '../../services/simu-info.service';
import { of, Observable, Subscription } from 'rxjs';
import { Point } from '../../tools/statistics.tools';
import { MyMath } from '../../tools/math.tools';
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-scoring',
  templateUrl: './scoring.component.html',
  styleUrls: ['./scoring.component.css']
})
export class ScoringComponent implements OnInit, OnDestroy {
  private static readonly MAX_POP = 300; // 5mn
  private subscription: Subscription;
  private subscription2: Subscription;

  scores: Scoring[] = [];
  population: Point[][] = [];
  deadPopulation: Point[][] = [];
  labels: string[] = ['Min', 'Avg', 'Max'];

  private deadMinScore: number = Infinity;
  private deadMaxScore: number = -Infinity;
  private deadAvgScore: number = 0;
  private nbDeads: number = 0;
  private timer: string = '';
  private readonly nbRowsToDisplay = 15;

  constructor(private service: SimuInfoService) { }

  ngOnInit() {
    this.subscription = this.service.getShipsScoring().subscribe(scores => {

      if (scores.length > 0) {
        this.scores = [];
        let maxScore = -Infinity;
        let minScore = Infinity;
        let avgScore = 0;

        for (let scoring of scores) {
          this.scores.push(scoring);

          if (scoring.score > maxScore) {
            maxScore = scoring.score;
          }

          if (scoring.score <  minScore) {
            minScore = scoring.score;
          }

          avgScore += scoring.score;
        }
        avgScore /= scores.length;

        this.scores.sort((a: Scoring, b: Scoring): number => {
          if (a.score < b.score) {
            return 1;
          } else if (a.score === b.score) {
            return 0;
          } else {
            return -1;
          }
        });

        this.timer = this.formatTime(this.scores[0].stamp);
        const minPoint: Point = {
          data: minScore,
          stamp: this.timer
        };

        const maxPoint: Point = {
          data: maxScore,
          stamp: this.timer
        };

        const avgPoint: Point = {
          data: avgScore,
          stamp: this.timer
        };

        this.population = this.addData(this.population, [minPoint, avgPoint, maxPoint]);
      }
    });

    this.subscription2 = this.service.getDeadShipsScoring().subscribe(bufferedScores => {
      for (const scores of bufferedScores) {
        if (scores.length !== 0) {
          this.nbDeads += scores.length;

          for (const scoring of scores) {
            if (scoring.score > this.deadMaxScore) {
              this.deadMaxScore = scoring.score;
            }

            if (scoring.score <  this.deadMinScore) {
              this.deadMinScore = scoring.score;
            }

            this.deadAvgScore += scoring.score;
          }
        }
      }

      const minPoint: Point = {
        data: this.deadMinScore === Infinity ? 0 : this.deadMinScore,
        stamp: this.timer
      };

      const maxPoint: Point = {
        data: this.deadMaxScore === -Infinity ? 0 : this.deadMaxScore,
        stamp: this.timer
      };

      const avgPoint: Point = {
        data: this.nbDeads !== 0 ? this.deadAvgScore / this.nbDeads : 0,
        stamp: this.timer
      };

      this.deadPopulation = this.addData(this.deadPopulation, [minPoint, avgPoint, maxPoint]);
    });
  }

  private addData(population: Point[][], points: Point[]) {
    const newPopulation = [];

    for (let i = 0; i < points.length; i++) {
      newPopulation[i] = [];
    }

    for (let i = 0; i < points.length; i++) {
      if (population.length > 0 ) {
        newPopulation[i] = [...population[i], points[i]];
      } else {
        newPopulation[i].push(points[i]);
      }

      if (newPopulation[i].length > ScoringComponent.MAX_POP) {
        const _ = newPopulation[i].shift();
      }
    }

    return newPopulation;
  }

  public getPopulation$(): Observable<Point[][]> {
    return of(this.population);
  }

  public getDeadPopulation$(): Observable<Point[][]> {
    return of(this.deadPopulation);
  }

  public getLabels$(): Observable<string[]> {
    return of(this.labels);
  }

  public formatTime(elapsedTime: number, nbGeneration: number = -1): string {
    return MyMath.formatTime(elapsedTime, nbGeneration);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
  }
}
