import { Component, OnInit } from '@angular/core';
import { NewsFetchService } from './news/news-fetch.service';
import { News } from './news/news.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  newsList: News[] = [];

  constructor(private newsFetchService: NewsFetchService) {}

  ngOnInit() {
    this.newsFetchService.fetchNews().subscribe((fetchedNews) => {
      this.newsList = fetchedNews["News"];
    });
  }

}
