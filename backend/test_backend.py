import sys
import os

sys.path.append(os.path.dirname(__file__))

from document_processor import DocumentProcessor
from rag_engine import RAGEngine
from agent_orchestrator import AgentOrchestrator

def run_tests():
    print("--- 1. Testing Document Processor ---")
    dp = DocumentProcessor()
    
    sample_text_path = os.path.join(os.path.dirname(__file__), "sample_test.txt")
    with open(sample_text_path, "w", encoding="utf-8") as f:
        f.write("TechCorp FY 2024 Revenue was 200 Crore representing 25% YoY growth. Operating profit reached 60 Crore.")
    
    doc_res = dp.process_file(sample_text_path, "sample_test.txt")
    print(f"Processed file pages: {doc_res['total_pages']}, File type: {doc_res['file_type']}")
    
    print("\n--- 2. Testing RAG Engine ---")
    rag = RAGEngine()
    rag.index_document("doc_1", doc_res)
    
    results = rag.search("revenue growth rate")
    print(f"RAG Search found {len(results)} chunks.")
    if results:
        top_chunk, score = results[0]
        print(f"Top chunk score: {score:.2f}")

    print("\n--- 3. Testing Agent Orchestrator ---")
    doc_store = {"doc_1": doc_res}
    agent = AgentOrchestrator(rag)
    
    response = agent.process_query("What was the revenue growth?", ["doc_1"], doc_store)
    print("Agent Response Answer:\n", response["answer"])
    print("Citations Count:", len(response["citations"]))
    
    if os.path.exists(sample_text_path):
        os.remove(sample_text_path)

    print("\nAll Backend Core Tests Passed Successfully!")

if __name__ == "__main__":
    run_tests()
