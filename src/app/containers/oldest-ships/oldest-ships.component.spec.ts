import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OldestShipsComponent } from './oldest-ships.component';

describe('OldestShipsComponent', () => {
  let component: OldestShipsComponent;
  let fixture: ComponentFixture<OldestShipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OldestShipsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OldestShipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
