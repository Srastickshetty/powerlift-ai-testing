import fitz  # PyMuPDF
import json
import os

def extract_knowledge(pdf_dir, output_file):
    knowledge_base = []
    
    for filename in os.listdir(pdf_dir):
        if filename.endswith(".pdf"):
            path = os.path.join(pdf_dir, filename)
            doc = fitz.open(path)
            
            content = ""
            for page in doc:
                content += page.get_text()
            
            knowledge_base.append({
                "source": filename,
                "text": content
            })
            print(f"✅ Processed: {filename}")

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(knowledge_base, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    # Ensure the directory exists
    PDF_DIR = "backend/data/knowledge_base"
    OUTPUT = "backend/data/processed_knowledge.json"
    
    if not os.path.exists(PDF_DIR):
        os.makedirs(PDF_DIR)
        
    extract_knowledge(PDF_DIR, OUTPUT)