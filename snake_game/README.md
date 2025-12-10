# Snake Game (Electron + React + WebGL)

A classic Snake game implementation using Electron for the desktop environment, React for the UI and state management, and raw WebGL for rendering the game grid.

## Technologies Used

*   **Electron**: Used to wrap the web application into a desktop application. It creates the main browser window and handles the lifecycle of the app.
*   **React**: Used for the application structure and game state management (snake position, score, game over state). `useSnakeGame` hook manages the game loop.
*   **WebGL**: Used for high-performance rendering of the game board. Instead of using DOM elements or 2D Canvas API, this project demonstrates direct WebGL usage with vertex and fragment shaders to draw the snake and food as colored rectangles.
*   **Vite**: A fast build tool used to bundle the React application and serve it during development.

## Installation

1.  Navigate to the project directory:
    ```bash
    cd snake_game
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Running the App

### Development Mode
To run the app in development mode with hot reloading:

1.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
2.  In a separate terminal, start Electron:
    ```bash
    npm run start:dev
    ```

### Production Build
To build and run the production version:

1.  Build the React app:
    ```bash
    npm run build
    ```
2.  Run the Electron app pointing to the built files:
    ```bash
    npm start
    ```
    (Note: `npm start` is configured to run `electron .` and serves the built files by default.)

    Alternatively, use the convenience script:
    ```bash
    npm run dist
    ```
