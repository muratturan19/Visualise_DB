# Visualise_DB

This repository contains a demo SQLite database (`demo_sirket.db`) and a simple Python application for querying it with natural language.

## Setup
1. Install dependencies:
   ```bash
   pip install pandas matplotlib seaborn openai
   ```
2. Set your OpenAI API key in the environment:
   ```bash
   export OPENAI_API_KEY=your-key
   ```

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
  "y": "columnName",                  // optional, for charts
  "data": [ { "col": "value" }, ... ] // result rows
}
```
The frontend displays the SQL, renders the table or chart using the provided data, and keeps a history of recent queries.
