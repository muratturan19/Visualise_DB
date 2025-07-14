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
