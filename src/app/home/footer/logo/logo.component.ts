import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css']
})
export class LogoComponent implements OnInit {
  @Input() url: string;
  @Input() imgSrc: string;
  @Input() tooltip: string;

  constructor() { }

  ngOnInit(): void {
  }

}
