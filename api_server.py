import os
import sqlite3
import json
import openai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import nl2sql_app

load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')
model = os.getenv('OPENAI_MODEL', 'gpt-4-turbo')
if not api_key:
    raise RuntimeError('Please set the OPENAI_API_KEY environment variable.')
openai.api_key = api_key

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

conn = sqlite3.connect(nl2sql_app.DB_PATH)
cursor = conn.cursor()
schema = nl2sql_app.get_schema(cursor)

class QueryRequest(BaseModel):
    question: str

@app.post('/api/query')
def query_database(req: QueryRequest):
    question = nl2sql_app.normalize_turkish_text(req.question)
    try:
        instruction = nl2sql_app.ask_llm(question, schema, model)
        sql = instruction.get('sql')
        chart_type = instruction.get('chart_type', 'table')
        x = instruction.get('x')
        y = instruction.get('y')
        df = nl2sql_app.execute_sql(conn, sql)
        data = df.to_dict(orient='records')
        return {
            'sql': sql,
            'chart_type': chart_type,
            'x': x,
            'y': y,
            'data': data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
