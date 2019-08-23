import { Component, OnInit, OnDestroy } from '@angular/core';
import { Scoring } from '../../ia/scoring';
import { SimuInfoService } from '../../services/simu-info.service';
import { of, Observable, Subscription } from 'rxjs';
import { Point } from '../../tools/statistics.tools';
import { MyMath } from '../../tools/math.tools';

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
  fitnessPopulation: Point[][] = [];
  labels: string[] = ['Min', 'Avg', 'Max'];

  private deadMinScore: number = Infinity;
  private deadMaxScore: number = -Infinity;
  private deadAvgScore: number = 0;
  private nbDeads: number = 0;
  private time: number = 0;
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

        for (const scoring of scores) {
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

        this.time = this.scores[0].stamp;
        this.timer = this.formatTime(this.time);
        const minPoint: Point = {
          data: minScore,
          timer: this.time,
          stamp: this.timer
        };

        const maxPoint: Point = {
          data: maxScore,
          timer: this.time,
          stamp: this.timer
        };

        const avgPoint: Point = {
          data: avgScore,
          timer: this.time,
          stamp: this.timer
        };

        this.population = this.addData(this.population, [minPoint, avgPoint, maxPoint]);
      }
    });

    this.subscription2 = this.service.getShipsScoring().subscribe(scores => {

      if (scores.length > 0) {
        this.scores = [];
        let maxScore = -Infinity;
        let minScore = Infinity;
        let avgScore = 0;

        for (const scoring of scores) {
          this.scores.push(scoring);

          if (scoring.fitness > maxScore) {
            maxScore = scoring.fitness;
          }

          if (scoring.fitness <  minScore) {
            minScore = scoring.fitness;
          }

          avgScore += scoring.fitness;
        }
        avgScore /= scores.length;

        this.scores.sort((a: Scoring, b: Scoring): number => {
          if (a.fitness < b.fitness) {
            return 1;
          } else if (a.fitness === b.fitness) {
            return 0;
          } else {
            return -1;
          }
        });

        this.time = this.scores[0].stamp;
        this.timer = this.formatTime(this.time);
        const minPoint: Point = {
          data: minScore,
          timer: this.time,
          stamp: this.timer
        };

        const maxPoint: Point = {
          data: maxScore,
          timer: this.time,
          stamp: this.timer
        };

        const avgPoint: Point = {
          data: avgScore,
          timer: this.time,
          stamp: this.timer
        };

        this.fitnessPopulation = this.addData(this.fitnessPopulation, [minPoint, avgPoint, maxPoint]);
      }
    });
  }

  private addData(population: Point[][], points: Point[]) {
    const newPopulation = [];

    for (let i = 0; i < points.length; i++) {
      newPopulation[i] = [];
    }

    for (let i = 0; i < points.length; i++) {
      // Clear data if reset

      if (population.length !== 0
        && population[i].length !== 0
        && points[i].timer < population[i][population[i].length - 1].timer) {
        population[i] = [];
      }

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

  public getFitnessPopulation$(): Observable<Point[][]> {
    return of(this.fitnessPopulation);
  }

  public getLabels$(): Observable<string[]> {
    return of(this.labels);
  }

  public formatTime(elapsedTime: number, nbGeneration: number = -1): string {
    return MyMath.formatTime(elapsedTime, nbGeneration);
  }

  private resetReferenceValues() {
    this.nbDeads = 0;
    this.deadMaxScore = -Infinity;
    this.deadMinScore = Infinity;
    this.deadAvgScore = 0;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription2.unsubscribe();
  }
}
