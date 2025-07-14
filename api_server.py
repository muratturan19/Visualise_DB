import os
import sqlite3
import json
import openai
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import Any
from dotenv import load_dotenv
import nl2sql_app


def debug_check_fields(rows, x=None, y=None):
    """Print debug info about presence of expected fields in the first rows.

    ``x`` and ``y`` values coming from the LLM can sometimes be lists if the
    model suggests multiple columns for a single axis.  Older versions of this
    function assumed they were always strings which caused ``TypeError:
    unhashable type: 'list'`` when used in the ``in`` operator.  We now flatten
    any list/tuple values so that each name is checked individually and the
    server no longer crashes.
    """
    expected = []
    for f in (x, y):
        if isinstance(f, (list, tuple)):
            expected.extend(f)
        elif f:
            expected.append(f)
    if not expected:
        return
    for idx, row in enumerate(rows[:5]):
        for field in expected:
            field_name = str(field)
            if field_name not in row:
                match = next(
                    (k for k in row.keys() if k.lower() == field_name.lower()), None
                )
                if match:
                    print(
                        f"[DEBUG] Field name mismatch in row {idx}: expected '{field_name}', found '{match}'"
                    )
                else:
                    print(f"[DEBUG] Missing field '{field_name}' in row {idx}: {row}")


load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
model = os.getenv("OPENAI_MODEL", "gpt-4-turbo")
if not api_key:
    raise RuntimeError("Please set the OPENAI_API_KEY environment variable.")
openai.api_key = api_key

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the database schema once at startup and use a fresh
# SQLite connection for each request. Using a connection per
# request avoids cross-thread errors when the FastAPI server
# handles requests in different worker threads.
with sqlite3.connect(nl2sql_app.DB_PATH) as _conn:
    _cursor = _conn.cursor()
    schema = nl2sql_app.get_schema(_cursor)


class QueryRequest(BaseModel):
    question: str


@app.post("/api/query")
def query_database(req: Any = Body(...)):
    # Log raw payload for debugging purposes
    print("[API] Received payload:", req)
    # Reject array payloads early with a clear message
    if not isinstance(req, dict):
        raise HTTPException(
            status_code=400,
            detail=(
                "JSON body must be a single object like {'question': '...'},"
                " arrays are not accepted."
            ),
        )
    try:
        query = QueryRequest(**req)
    except ValidationError as ve:
        raise HTTPException(status_code=422, detail=str(ve))

    question = nl2sql_app.normalize_turkish_text(query.question)
    try:
        instruction = nl2sql_app.ask_llm(question, schema, model)
        sql = instruction.get("sql")
        chart_type = instruction.get("chart_type", "table")
        x = instruction.get("x")
        y = instruction.get("y")
        # LLM responses may occasionally provide a list of columns. Use only the
        # first item so the rest of the pipeline receives a single column name.
        if isinstance(x, (list, tuple)):
            print(f"[WARN] Received list for x axis: {x}. Using first value.")
            x = x[0] if x else None
        if isinstance(y, (list, tuple)):
            print(f"[WARN] Received list for y axis: {y}. Using first value.")
            y = y[0] if y else None
        # Open a new connection for this request so the connection
        # is created and used within the same thread.
        with sqlite3.connect(nl2sql_app.DB_PATH) as conn:
            df = nl2sql_app.execute_sql(conn, sql)
            data = df.to_dict(orient="records")
        debug_check_fields(data, x, y)
        response = {
            "sql": sql,
            "chart_type": chart_type,
            "x": x,
            "y": y,
            "data": data,
        }
        # Log the full API response for transparency
        print("[API RESPONSE]:", json.dumps(response, ensure_ascii=False))
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
