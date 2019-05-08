import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, Input } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-barchart',
  template: `
    <div style="width: 400px; height: 200px; position: relative;">
      <h3> {{ title }} </h3>
      <canvas #myBarChart> {{ chart }} </canvas>
    </div>
  `,
  styleUrls: ['./barchart.component.css']
})
export class BarChartComponent implements OnInit, OnChanges {
  @ViewChild('myBarChart') private chartRef;
  
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  @Input() title: string;

  private chart: Chart;

  constructor() { }

  ngOnInit() {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{ 
            data: this.data,
            backgroundColor: "#add8e6"
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
            display: true
          }],
        }
      }
    });
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.data.previousValue) {      
      this.updateSerie(change.labels.currentValue, change.data.currentValue);
    }
  }

  private updateSerie(labels: string[], data: number[]) {
    this.labels = labels;
    this.data = data;

    debugger;
    this.chart.data.datasets[0].data = this.data;    
    this.chart.data.labels = this.labels;
    this.chart.update();
  }
}
