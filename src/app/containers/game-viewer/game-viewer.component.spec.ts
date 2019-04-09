import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameViewerComponent } from './game-viewer.component';

describe('GameViewerComponent', () => {
  let component: GameViewerComponent;
  let fixture: ComponentFixture<GameViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
