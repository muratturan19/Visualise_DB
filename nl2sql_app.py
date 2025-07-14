import os
import sqlite3
import json
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import openai
from dotenv import load_dotenv
import re

def normalize_turkish_text(text: str) -> str:
    """Return a cleaned version of the user input for Turkish compatibility."""
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    # `casefold` is more robust than lower() for Turkish specific chars
    text = text.casefold()
    return text

# Path to the database
DB_PATH = os.path.join(os.path.dirname(__file__), 'Database', 'demo_sirket.db')

SCHEMA_CACHE = None

def get_schema(cursor):
    """Return a textual description of the SQLite schema."""
    global SCHEMA_CACHE
    if SCHEMA_CACHE is not None:
        return SCHEMA_CACHE
    tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    schema_lines = []
    for (tbl,) in tables:
        cols = cursor.execute(f'PRAGMA table_info({tbl});').fetchall()
        col_defs = ', '.join([f"{c[1]} ({c[2]})" for c in cols])
        schema_lines.append(f"{tbl}: {col_defs}")
    SCHEMA_CACHE = '\n'.join(schema_lines)
    return SCHEMA_CACHE

def ask_llm(question, schema, model):
    """Use OpenAI to translate a question into SQL and chart instructions."""
    system_prompt = (
        "You are a data analyst expert in SQL. "
        "Translate the user's question into an SQLite compatible SQL query. "
        "Use the provided database schema. "
        "If a chart would better represent the answer, set chart_type to one of bar, line, or scatter "
        "and specify which columns should be used for x and y. "
        "Otherwise set chart_type to table. "
        "Respond in JSON with keys: sql, chart_type, x, y. "
        "Türkçe dil ve yazım hatalarını dikkate al."
    )
    user_prompt = f"Schema:\n{schema}\n\nQuestion: {question}"
    response = openai.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": system_prompt},
                 {"role": "user", "content": user_prompt}],
        temperature=0
    )
    content = response.choices[0].message.content
    return json.loads(content)

def execute_sql(conn, sql):
    df = pd.read_sql_query(sql, conn)
    return df

def display_result(df, chart_type, x=None, y=None):
    if chart_type == 'table' or df.empty:
        print(df)
        return

    sns.set(style="whitegrid")
    plt.figure(figsize=(10, 6))

    if chart_type == 'bar':
        sns.barplot(data=df, x=x, y=y)
    elif chart_type == 'line':
        sns.lineplot(data=df, x=x, y=y, marker='o')
    elif chart_type == 'scatter':
        sns.scatterplot(data=df, x=x, y=y)
    else:
        print(df)
        return

    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.show()

def main():
    load_dotenv()
    api_key = os.getenv('OPENAI_API_KEY')
    model = os.getenv('OPENAI_MODEL', 'gpt-4-turbo')
    repo_url = os.getenv('REPO_URL')
    if not api_key:
        raise RuntimeError('Please set the OPENAI_API_KEY environment variable.')
    openai.api_key = api_key
    if repo_url:
        print(f'Using repository: {repo_url}')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    schema = get_schema(cursor)

    print("Ask me about the company database. Type 'exit' to quit.")
    while True:
        question_raw = input('> ')
        question_raw = question_raw.strip()
        if question_raw.casefold() in {'exit', 'quit'}:
            break
        # Normalize Turkish input to reduce user-side mistakes
        question = normalize_turkish_text(question_raw)
        try:
            instruction = ask_llm(question, schema, model)
            sql = instruction.get('sql')
            chart_type = instruction.get('chart_type', 'table')
            x = instruction.get('x')
            y = instruction.get('y')
            print("Executing SQL:\n", sql)
            df = execute_sql(conn, sql)
            display_result(df, chart_type, x, y)
        except Exception as e:
            print('Error:', e)

    conn.close()

if __name__ == '__main__':
    main()
