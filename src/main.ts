interface Displayable {
  display(context: CanvasRenderingContext2D): void;
}

class MarkerLine implements Displayable {
  private points: { x: number; y: number }[] = [];
  private thickness: number;

  constructor(startX: number, startY: number, thickness: number) {
    this.points.push({ x: startX, y: startY });
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(context: CanvasRenderingContext2D) {
    if (this.points.length > 0) {
      context.lineWidth = this.thickness;
      context.beginPath();
      for (let i = 0; i < this.points.length; i++) {
        const point = this.points[i];
        if (i === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      }
      context.stroke();
    }
  }
}

class ToolPreview implements Displayable {
  private x: number;
  private y: number;
  private thickness: number;

  constructor(thickness: number) {
    this.x = 0;
    this.y = 0;
    this.thickness = thickness;
  }

  update(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(context: CanvasRenderingContext2D) {
    context.lineWidth = 1;
    context.strokeStyle = "gray";
    context.beginPath();
    context.arc(this.x, this.y, this.thickness / 2, 0, 2 * Math.PI);
    context.stroke();
  }
}

class StickerPreview implements Displayable {
  private x: number;
  private y: number;
  private sticker: string;

  constructor(sticker: string) {
    this.x = 0;
    this.y = 0;
    this.sticker = sticker;
  }

  update(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(context: CanvasRenderingContext2D) {
    context.font = "26px serif";
    const textMetrics = context.measureText(this.sticker);
    const textWidth = textMetrics.width;
    const textHeight = 26;
    const centeredX = this.x - textWidth / 2;
    const centeredY = this.y + textHeight / 2;
    context.fillText(this.sticker, centeredX, centeredY);
  }
}

class Sticker implements Displayable {
  private sticker: string;
  private x: number;
  private y: number;

  constructor(sticker: string, x: number, y: number) {
    this.sticker = sticker;
    this.x = x;
    this.y = y;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(context: CanvasRenderingContext2D) {
    context.font = "26x seriif";
    const textMetrics = context.measureText(this.sticker);
    const textWidth = textMetrics.width;
    const textHeight = 26;
    const centeredX = this.x - textWidth / 2;
    const centeredY = this.y + textHeight / 2;
    context.fillText(this.sticker, centeredX, centeredY);
  }
}

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

const context = canvas.getContext("2d")!;
context.strokeStyle = "white";

const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
app.append(clearButton);

const undoButton = document.createElement("button");
undoButton.innerText = "Undo";
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerText = "Redo";
app.append(redoButton);

const thinButton = document.createElement("button");
thinButton.innerText = "Thin Marker";
app.append(thinButton);

const defaultButton = document.createElement("button");
defaultButton.innerText = "Default Marker";
app.append(defaultButton);

const thickButton = document.createElement("button");
thickButton.innerText = "Thick Marker";
app.append(thickButton);

const stickerButtons = [
  { emoji: "🍭", label: "Lollipop" },
  { emoji: "⭐", label: "Star" },
  { emoji: "❤️", label: "Heart" },
];

stickerButtons.forEach(({ emoji, label }) => {
  const button = document.createElement("button");
  button.innerText = label;
  app.append(button);

  button.addEventListener("click", () => {
    currentSticker = new Sticker(emoji, 0, 0);
    stickerPreview = new StickerPreview(emoji);
    showPreview = true;
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
  });
});

let lines: Displayable[] = [];
let redoStack: Displayable[] = [];
let currentLine: MarkerLine | null = null;
let isDrawing = false;
let lineThickness = 4;
let toolPreview: ToolPreview = new ToolPreview(lineThickness);
let showPreview = true;
let stickerPreview: StickerPreview | null = null;
let currentSticker: Sticker | null = null;

toolPreview.update(canvas.width / 2, canvas.height / 2);
updateSelectedTool(defaultButton);

function updateSelectedTool(selectedButton: HTMLButtonElement) {
  defaultButton.classList.remove("selectedTool");
  thinButton.classList.remove("selectedTool");
  thickButton.classList.remove("selectedTool");
  selectedButton.classList.add("selectedTool");

  toolPreview = new ToolPreview(lineThickness);
  showPreview = true;

  stickerPreview = null;
  currentSticker = null;
}

thinButton.addEventListener("click", () => {
  lineThickness = 2;
  updateSelectedTool(thinButton);
});

defaultButton.addEventListener("click", () => {
  lineThickness = 4;
  updateSelectedTool(defaultButton);
});

thickButton.addEventListener("click", () => {
  lineThickness = 8;
  updateSelectedTool(thickButton);
});

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  if (currentSticker) {
    currentSticker.drag(e.offsetX, e.offsetY);
    lines.push(currentSticker);
    currentSticker = null;
    stickerPreview = null;
    showPreview = false;

    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  } else {
    currentLine = new MarkerLine(e.offsetX, e.offsetY, lineThickness);
    redoStack = [];
    showPreview = false;
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && currentLine) {
    currentLine.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
  if (toolPreview && showPreview) {
    toolPreview.update(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
  }
  if (stickerPreview && currentSticker) {
    stickerPreview.update(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
  }
});

canvas.addEventListener("mouseup", () => {
  if (isDrawing && currentLine) {
    isDrawing = false;
    lines.push(currentLine);
    currentLine = null;
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("mouseout", () => {
  if (isDrawing && currentLine) {
    isDrawing = false;
    lines.push(currentLine);
    currentLine = null;
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

clearButton.addEventListener("click", () => {
  lines = [];
  currentLine = null;
  redoStack = [];
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const lastLine = lines.pop();
    redoStack.push(lastLine!);
    currentLine = null;
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const redoLine = redoStack.pop();
    lines.push(redoLine!);
    currentLine = null;
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);

  lines.forEach((line) => {
    line.display(context);
  });

  if (currentLine) {
    currentLine.display(context);
  }

  if (toolPreview && showPreview && !isDrawing) {
    toolPreview.display(context);
  }

  if (stickerPreview && currentSticker) {
    stickerPreview.display(context);
  }
});

canvas.addEventListener("tool-moved", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach((line) => line.display(context));

  if (toolPreview && showPreview) {
    toolPreview.display(context);
  }

  if (stickerPreview && currentSticker) {
    stickerPreview.display(context);
  }
});
