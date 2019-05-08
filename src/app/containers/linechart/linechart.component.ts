import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Point } from '../../tools/statistics.tools';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-linechart',
  template: `
    <div style="width: 400px; height: 200px; position: relative;">
      <h3> {{ title }} </h3>
      <canvas #myChart> {{ chart }} </canvas>
    </div>
  `,
  styleUrls: ['./linechart.component.css']
})
export class LineChartComponent implements OnInit, OnChanges {
  @ViewChild('myChart') private chartRef;

  @Input() population: Point[] = [];
  @Input() title: string;
  
  private chart: Chart;

  constructor() { }

  ngOnInit() {
    const labels = this.population.map(pop => pop.stamp);
    const serie = this.population.map(pop => pop.data);

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{ 
            label: "Nb of ships",
            data: serie,
            borderColor: "#3e95cd",
            fill: false
        }]
      },
      options: {
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

  ngOnChanges(change: SimpleChanges) {
    if (change.population.previousValue) {      
      this.updateSerie(change.population.currentValue);
    }
  }

  private updateSerie(population: Point[]) {
    const labels = population.map(pop => pop.stamp);
    const serie = population.map(pop => pop.data);

    this.chart.data.datasets[0].data = serie;    
    this.chart.data.labels = labels;
    this.chart.update();
  }
}
