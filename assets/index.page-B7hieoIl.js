import{ɵ as l,a as c,h as s,o as a,k as r,p as u,l as _,q as m,R as d,r as g,m as f,s as C,t as i}from"./index-CqY9Doch.js";const b=(t,e)=>e.attributes.slug,v=t=>["/blog/",t];function B(t,e){if(t&1&&(s(0,"a",0)(1,"h2",1),a(2),r(),s(3,"p",2),a(4),r()()),t&2){const n=e.$implicit;f("routerLink",C(3,v,n.attributes.slug)),_(2),i(n.attributes.title),_(2),i(n.attributes.description)}}let y=(()=>{var t;class e{constructor(){this.posts=g()}}return t=e,t.ɵfac=function(o){return new(o||t)},t.ɵcmp=l({type:t,selectors:[["app-blog"]],standalone:!0,features:[c],decls:4,vars:0,consts:[[3,"routerLink"],[1,"post__title"],[1,"post__desc"]],template:function(o,p){o&1&&(s(0,"h1"),a(1,"Blog Archive"),r(),u(2,B,5,5,"a",0,b)),o&2&&(_(2),m(p.posts))},dependencies:[d],styles:[`a[_ngcontent-%COMP%] {
  text-align: left;
  display: block;
  margin-bottom: 2rem;
}

.post__title[_ngcontent-%COMP%], 
.post__desc[_ngcontent-%COMP%] {
  margin: 0;
}`]}),e})();export{y as default};
