import { Component, OnInit } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent implements OnInit {
  mode: ProgressSpinnerMode = 'indeterminate'; //determinate = not loading, set at value
  value = 0; //percent of bar loaded

  constructor() { }

  ngOnInit(): void {
  }

}
