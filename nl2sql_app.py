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
SCHEMA_DETAILS_CACHE = None


def parse_llm_response(content: str) -> dict:
    """Return JSON object extracted from raw LLM string.

    Logs the raw value for debugging and attempts to parse the first JSON
    object found. Raises ``ValueError`` if parsing fails.
    """
    print("[LLM RAW RESPONSE]", content)
    text = content.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.S)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
    raise ValueError("Invalid JSON from LLM")

def get_schema(cursor):
    """Return a textual description of the SQLite schema."""
    global SCHEMA_CACHE
    if SCHEMA_CACHE is not None:
        return SCHEMA_CACHE
    tables = cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    ).fetchall()
    schema_lines = []
    for (tbl,) in tables:
        cols = cursor.execute(f'PRAGMA table_info({tbl});').fetchall()
        col_defs = ', '.join([f"{c[1]} ({c[2]})" for c in cols])
        schema_lines.append(f"{tbl}: {col_defs}")
    SCHEMA_CACHE = '\n'.join(schema_lines)
    return SCHEMA_CACHE


def get_schema_details(cursor):
    """Return structured schema details including columns and foreign keys."""
    global SCHEMA_DETAILS_CACHE
    if SCHEMA_DETAILS_CACHE is not None:
        return SCHEMA_DETAILS_CACHE
    tables = cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    ).fetchall()
    result = {"tables": []}
    for (tbl,) in tables:
        cols = cursor.execute(f'PRAGMA table_info({tbl});').fetchall()
        fks = cursor.execute(f'PRAGMA foreign_key_list({tbl});').fetchall()
        fk_map = {fk[3]: {"table": fk[2], "column": fk[4]} for fk in fks}
        columns = []
        for c in cols:
            col = {"name": c[1], "type": c[2]}
            if c[1] in fk_map:
                col["fk"] = fk_map[c[1]]
            columns.append(col)
        result["tables"].append({"name": tbl, "columns": columns})
    SCHEMA_DETAILS_CACHE = result
    return result

def ask_llm(question, schema, model, context=None):
    """Use OpenAI to translate a question into SQL and chart instructions.

    ``context`` may contain a list of field names that the user selected in the
    UI. When provided this is added to the system prompt so the LLM can focus on
    those fields.
    """
    system_prompt = (
        "You are a data analyst expert in SQL. "
        "Translate the user's question into an SQLite compatible SQL query using the provided schema. "
        "Decide whether the user wants a chart, a table or both. "
        "For charts specify the type (bar, line or scatter) and which column is used for x and which column or columns are used for y. "
        "When multiple series are requested return all y columns as a JSON array. "
        "Return your answer strictly as JSON with the keys: sql and visuals. "
        "visuals must be an array of objects where each object has at minimum a 'type' field. "
        "For tables use {'type': 'table'}. For charts use {'type': 'bar', 'x': 'col', 'y': ['c1','c2']}. "
        "If both a chart and a table are needed include two objects in the visuals array. "
        "If a requested table does not exist respond with an 'error' key explaining the issue in one sentence. "
        "Türkçe dil ve yazım hatalarını dikkate al."
    )
    if context:
        if isinstance(context, (list, tuple)):
            ctx = ', '.join(context)
        else:
            ctx = str(context)
        system_prompt += f" Focus on the following fields if relevant: {ctx}."
    user_prompt = f"Schema:\n{schema}\n\nQuestion: {question}"
    response = openai.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": system_prompt},
                 {"role": "user", "content": user_prompt}],
        temperature=0
    )
    content = response.choices[0].message.content
    return parse_llm_response(content)

def execute_sql(conn, sql):
    """Run the SQL and print the query and first rows for debugging."""
    df = pd.read_sql_query(sql, conn)
    # Explicit logging so API callers can see exactly what was run
    print("[SQL]:", sql)
    # Convert first 5 rows to a list of dicts for readable output
    rows = df.head().to_dict(orient="records")
    print("[Rows]:", rows)
    # Example output:
    # [SQL]: SELECT * FROM Calisanlar LIMIT 2
    # [Rows]: [{"id": 1, "isim": "Ahmet"}, {"id": 2, "isim": "Mehmet"}]
    return df

def display_result(df, chart_type, x=None, y=None):
    if chart_type == 'table' or df.empty:
        print(df)
        return

    sns.set(style="whitegrid")
    plt.figure(figsize=(10, 6))

    if chart_type == 'bar':
        if isinstance(y, (list, tuple)):
            df_melt = df.melt(id_vars=[x], value_vars=list(y), var_name='series', value_name='value')
            sns.barplot(data=df_melt, x=x, y='value', hue='series')
        else:
            sns.barplot(data=df, x=x, y=y)
    elif chart_type == 'line':
        if isinstance(y, (list, tuple)):
            df_melt = df.melt(id_vars=[x], value_vars=list(y), var_name='series', value_name='value')
            sns.lineplot(data=df_melt, x=x, y='value', hue='series', marker='o')
        else:
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
            if 'error' in instruction:
                print('LLM error:', instruction['error'])
                continue
            sql = instruction.get('sql')
            visuals = instruction.get('visuals', [])
            print("Executing SQL:\n", sql)
            df = execute_sql(conn, sql)
            for vis in visuals:
                vtype = vis.get('type', 'table')
                x = vis.get('x')
                y = vis.get('y')
                display_result(df, vtype, x, y)
        except ValueError as e:
            print('LLM JSON error:', e)
        except Exception as e:
            print('Error:', e)

    conn.close()

if __name__ == '__main__':
    main()
