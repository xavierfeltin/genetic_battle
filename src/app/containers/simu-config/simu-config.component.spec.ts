import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimuConfigComponent } from './simu-config.component';

describe('SimuConfigComponent', () => {
  let component: SimuConfigComponent;
  let fixture: ComponentFixture<SimuConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimuConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimuConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
