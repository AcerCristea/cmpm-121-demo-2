interface Displayable {
  display(context: CanvasRenderingContext2D): void;
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomRotation() {
  return Math.floor(Math.random() * 360);
}

class MarkerLine implements Displayable {
  private points: { x: number; y: number }[] = [];
  private thickness: number;
  private color: string;

  constructor(startX: number, startY: number, thickness: number, color: string) {
    this.points.push({ x: startX, y: startY });
    this.thickness = thickness;
    this.color = color;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(context: CanvasRenderingContext2D) {
    if (this.points.length > 0) {
      context.lineWidth = this.thickness;
      context.strokeStyle = this.color;
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
  private color: string;

  constructor(thickness: number, color: string) {
    this.x = 0;
    this.y = 0;
    this.thickness = thickness;
    this.color = color;
  }

  update(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(context: CanvasRenderingContext2D) {
    context.lineWidth = 1;
    context.strokeStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, this.thickness / 2, 0, 2 * Math.PI);
    context.stroke();
  }
  setColor(color: string) {
    this.color = color;
  }
}

class EmojiPreview implements Displayable {
  private x: number;
  private y: number;
  private emoji: string;
  private rotation: number;

  constructor(emoji: string, rotation: number) {
    this.x = 0;
    this.y = 0;
    this.emoji = emoji;
    this.rotation = rotation;

  }

  rotate(angle: number) {
    this.rotation = (this.rotation + angle) % 360;
  }

  update(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(context: CanvasRenderingContext2D) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate((this.rotation * Math.PI) / 180);
    context.font = "32px serif";
    context.fillText(this.emoji, -16, 16);
    context.restore();  }
}

class Emoji implements Displayable {
  private emoji: string;
  private x: number;
  private y: number;
  private rotation: number;

  constructor(emoji: string, x: number, y: number, rotation: number) {
    this.emoji = emoji;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
  }

  rotate(angle: number) {
    this.rotation = (this.rotation + angle) % 360;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(context: CanvasRenderingContext2D) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate((this.rotation * Math.PI) / 180);
    context.font = "32px serif";
    context.fillText(this.emoji, -16, 16);
    context.restore();  }
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

const boxContainer = document.createElement("div")
const upperBox = document.createElement("div");
const lowerBox = document.createElement("div");

app.append(boxContainer);
boxContainer.classList.add("boxContainer");

boxContainer.append(upperBox);
boxContainer.append(lowerBox);


const context = canvas.getContext("2d")!;
context.strokeStyle = "white";

const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
upperBox.append(clearButton);

const undoButton = document.createElement("button");
undoButton.innerText = "Undo";
upperBox.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerText = "Redo";
upperBox.append(redoButton);

const thinButton = document.createElement("button");
thinButton.innerText = "Thin Marker";
lowerBox.append(thinButton);

const defaultButton = document.createElement("button");
defaultButton.innerText = "Default Marker";
lowerBox.append(defaultButton);

const thickButton = document.createElement("button");
thickButton.innerText = "Thick Marker";
lowerBox.append(thickButton);

const emojiData = [
  { emoji: "🍧", label: "🍧" },
  { emoji: "⭐", label: "⭐" },
  { emoji: "❤️", label: "❤️" },
];

function createEmojiButton(emoji) {
  const button = document.createElement("button");
  button.innerText = emoji.label;
  app.append(button);

  button.addEventListener("click", () => {
    const randomRotation = getRandomRotation();
    currentEmoji = new Emoji(emoji.emoji, 0, 0, randomRotation);
    emojiPreview = new EmojiPreview(emoji.emoji, randomRotation);
    showPreview = true;
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
  });
}

emojiData.forEach(createEmojiButton);

const customEmojiButton = document.createElement("button");
customEmojiButton.innerText = "Add Custom Emoji";
app.append(customEmojiButton);

customEmojiButton.addEventListener("click", () => {
  const newEmojiEmoji = prompt("Enter a new emoji:", "🌟");
  if (newEmojiEmoji) {
    const newEmojiLabel = prompt("Enter a label for your emoji", "Custom Emoji");
    if (newEmojiLabel) {
      const customEmoji = { emoji: newEmojiEmoji, label: newEmojiLabel };
      emojiData.push(customEmoji);
      createEmojiButton(customEmoji);
    }
  }
});

const downloadButton = document.createElement("button");
downloadButton.innerText = "Export Sketch";
upperBox.append(downloadButton);

downloadButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportContext = exportCanvas.getContext("2d")!;

  exportContext.scale(1024 / canvas.width, 1024 / canvas.height);

  lines.forEach((line) => line.display(exportContext));

  if (currentLine) {
    currentLine.display(exportContext);
  }

  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});

document.addEventListener("keydown", (event) => {
  if (emojiPreview && currentEmoji) {
    if (event.key === "ArrowRight") {
      emojiPreview.rotate(15);
      currentEmoji.rotate(15);
      canvas.dispatchEvent(new CustomEvent("tool-moved"));
    } else if (event.key === "ArrowLeft") {
      emojiPreview.rotate(-15);
      currentEmoji.rotate(-15);
      canvas.dispatchEvent(new CustomEvent("tool-moved"));
    }
  }
});

let lines: Displayable[] = [];
let redoStack: Displayable[] = [];
let currentLine: MarkerLine | null = null;
let isDrawing = false;
let lineThickness = 4;
let currentColor: string = getRandomColor();
let toolPreview: ToolPreview = new ToolPreview(lineThickness, currentColor);
let showPreview = true;
let emojiPreview: EmojiPreview | null = null;
let currentEmoji: Emoji | null = null;

toolPreview.update(canvas.width / 2, canvas.height / 2);
updateSelectedTool(defaultButton);

function updateSelectedTool(selectedButton: HTMLButtonElement) {
  defaultButton.classList.remove("selectedTool");
  thinButton.classList.remove("selectedTool");
  thickButton.classList.remove("selectedTool");
  selectedButton.classList.add("selectedTool");

  toolPreview = new ToolPreview(lineThickness, currentColor);
  showPreview = true;

  emojiPreview = null;
  currentEmoji = null;
}

thinButton.addEventListener("click", () => {
  lineThickness = 2;
  currentColor = getRandomColor();
  toolPreview.setColor(currentColor);
  updateSelectedTool(thinButton);
});

defaultButton.addEventListener("click", () => {
  lineThickness = 4;
  currentColor = getRandomColor();
  toolPreview.setColor(currentColor);
  updateSelectedTool(defaultButton);
});

thickButton.addEventListener("click", () => {
  lineThickness = 10;
  currentColor = getRandomColor();
  toolPreview.setColor(currentColor);
  updateSelectedTool(thickButton);
});

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  if (currentEmoji) {
    currentEmoji.drag(e.offsetX, e.offsetY);
    lines.push(currentEmoji);
    currentEmoji = null;
    emojiPreview = null;
    showPreview = false;

    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  } else {
    currentLine = new MarkerLine(e.offsetX, e.offsetY, lineThickness, currentColor);
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
  if (emojiPreview && currentEmoji) {
    emojiPreview.update(e.offsetX, e.offsetY);
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

  if (emojiPreview && currentEmoji) {
    emojiPreview.display(context);
  }
});

canvas.addEventListener("tool-moved", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach((line) => line.display(context));

  if (toolPreview && showPreview) {
    toolPreview.display(context);
  }

  if (emojiPreview && currentEmoji) {
    emojiPreview.display(context);
  }
});
