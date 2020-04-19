import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionSheetComponent } from './selection-sheet.component';

describe('SelectionSheetComponent', () => {
  let component: SelectionSheetComponent;
  let fixture: ComponentFixture<SelectionSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
