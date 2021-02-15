import { Component, OnInit } from '@angular/core';
import { NewsFetchService } from '../news/news-fetch.service';
import { News } from '../news/news.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  newsList: News[] = [];

  constructor(private newsFetchService: NewsFetchService) {}

  ngOnInit() {
    //this.newsList.push(new News("Added news component", "Update", new Date("02/15/2021"), "This is a <b>fantastic</b> news update with lots of <i>formatting!</i>"));

    this.newsFetchService.fetchNews().subscribe((fetchedNews) => {
      this.newsList = fetchedNews["News"];
    });
  }

}
