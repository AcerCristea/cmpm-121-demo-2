import "./style.css";

const APP_NAME = "Draw with Me";
const app = document.querySelector<HTMLDivElement>("#app")!;

const title = document.createElement("h1");
title.innerHTML = APP_NAME;
app.append(title);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);
