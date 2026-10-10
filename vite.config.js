import { resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

const mobileCss = String.raw`
@media(max-width:560px){
  html,body{max-width:100%;overflow-x:hidden}.platform-layout,.platform-main{width:100%;max-width:100%;overflow-x:hidden}
  .platform-sidebar{display:flex!important;width:min(82vw,290px)!important;flex-basis:auto!important;transform:translateX(-105%);transition:transform .22s ease;z-index:140;box-shadow:20px 0 55px rgba(4,15,32,.28)}body.mobile-sidebar-open .platform-sidebar{transform:translateX(0)}
  .platform-brand-text,.nav-section-title,.menu-item span:not(.menu-icon),.gateway-title,.gateway-uptime{display:initial!important}.platform-menu{overflow-y:auto}.menu-item{width:calc(100% - 20px);justify-content:flex-start}
  body.mobile-sidebar-open::after{content:"";position:fixed;inset:0;background:rgba(4,12,25,.42);backdrop-filter:blur(2px);z-index:135}body.mobile-sidebar-open{overflow:hidden}
}`;
const mobileJs=String.raw`(()=>{const init=()=>{const t=document.querySelector('.sidebar-toggle-btn'),s=document.querySelector('.platform-sidebar');if(!t||!s)return;const set=o=>{document.body.classList.toggle('mobile-sidebar-open',o);t.setAttribute('aria-expanded',String(o));t.textContent=o?'×':'☰'};t.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();set(!document.body.classList.contains('mobile-sidebar-open'))});s.addEventListener('click',e=>{if(innerWidth<=560&&e.target.closest('.menu-item'))set(false)});document.addEventListener('click',e=>{if(innerWidth<=560&&document.body.classList.contains('mobile-sidebar-open')&&!s.contains(e.target)&&!t.contains(e.target))set(false)});addEventListener('resize',()=>{if(innerWidth>560)set(false)})};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init()})();`;

const dashboardTheme={name:"imessage-ios-dashboard-theme",transformIndexHtml:{order:"post",handler(html){
  const cinematicTags=[
    {tag:"link",attrs:{rel:"stylesheet",href:"/cinematic-polish.css"},injectTo:"head"},
    {tag:"script",attrs:{src:"/cinematic-polish.js",defer:true},injectTo:"body"}
  ];
  if(!html.includes('class="platform-layout"')||!html.includes('sidebar-toggle-btn'))return{html,tags:cinematicTags};
  const isAdmin=html.includes('iMessage Hub — Admin Console');
  if(isAdmin){
    return{html,tags:[...cinematicTags,
      {tag:"style",children:mobileCss,injectTo:"head"},
      {tag:"link",attrs:{rel:"stylesheet",href:"/admin-ios.css"},injectTo:"head"},
      {tag:"script",children:mobileJs,injectTo:"body"}
    ]};
  }
  return{html,tags:[...cinematicTags,
    {tag:"script",attrs:{src:"/demo-submit-mode.js"},injectTo:"head"},
    {tag:"style",children:mobileCss,injectTo:"head"},
    {tag:"link",attrs:{rel:"stylesheet",href:"/ios-theme.css"},injectTo:"head"},
    {tag:"link",attrs:{rel:"stylesheet",href:"/ios-polish.css"},injectTo:"head"},
    {tag:"link",attrs:{rel:"stylesheet",href:"/ios-payment.css"},injectTo:"head"},
    {tag:"script",children:mobileJs,injectTo:"body"},
    {tag:"script",attrs:{src:"/ios-theme.js",defer:true},injectTo:"body"},
    {tag:"script",attrs:{src:"/ios-polish.js",defer:true},injectTo:"body"},
    {tag:"script",attrs:{src:"/ios-payment.js",defer:true},injectTo:"body"},
    {tag:"script",attrs:{src:"/support-telegram.js",defer:true},injectTo:"body"},
    {tag:"script",attrs:{src:"/long-message-billing.js",defer:true},injectTo:"body"},
    {tag:"script",attrs:{src:"/route-warning-fix.js",defer:true},injectTo:"body"},
    {tag:"script",attrs:{src:"/portal-final.js",defer:true},injectTo:"body"},
    {tag:"script",attrs:{src:"/support-page-v2.js",defer:true},injectTo:"body"}
  ]};
}}};

export default defineConfig({plugins:[dashboardTheme],build:{rollupOptions:{input:{main:resolve(__dirname,"index.html"),dashboard:resolve(__dirname,"dashboard.html"),admin:resolve(__dirname,"admin.html")}}}});
