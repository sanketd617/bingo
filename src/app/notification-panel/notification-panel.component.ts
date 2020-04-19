import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-notification-panel',
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss']
})
export class NotificationPanelComponent {

  @Input() text: string;

  constructor() { }

}
