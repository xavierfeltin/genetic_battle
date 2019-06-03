import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Point } from '../../tools/statistics.tools';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-linechart',
  template: `
    <div style="width: 400px; height: 250px; position: relative;">
      <h3> {{ title }} </h3>
      <canvas #myChart> {{ chart }} </canvas>
    </div>
  `,
  styleUrls: ['./linechart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent implements OnInit, OnChanges {
  @ViewChild('myChart') private chartRef;

  /*
  @Input() population: Point[] = [];
  @Input() title: string = '';
  @Input() label: string = '';
  private chart: Chart;
  */

  @Input() population: Point[][];
  @Input() labels: string[];
  @Input() title: string;

  private chart: Chart;
  private isInit: boolean = false;

  // from http://ksrowell.com/blog-visualizing-data/2012/02/02/optimal-colors-for-graphs/
  private colors: string[] = ['rgb(114,147,203)', 'rgb(225,151,76)', 'rgb(132,186,91)',
    'rgb(211,94,96)', 'rgb(128,133,133)', 'rgb(144,103,167)', 'rgb(171,104,87)', 'rgb(204,194,16)'];

  constructor() { }

  ngOnInit() {
    if (this.population !== undefined && this.population.length !== 0) {
      this.buildChart();
      this.isInit = true;
    } else {
      this.chart = new Chart(this.chartRef.nativeElement, {
        type: 'line',
        data: {
          labels: [], // X axis labels
          datasets: []
        },
        options: {
          responsive: true,
          elements: {
            point: {
                radius: 0
            }
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              display: true
            }],
            yAxes: [{
              display: true,
              ticks: {
                beginAtZero: true
              }
            }],
          }
        }
      });
    }
  }

  ngOnChanges(change: SimpleChanges) {
    if (!this.isInit && this.population !== undefined && this.population.length !== 0) {
      this.buildChart();
      this.isInit = true;
    }

    if (change.population.previousValue) {
      // this.chart.clear();
      this.updateSerie(change.population.currentValue);
    }
  }

  private buildChart() {
    let popLabels = null;
    let configuration = null;

    popLabels = this.population[0].map(pop => pop.stamp);
    configuration = this.createDatasets(this.population, this.labels, this.colors);

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: popLabels, // X axis labels
        datasets: configuration
      },
      options: {
        elements: {
          point: {
            radius: 0
          }
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: true
          }],
          yAxes: [{
            display: true,
            ticks: {
              beginAtZero: true
            }
          }],
        }
      }
    });
  }

  private createDatasets(population: Point[][], labels: string[], colors: string[]): any[] {
    const datasets = [];
    if (population.length > 0) {
      for (let i = 0; i < population.length; i++) {
        const serie = population[i].map(pop => pop.data.toPrecision(2));
        const conf = {
          label: labels[i], // Serie label
          data: serie,
          borderColor: colors[i % colors.length],
          fill: false
        };
        datasets.push(conf);
      }
    } else {
      const conf = {
        label: '',
        data: [],
        backgroundColor: colors[0]
      };
      datasets.push(conf);
    }

    return datasets;
  }

  private updateSerie(population: Point[][]) {
    this.population = population;
    const nbSeries = this.population.length;
    const popLabels = this.population[0].map((pop: Point) => pop.stamp);

    for (let i = 0; i < nbSeries; i++) {
      const serie = this.population[i].map((pop: Point) => pop.data.toPrecision(2));
      this.chart.data.datasets[i].data = serie;
      this.chart.data.labels = popLabels;
    }
    this.chart.update();
  }
}
