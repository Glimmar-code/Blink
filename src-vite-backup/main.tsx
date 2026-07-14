import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

// Force Dark Mode as the baseline default if no choice is stored yet
const savedTheme = localStorage.getItem("theme") || "dark";
const root = window.document.documentElement;

if (savedTheme === "dark") {
  root.classList.add("dark");
} else if (savedTheme === "system") {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  if (systemTheme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
} else {
  root.classList.remove("dark");
}

createRoot(document.getElementById("root")!).render(<App />);
