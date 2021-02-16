import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotFoundComponent } from "./home/not-found/not-found.component";

const routes: Routes = [
  { path: 'not-found', component: NotFoundComponent},
  { path: '**', redirectTo: "/not-found"}
];

/* Class is needed to allow non-AppComponent routes to be resolved.
  Must be last Routing module in imports */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WildcardRoutingModule {
}
