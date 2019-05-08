// From: https://blog.thoughtram.io/angular/2015/04/09/developing-a-tabs-component-in-angular-2.html
import { Component, Input } from '@angular/core';
import { Tabs } from '../tabs/tabs.component';

@Component({
  selector: 'tab',
  styleUrls: ['./tab.component.css'],
  template: `
    <div [hidden]="!active">
      <ng-content></ng-content>
    </div>
  `
})
export class Tab {
  @Input() tabTitle: string;
  active: boolean;

  constructor(tabs: Tabs) {
    tabs.addTab(this)
  }
}