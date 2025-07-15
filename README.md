# Visualise_DB

This repository contains a demo SQLite database (`demo_sirket.db`) and a simple Python application for querying it with natural language.

The interface fully supports Turkish input. Questions are normalised by trimming whitespace and applying Turkish-aware lowercase conversion to help with common typing mistakes.

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env
   # edit .env with your values
   ```
   The `.env` file should define `OPENAI_API_KEY`, `OPENAI_MODEL` and `REPO_URL`.

## Usage
Run the interactive application:
```bash
python nl2sql_app.py
```
Type a question about the database (for example, "Top 10 selling products by month") and the program will generate the SQL, execute it and show the result as a table or chart.

The database schema includes tables for employees, departments, production, sales and more. See `create_demo_db.py` for how it was generated.

## Web Application
A single-page React application is provided in the `frontend` directory for asking questions in natural language and visualising results.

### Running the frontend
```
cd frontend
npm install  # only needed the first time
npm run dev
```
This starts the development server on `http://localhost:5173`.

### Running the backend API
Start the FastAPI server which provides the `/api/query` endpoint used by the frontend:
```bash
python api_server.py
```
The server listens on `http://localhost:8000`.

The Vite development server is configured to proxy `/api` requests to this backend, so the React app can communicate with it without additional configuration.

### API contract
The frontend expects a backend endpoint `POST /api/query` with the following JSON payload:
```json
{
  "question": "..."   // user question in Turkish or English
}
```
The backend should respond with:
```json
{
  "sql": "SELECT ...",                 // SQL that was executed
  "chart_type": "table"|"bar"|"line"|"scatter",
  "x": "columnName",                  // optional, for charts
  "y": "columnName" | ["col1", "col2"], // single or multiple series
  "data": [ { "col": "value" }, ... ] // result rows
}
```
The frontend displays the SQL, renders the table or chart using the provided data, and keeps a history of recent queries. If the `y` field
contains multiple column names, each numeric column is shown as a separate series in the chart.
While the query runs, the UI shows a short progress indicator below the form.
