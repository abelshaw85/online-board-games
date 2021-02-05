import { Component, Input, OnInit } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent implements OnInit {
  @Input() mode: ProgressSpinnerMode = 'indeterminate'; //determinate = not loading, set at value
  @Input() value = 0; //percent of bar loaded
  @Input() size = 50;
  @Input() message: string = "";


  constructor() { }

  ngOnInit(): void {
  }

}
