import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { exhaust } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { News } from "./news.model";

@Injectable({
  providedIn: 'root'
})
export class NewsFetchService {
  constructor(private httpClient: HttpClient) {}

  fetchNews() {
    return this.httpClient.get<News[]>(environment.newsJson);
  }
}
