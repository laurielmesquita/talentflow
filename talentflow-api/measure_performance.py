import os
import time
import numpy as np
from typing import List, Dict, Any
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.orm import Session

# Import app and database engine
from app.main import app
from app.core.database import engine, SessionLocal
from app.models.domain import JobPosition

# Global counter for SQL queries
sql_query_count = 0

@event.listens_for(engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    global sql_query_count
    sql_query_count += 1

client = TestClient(app)

def run_benchmark(endpoint: str, method: str = "GET", runs: int = 10) -> Dict[str, Any]:
    global sql_query_count
    latencies: List[float] = []
    queries_per_run: List[int] = []

    # Warm-up run (discarded from metrics to avoid cold-start bias)
    sql_query_count = 0
    if method == "GET":
        client.get(endpoint)
    elif method == "POST":
        client.post(endpoint)
    
    for _ in range(runs):
        sql_query_count = 0
        start_time = time.perf_counter()
        
        if method == "GET":
            response = client.get(endpoint)
        
        end_time = time.perf_counter()
        
        # Calculate latency in milliseconds
        latency = (end_time - start_time) * 1000
        latencies.append(latency)
        queries_per_run.append(sql_query_count)
        
        if response.status_code >= 400:
            print(f"Warning: Request to {endpoint} returned status code {response.status_code}")

    # Compute percentiles
    p50 = np.percentile(latencies, 50)
    p95 = np.percentile(latencies, 95)
    p99 = np.percentile(latencies, 99)
    avg_queries = int(np.mean(queries_per_run))

    return {
        "endpoint": endpoint,
        "runs": runs,
        "min": min(latencies),
        "max": max(latencies),
        "p50": p50,
        "p95": p95,
        "p99": p99,
        "avg_queries": avg_queries,
        "queries_per_run": queries_per_run
    }

def print_report(results: List[Dict[str, Any]]):
    print("\n" + "="*80)
    print("                 TALENTFLOW PERFORMANCE BENCHMARK REPORT")
    print("="*80)
    print(f"| {'Endpoint':<35} | {'Runs':<4} | {'SQLs':<4} | {'Min (ms)':<8} | {'P50 (ms)':<8} | {'P95 (ms)':<8} | {'P99 (ms)':<8} |")
    print(f"|{'-'*37}|{'-'*6}|{'-'*6}|{'-'*10}|{'-'*10}|{'-'*10}|{'-'*10}|")
    for r in results:
        print(f"| {r['endpoint']:<35} | {r['runs']:<4} | {r['avg_queries']:<4} | {r['min']:>8.1f} | {r['p50']:>8.1f} | {r['p95']:>8.1f} | {r['p99']:>8.1f} |")
    print("="*80 + "\n")

def main():
    db: Session = SessionLocal()
    temp_job_id = None
    try:
        # Check if we have candidates to run benchmark on
        # Fetch a job or create one temporarily
        job = db.query(JobPosition).filter(JobPosition.is_active == True).first()
        if not job:
            print("No active jobs found in the database. Creating a temporary job position for matching performance...")
            temp_job = JobPosition(
                title="Técnico de Manutenção Temporário",
                description="Vaga temporária para teste de performance",
                required_skills="python, javascript, sql",
                is_active=True
            )
            db.add(temp_job)
            db.commit()
            db.refresh(temp_job)
            job = temp_job
            temp_job_id = temp_job.id
            print(f"Temporary job created with ID: {job.id}")
        
        job_id = job.id
        print(f"Using Job ID {job_id} ({job.title}) for matching benchmark.")

        print("Starting benchmark runs (10 runs per endpoint)...")
        
        # 1. Candidates List Endpoint
        candidates_result = run_benchmark("/api/candidates", runs=10)
        
        # 2. Smart Match Endpoint
        match_result = run_benchmark(f"/api/jobs/{job_id}/match", runs=10)
        
        print_report([candidates_result, match_result])

    finally:
        if temp_job_id:
            print(f"Cleaning up temporary job {temp_job_id}...")
            temp_job = db.query(JobPosition).filter(JobPosition.id == temp_job_id).first()
            if temp_job:
                db.delete(temp_job)
                db.commit()
            print("Cleanup complete.")
        db.close()

if __name__ == "__main__":
    main()
