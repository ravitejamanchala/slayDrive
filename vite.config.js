import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        betweenLessons: resolve(import.meta.dirname, "practice-between-driving-lessons/index.html"),
        withoutCar: resolve(import.meta.dirname, "driving-practice-without-a-car/index.html"),
        mockTests: resolve(
          import.meta.dirname,
          "mock-driving-tests/index.html",
        ),
        highwayCode: resolve(import.meta.dirname, "highway-code/index.html"),
        simulator: resolve(import.meta.dirname, "driving-simulator/index.html"),
        puzzles: resolve(import.meta.dirname, "driving-puzzles/index.html"),
      },
    },
  },
});
