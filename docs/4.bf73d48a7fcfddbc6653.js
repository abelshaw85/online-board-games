(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{Yj9t:function(e,r,t){"use strict";t.r(r),t.d(r,"AuthModule",(function(){return B}));var s=t("PCNd"),n=t("tyNb"),i=t("wHSu"),o=t("fXoL"),a=t("qXBG"),c=t("3Pt+"),g=t("ofXK"),b=t("6NWb"),d=t("zy28");function u(e,r){if(1&e&&(o.Pb(0,"div",23),o.Ac(1),o.Ob()),2&e){const e=o.ac();o.zb(1),o.Bc(e.errorMessage)}}function l(e,r){if(1&e&&(o.Pb(0,"div",24),o.Ac(1),o.Ob()),2&e){const e=o.ac();o.zb(1),o.Bc(e.successMessage)}}function m(e,r){1&e&&(o.Pb(0,"div",25),o.Ac(1," Username is required. "),o.Ob())}function f(e,r){1&e&&(o.Pb(0,"div",25),o.Ac(1," Password is required. "),o.Ob())}function p(e,r){1&e&&(o.Pb(0,"div",26),o.Lb(1,"app-loading-spinner",27),o.Ob()),2&e&&(o.zb(1),o.gc("message","Logging in..."))}const h=function(){return["/register"]};let v=(()=>{class e{constructor(e,r,t){this.route=e,this.router=r,this.authService=t,this.faUser=i.d,this.faLock=i.a,this.sending=!1}ngOnInit(){switch(this.route.snapshot.queryParamMap.get("error")){case"unauthorised":this.errorMessage="You must be logged in to access that page."}}submitLogin(e){let r={username:e.value.username,password:e.value.password};this.handleLogin(r.username,r.password)}handleLogin(e,r){this.sending=!0,this.authService.login(e,r).subscribe(e=>{this.successMessage="Login Successful.",this.errorMessage=null,this.router.navigate([""]),this.sending=!1},()=>{this.errorMessage="Error logging in, please check your credentials.",this.successMessage=null,this.sending=!1})}}return e.\u0275fac=function(r){return new(r||e)(o.Kb(n.a),o.Kb(n.b),o.Kb(a.a))},e.\u0275cmp=o.Eb({type:e,selectors:[["app-login"]],decls:33,vars:10,consts:[[1,"col-md-8","offset-md-2"],[1,"card","row"],[1,"card-header","bg-dark","text-light"],[1,"card-body"],[1,"form-group",3,"ngSubmit"],["f","ngForm"],[1,"input-group"],["class","alert alert-warning","style","width: 100%;",4,"ngIf"],["class","alert alert-success","style","width: 100%;",4,"ngIf"],[1,"input-group-prepend"],[1,"input-group-text"],[3,"icon"],["type","text","name","username","ngModel","","placeholder","Username","required","",1,"form-control"],["username","ngModel"],["class","errorMessage ml-5",4,"ngIf"],[1,"mb-3"],["type","password","name","password","ngModel","","placeholder","Password","required","",1,"form-control"],["password","ngModel"],[1,"form-group"],["type","submit",1,"btn","btn-custom",2,"width","100%",3,"disabled"],["class","mt-2",4,"ngIf"],[1,"text-center"],[3,"routerLink"],[1,"alert","alert-warning",2,"width","100%"],[1,"alert","alert-success",2,"width","100%"],[1,"errorMessage","ml-5"],[1,"mt-2"],[3,"message"]],template:function(e,r){if(1&e){const e=o.Qb();o.Pb(0,"div",0),o.Pb(1,"div",1),o.Pb(2,"div",2),o.Ac(3," Login "),o.Ob(),o.Pb(4,"div",3),o.Pb(5,"form",4,5),o.Wb("ngSubmit",(function(){o.pc(e);const t=o.nc(6);return r.submitLogin(t)})),o.Pb(7,"div",6),o.zc(8,u,2,1,"div",7),o.zc(9,l,2,1,"div",8),o.Ob(),o.Pb(10,"div",6),o.Pb(11,"div",9),o.Pb(12,"span",10),o.Lb(13,"fa-icon",11),o.Ob(),o.Ob(),o.Lb(14,"input",12,13),o.Ob(),o.zc(16,m,2,0,"div",14),o.Lb(17,"div",15),o.Pb(18,"div",6),o.Pb(19,"div",9),o.Pb(20,"span",10),o.Lb(21,"fa-icon",11),o.Ob(),o.Ob(),o.Lb(22,"input",16,17),o.Ob(),o.zc(24,f,2,0,"div",14),o.Lb(25,"div",15),o.Pb(26,"div",18),o.Pb(27,"button",19),o.Ac(28," Login "),o.Ob(),o.zc(29,p,2,1,"div",20),o.Ob(),o.Ob(),o.Pb(30,"div",21),o.Pb(31,"a",22),o.Ac(32,"Register a new account."),o.Ob(),o.Ob(),o.Ob(),o.Ob(),o.Ob()}if(2&e){const e=o.nc(6),t=o.nc(15),s=o.nc(23);o.zb(8),o.gc("ngIf",null!=r.errorMessage),o.zb(1),o.gc("ngIf",null!=r.successMessage),o.zb(4),o.gc("icon",r.faUser),o.zb(3),o.gc("ngIf",t.touched&&t.errors),o.zb(5),o.gc("icon",r.faLock),o.zb(3),o.gc("ngIf",s.touched&&s.errors),o.zb(3),o.gc("disabled",!e.valid),o.zb(2),o.gc("ngIf",r.sending),o.zb(2),o.gc("routerLink",o.ic(9,h))}},directives:[c.H,c.s,c.t,g.t,b.b,c.c,c.r,c.u,c.C,n.e,d.a],styles:[""]}),e})();function w(e,r){if(1&e&&(o.Pb(0,"div",22),o.Ac(1),o.Ob()),2&e){const e=o.ac();o.zb(1),o.Bc(e.errorMessage)}}const P=function(){return["auth","login"]};function z(e,r){if(1&e&&(o.Pb(0,"div",23),o.Ac(1),o.Pb(2,"a",21),o.Ac(3,"login"),o.Ob(),o.Ob()),2&e){const e=o.ac();o.zb(1),o.Cc("",e.successMessage," "),o.zb(1),o.gc("routerLink",o.ic(2,P))}}function O(e,r){1&e&&(o.Pb(0,"div"),o.Ac(1," Username is required. "),o.Ob())}function L(e,r){1&e&&(o.Pb(0,"div"),o.Ac(1," Username can be no more than 15 characters long. "),o.Ob())}function y(e,r){1&e&&(o.Pb(0,"div"),o.Ac(1," Username can only contain letters, numbers, hyphens and underscores. "),o.Ob())}function I(e,r){if(1&e&&(o.Pb(0,"div",24),o.zc(1,O,2,0,"div",25),o.zc(2,L,2,0,"div",25),o.zc(3,y,2,0,"div",25),o.Ob()),2&e){const e=o.ac();o.zb(1),o.gc("ngIf",e.registrationForm.get("username").errors.required),o.zb(1),o.gc("ngIf",e.registrationForm.get("username").errors.maxlength),o.zb(1),o.gc("ngIf",e.registrationForm.get("username").errors.pattern)}}function F(e,r){1&e&&(o.Pb(0,"div"),o.Ac(1," Password is required. "),o.Ob())}function M(e,r){1&e&&(o.Pb(0,"div"),o.Ac(1," Password must be at least 8 characters long. "),o.Ob())}function A(e,r){1&e&&(o.Pb(0,"div"),o.Ac(1," Password must contain a combination of capital and lower case letters, and at least one number and special character (@$!%*?&). "),o.Ob())}function k(e,r){if(1&e&&(o.Pb(0,"div",24),o.zc(1,F,2,0,"div",25),o.zc(2,M,2,0,"div",25),o.zc(3,A,2,0,"div",25),o.Ob()),2&e){const e=o.ac();o.zb(1),o.gc("ngIf",e.registrationForm.get("password").errors.required),o.zb(1),o.gc("ngIf",e.registrationForm.get("password").errors.minlength),o.zb(1),o.gc("ngIf",e.registrationForm.get("password").errors.pattern)}}function q(e,r){1&e&&(o.Pb(0,"div"),o.Ac(1," Matching password is required. "),o.Ob())}function S(e,r){if(1&e&&(o.Pb(0,"div",24),o.zc(1,q,2,0,"div",25),o.Ob()),2&e){const e=o.ac();o.zb(1),o.gc("ngIf",e.registrationForm.get("matchingPassword").errors.required)}}function x(e,r){1&e&&(o.Pb(0,"div",24),o.Ac(1," Passwords do not match. "),o.Ob())}function U(e,r){1&e&&(o.Pb(0,"div",26),o.Lb(1,"app-loading-spinner",27),o.Ob()),2&e&&(o.zb(1),o.gc("message","Registering account..."))}const C=function(){return["/auth","login"]},R=[{path:"",component:v},{path:"login",component:v},{path:"logout",component:v},{path:"register",component:(()=>{class e{constructor(e){this.authService=e,this.faUser=i.d,this.faLock=i.a,this.sending=!1}ngOnInit(){this.registrationForm=new c.i({username:new c.f(null,[c.F.required,c.F.maxLength(15),c.F.pattern("[\\w_-]{1,15}")]),password:new c.f("",[c.F.required,c.F.minLength(8),c.F.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$")]),matchingPassword:new c.f("",[c.F.required])},this.checkPasswords)}submitRegistration(){if(this.registrationForm.valid){const e=this.registrationForm.get("username").value,r=this.registrationForm.get("password").value,t=this.registrationForm.get("matchingPassword").value;this.sending=!0,this.authService.register(e,r,t).subscribe(e=>{let r=e;"RegistrationSuccess"==r.type?(this.successMessage="Registration successful! You may now login.",this.errorMessage=null):(this.errorMessage=r.message,this.successMessage=null),this.sending=!1},e=>{this.errorMessage="Something went wrong, please check your internet connection or try again later.",this.sending=!1})}}checkPasswords(e){return e.get("password").value===e.get("matchingPassword").value?null:{notSame:!0}}}return e.\u0275fac=function(r){return new(r||e)(o.Kb(a.a))},e.\u0275cmp=o.Eb({type:e,selectors:[["app-register"]],decls:38,vars:14,consts:[[1,"col-md-8","offset-md-2"],[1,"card","row"],[1,"card-header","bg-dark","text-light"],[1,"card-body"],[1,"form-group",3,"formGroup","ngSubmit"],[1,"input-group","mb-3"],["class","alert alert-warning","style","width: 100%;",4,"ngIf"],["class","alert alert-success","style","width: 100%;",4,"ngIf"],[1,"input-group"],[1,"input-group-prepend"],[1,"input-group-text"],[3,"icon"],["type","text","name","username","formControlName","username","placeholder","Username (*)",1,"form-control"],["class","errorMessage ml-5",4,"ngIf"],[1,"mb-3"],["type","password","name","password","formControlName","password","placeholder","Password (*)",1,"form-control"],["type","password","name","matchingPassword","formControlName","matchingPassword","placeholder","Confirm Password (*)",1,"form-control"],[1,"form-group"],["type","submit",1,"btn","btn-custom",2,"width","100%",3,"disabled"],["style","text-align: center;","class","mt-2",4,"ngIf"],[1,"text-center"],[3,"routerLink"],[1,"alert","alert-warning",2,"width","100%"],[1,"alert","alert-success",2,"width","100%"],[1,"errorMessage","ml-5"],[4,"ngIf"],[1,"mt-2",2,"text-align","center"],[3,"message"]],template:function(e,r){1&e&&(o.Pb(0,"div",0),o.Pb(1,"div",1),o.Pb(2,"div",2),o.Ac(3," Register new account "),o.Ob(),o.Pb(4,"div",3),o.Pb(5,"form",4),o.Wb("ngSubmit",(function(){return r.submitRegistration()})),o.Pb(6,"div",5),o.zc(7,w,2,1,"div",6),o.zc(8,z,4,3,"div",7),o.Ob(),o.Pb(9,"div",8),o.Pb(10,"div",9),o.Pb(11,"span",10),o.Lb(12,"fa-icon",11),o.Ob(),o.Ob(),o.Lb(13,"input",12),o.Ob(),o.zc(14,I,4,3,"div",13),o.Lb(15,"div",14),o.Pb(16,"div",8),o.Pb(17,"div",9),o.Pb(18,"span",10),o.Lb(19,"fa-icon",11),o.Ob(),o.Ob(),o.Lb(20,"input",15),o.Ob(),o.zc(21,k,4,3,"div",13),o.Lb(22,"div",14),o.Pb(23,"div",8),o.Pb(24,"div",9),o.Pb(25,"span",10),o.Lb(26,"fa-icon",11),o.Ob(),o.Ob(),o.Lb(27,"input",16),o.Ob(),o.zc(28,S,2,1,"div",13),o.zc(29,x,2,0,"div",13),o.Lb(30,"div",14),o.Pb(31,"div",17),o.Pb(32,"button",18),o.Ac(33," Register "),o.Ob(),o.zc(34,U,2,1,"div",19),o.Ob(),o.Ob(),o.Pb(35,"div",20),o.Pb(36,"a",21),o.Ac(37,"Back to Login."),o.Ob(),o.Ob(),o.Ob(),o.Ob(),o.Ob()),2&e&&(o.zb(5),o.gc("formGroup",r.registrationForm),o.zb(2),o.gc("ngIf",null!=r.errorMessage),o.zb(1),o.gc("ngIf",null!=r.successMessage),o.zb(4),o.gc("icon",r.faUser),o.zb(2),o.gc("ngIf",r.registrationForm.get("username").invalid&&r.registrationForm.get("username").touched),o.zb(5),o.gc("icon",r.faLock),o.zb(2),o.gc("ngIf",r.registrationForm.get("password").invalid&&r.registrationForm.get("password").touched),o.zb(5),o.gc("icon",r.faLock),o.zb(2),o.gc("ngIf",r.registrationForm.get("matchingPassword").invalid&&r.registrationForm.get("matchingPassword").touched),o.zb(1),o.gc("ngIf",r.registrationForm.get("matchingPassword").touched&&(null==r.registrationForm.errors?null:r.registrationForm.errors.notSame)),o.zb(3),o.gc("disabled",r.registrationForm.invalid),o.zb(2),o.gc("ngIf",r.sending),o.zb(2),o.gc("routerLink",o.ic(13,C)))},directives:[c.H,c.s,c.j,g.t,b.b,c.c,c.r,c.h,n.e,d.a],styles:[""]}),e})()}];let N=(()=>{class e{}return e.\u0275mod=o.Ib({type:e}),e.\u0275inj=o.Hb({factory:function(r){return new(r||e)},imports:[[n.f.forChild(R)],n.f]}),e})(),B=(()=>{class e{}return e.\u0275mod=o.Ib({type:e}),e.\u0275inj=o.Hb({factory:function(r){return new(r||e)},imports:[[s.a,N]]}),e})()}}]);