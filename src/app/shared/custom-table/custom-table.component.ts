import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.css']
})
export class CustomTableComponent implements OnInit {
  @Input() columns = [];
  @Input() data = [];

  constructor() { }

  ngOnInit(): void {
  }

}
