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
   You can also set `LLM_GUIDE_PATH` to override the location of `LLM_Guide.md`.

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
Start the FastAPI server which provides the `/api/query` endpoint used by the frontend and exposes `GET /api/schema` for schema information:
```bash
python api_server.py
```
The server listens on `http://localhost:8000`. Ensure that both `/api/query` and
`/api/schema` are reachable when running the React frontend.

`GET /api/schema` returns the list of tables and their columns:

```json
{
  "tables": [
    {
      "name": "Calisanlar",
      "columns": [
        {"name": "id", "type": "INTEGER"},
        {"name": "isim", "type": "TEXT"}
      ]
    },
    {
      "name": "Satislar",
      "columns": [
        {"name": "id", "type": "INTEGER"},
        {"name": "tarih", "type": "DATE"}
      ]
    }
  ]
}
```

For more detailed information including foreign keys you can call
`GET /api/schema/details`.

The Vite development server is configured to proxy `/api` requests to this backend, so the React app can communicate with it without additional configuration.

### API contract
The frontend expects a backend endpoint `POST /api/query` with the following JSON payload:
```json
{
  "question": "..."   // user question in Turkish or English
}
```
The backend responds with the executed SQL and one or more visualisation objects:
```json
{
  "sql": "SELECT ...",
  "visuals": [
    {
      "type": "table",
      "data": [ { "col": "value" }, ... ]
    },
    {
      "type": "bar",                // or line / scatter
      "x": "columnName",
      "y": ["col1", "col2"],       // single or multiple series
      "data": [ { "col1": 1 }, ... ]
    }
  ]
}
```
The frontend renders each visual in order, allowing any combination of tables and charts. When multiple series are returned, each numeric column appears as a separate series in the chart. While the query runs, the UI shows a short progress indicator below the form.

### Example prompts

#### Multi-series chart

Prompt:

```
Show production quantity, worker count, and stock amount per year on the same chart.
```

Possible JSON response:

```json
{
  "sql": "SELECT strftime('%Y', U.tarih) AS year, SUM(U.adet) AS production_qty, COUNT(DISTINCT C.id) AS worker_count, SUM(S.miktar) AS stock_amount FROM Uretim U JOIN Calisanlar C ON U.calisan_id = C.id LEFT JOIN Stoklar S ON U.urun_id = S.urun_id GROUP BY year ORDER BY year",
  "visuals": [
    {
      "type": "line",
      "x": "year",
      "y": ["production_qty", "worker_count", "stock_amount"],
      "data": [ { "year": "2022", "production_qty": 100, "worker_count": 50, "stock_amount": 30 } ]
    }
  ]
}
```

#### Chart and table together

Prompt:

```
For each customer, show orders as both a chart and a table.
```

Possible JSON response:

```json
{
  "sql": "SELECT M.isim AS customer, COUNT(S.id) AS orders FROM Musteriler M JOIN Satislar S ON M.id = S.musteri_id GROUP BY customer ORDER BY orders DESC",
  "visuals": [
    {
      "type": "table",
      "data": [ { "customer": "ACME", "orders": 42 } ]
    },
    {
      "type": "bar",
      "x": "customer",
      "y": ["orders"],
      "data": [ { "customer": "ACME", "orders": 42 } ]
    }
  ]
}
```

## License

This project is licensed under the [MIT License](LICENSE).
