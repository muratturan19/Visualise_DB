import os
import sqlite3
import json
import openai
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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
    schema_details = nl2sql_app.get_schema_details(_cursor)
    # Build a structured list for the /api/schema endpoint
    # Only table and column names/types are returned to keep the
    # payload small.  Foreign key information is available from the
    # more detailed /api/schema/details endpoint.
    schema_overview = {"tables": []}
    for table in schema_details["tables"]:
        schema_overview["tables"].append(
            {
                "name": table["name"],
                "columns": [
                    {"name": col["name"], "type": col["type"]}
                    for col in table["columns"]
                ],
            }
        )


class QueryRequest(BaseModel):
    question: str
    context: list[str] | None = None


@app.post("/api/query")
async def query_database(req: QueryRequest = Body(...)):
    """Run LLM-generated SQL and return rows for visualisation."""
    # Log the structured request for debugging
    print("[API] Received payload:", req.model_dump())

    question = nl2sql_app.normalize_turkish_text(req.question)
    context = req.context or []
    try:
        instruction = nl2sql_app.ask_llm(question, schema, model, context)
        if "error" in instruction:
            raise HTTPException(status_code=400, detail=instruction["error"])

        sql = instruction.get("sql")
        visuals = instruction.get("visuals", [])

        # Open a new connection for this request so the connection
        # is created and used within the same thread.
        with sqlite3.connect(nl2sql_app.DB_PATH) as conn:
            df = nl2sql_app.execute_sql(conn, sql)
            data = df.to_dict(orient="records")

        for vis in visuals:
            vtype = vis.get("type", "table")
            if vtype != "table":
                debug_check_fields(data, vis.get("x"), vis.get("y"))
            vis["data"] = data

        response = {"sql": sql, "visuals": visuals}
        # Log the full API response for transparency
        print("[API RESPONSE]:", json.dumps(response, ensure_ascii=False))
        return response
    except ValueError as e:
        print("[ERROR]", e)
        raise HTTPException(status_code=500, detail="LLM yanıtı geçersiz veya desteklenmeyen formatta")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/schema")
async def get_schema_endpoint():
    """Return tables and column names/types for the demo DB."""
    return schema_overview


@app.get("/api/schema/details")
async def get_schema_details_endpoint():
    """Return full schema details including foreign keys."""
    return schema_details


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
