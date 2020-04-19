import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-selection-sheet',
  templateUrl: './selection-sheet.component.html',
  styleUrls: ['./selection-sheet.component.scss']
})
export class SelectionSheetComponent {
  @Output() undo = new EventEmitter();
  @Output() done = new EventEmitter();

  @Input() text: string;
  @Input() undoDisabled: boolean;
  @Input() doneDisabled: boolean;

  constructor() {
  }

  onUndo() {
    if (!this.undoDisabled) {
      this.undo.emit();
    }
  }

  onDone() {
    if (!this.doneDisabled) {
      this.done.emit();
    }
  }

}
