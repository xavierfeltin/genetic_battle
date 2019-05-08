// From: https://blog.thoughtram.io/angular/2015/04/09/developing-a-tabs-component-in-angular-2.html
import { Component } from '@angular/core';
import { Tab } from '../tab/tab.component';

@Component({
  selector: 'tabs',
  styleUrls: ['./tabs.component.css'],
  template: `
    <div class="layout delimiter">
      <ng-container  *ngFor="let tab of tabs" >
        <div class="tab" [class.selected]="tab.active" (click)="selectTab(tab)"> {{tab.tabTitle}} </div>
      </ng-container>
    </div>
    <ng-content></ng-content>
  `
})
export class Tabs {
  tabs: Tab[] = [];

  addTab(tab:Tab) {
    if (this.tabs.length === 0) {
      tab.active = true;
    }
    this.tabs.push(tab);
  }

  selectTab(tab:Tab) {
    this.tabs.forEach((tab) => {
      tab.active = false;
    });

    tab.active = true
  }
}