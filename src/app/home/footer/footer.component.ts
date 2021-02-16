import { Component, OnInit } from '@angular/core';

export interface Logo {
  url: string,
  imgSrc: string,
  tooltip: string
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  logos: Logo[] = [
    {url: "https://getbootstrap.com/", imgSrc: "assets/img/footer-images/bootstrap.png", tooltip: "Bootstrap"},
    {url: "https://spring.io/projects/spring-boot", imgSrc: "assets/img/footer-images/spring-boot.png", tooltip: "Spring Boot"},
    {url: "https://spring.io/projects/spring-security", imgSrc: "assets/img/footer-images/spring-security.png", tooltip: "Spring Security"},
    {url: "https://hibernate.org/orm/", imgSrc: "assets/img/footer-images/hibernate.png", tooltip: "Hibernate"},
    {url: "https://www.mysql.com/", imgSrc: "assets/img/footer-images/mysql.png", tooltip: "MySQL"},
    {url: "https://angular.io/", imgSrc: "assets/img/footer-images/angular.png", tooltip: "Angular"},
    {url: "https://material.angular.io/", imgSrc: "assets/img/footer-images/angular-material.png", tooltip: "Angular Material"}];

  textLinks: {"url": string, "name": string}[] = [
    {"url": "https://stomp-js.github.io/stomp-websocket/codo/extra/docs-src/Introduction.md.html", "name": "StompJS"},
    {"url": null, "name": "Java Websockets"}
  ]

  constructor() {
    this.logos.push()
  }

  ngOnInit(): void {
  }

}
