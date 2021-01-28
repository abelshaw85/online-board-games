import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinGamesComponent } from './join-games.component';

describe('JoinGamesComponent', () => {
  let component: JoinGamesComponent;
  let fixture: ComponentFixture<JoinGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinGamesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
