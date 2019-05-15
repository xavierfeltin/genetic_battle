import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Matrix } from './matrix';

describe('Matrix', () => {
  let component: Matrix;
  let fixture: ComponentFixture<Matrix>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Matrix ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Matrix);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });
});
