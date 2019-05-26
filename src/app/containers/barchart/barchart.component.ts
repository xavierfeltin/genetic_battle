import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, Input, ChangeDetectionStrategy } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-barchart',
  template: `
    <div style="width: 400px; height: 250px; position: relative;">
      <h3> {{ title }} </h3>
      <canvas #myBarChart> {{ chart }} </canvas>
    </div>
  `,
  styleUrls: ['./barchart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarChartComponent implements OnInit, OnChanges {
  @ViewChild('myBarChart') private chartRef;

  @Input() data: number[][] = [];
  @Input() labels: string[] = [];
  @Input() serieTitles: string[] = [];
  @Input() title: string;

  private chart: Chart;

  // from http://ksrowell.com/blog-visualizing-data/2012/02/02/optimal-colors-for-graphs/
  private colors: string[] = ['rgb(114,147,203)', 'rgb(225,151,76)', 'rgb(132,186,91)',
    'rgb(211,94,96)', 'rgb(128,133,133)', 'rgb(144,103,167)', 'rgb(171,104,87)', 'rgb(204,194,16)'];

  constructor() { }

  ngOnInit() {

    // Check serie titles consistency, completes with empty titles if needed
    if (!this.serieTitles) {
      this.serieTitles = [];
    }

    if (this.serieTitles.length !== this.data.length) {
      for (let i = this.serieTitles.length; i < this.data.length; i++) {
        this.serieTitles.push('');
      }
    }

    const configuration = this.createDatasets(this.data, this.serieTitles, this.colors);
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: configuration
      },
      options: {
        legend: {
          display: (this.data.length > 1),
          position: 'top'
        },
        scales: {
          xAxes: [{
            display: true
          }],
          yAxes: [{
            display: true,
            ticks: {
              suggestedMax: 100,
              callback: (value, index, values) => {
                return value + '%';
              }
            }
          }],
        }
      }
    });
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.data.previousValue && this.chart) {
      this.updateSerie(change.data.currentValue);
    }
  }

  private createDatasets(data: number[][], label: string[], colors: string[]): any[] {
    const datasets = [];
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const conf = {
          label: label[i],
          data: data[i],
          backgroundColor: colors[i % colors.length]
        };
        datasets.push(conf);
      }
    }
    else {
      const conf = {
        label: '',
        data: [],
        backgroundColor: colors[0]
      };
      datasets.push(conf);
    }

    return datasets;
  }

  private updateSerie(data: number[][]) {
    this.data = data;
    for (let i = 0; i < data.length; i++) {
      this.chart.data.datasets[i].data = this.data[i];
    }
    this.chart.update();
  }
}
