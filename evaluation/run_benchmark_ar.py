import os
import time
import json
import asyncio
import subprocess
from typing import List, Dict, Any
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

def load_env(env_path=".env"):
    if not os.path.exists(env_path):
        env_path = os.path.join("..", env_path)
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip("'\""))

load_env()

BASE_URL = "http://localhost:30090/v1"
MODEL_NAME = "qwen2.5-14b"
DATASET_PATH = "eval_dataset_arabic.json"
CONCURRENCY_LEVELS = [1, 2, 4, 8]
MAX_MODEL_LEN = 8192

API_KEY = os.getenv("VLLM_API_KEY", "")

EXTRACTION_PROMPT_TEMPLATE = """أنت نظام متخصص في استخراج المعلومات من السير الذاتية.

مهمتك هي استخراج معلومات المرشح من السيرة الذاتية المقدمة أدناه وإرجاع كائن JSON واحد صالح فقط.

متطلبات الإخراج الصارمة:
1. أخرج كائن JSON فقط.
2. يجب أن يكون أول حرف في الاستجابة هو {{ وآخر حرف هو }}.
3. لا تستخدم كتل Markdown البرمجية مثل ```json.
4. لا تضف أي شروحات أو ملاحظات أو تعليقات أو عناوين أو نصوص قبل كائن JSON أو بعده.
5. استخدم المفاتيح والبنية المحددة في المخطط أدناه كما هي تمامًا.
6. لا تضف أو تعيد تسمية أو تحذف أي مفتاح.
7. يجب أن يكون الإخراج قابلاً للتحليل باستخدام محلل JSON قياسي.
8. استخدم علامات الاقتباس المزدوجة لجميع مفاتيح JSON والقيم النصية.
9. لا تستخدم فاصلة زائدة بعد آخر عنصر.
10. استخدم null للقيم المفردة غير الموجودة في السيرة الذاتية.
11. استخدم [] عندما لا توجد عناصر في حقل من نوع قائمة.

قواعد استخراج المعلومات:
* استخرج فقط المعلومات المذكورة بشكل صريح أو المدعومة بوضوح في السيرة الذاتية.
* لا تستنتج أو تخمن أو تختلق أو تكمل أي معلومات غير موجودة.
* حافظ على الصياغة الأصلية الواردة في السيرة الذاتية قدر الإمكان.
* أدرج جميع العناصر المدعومة إذا كانت السيرة الذاتية تحتوي على أكثر من مؤهل تعليمي أو خبرة عملية أو شهادة أو مهارة أو لغة.
* إذا لم يحتوِ قسم معين على أي عناصر مدعومة، فأرجع قائمة فارغة [].

قواعد المهارات:
* يجب أن يحتوي الحقل "skills" فقط على قائمة من أسماء المهارات كنصوص.
* لا تنشئ تصنيفات أو كائنات داخل الحقل "skills".
* يجب تمثيل لغات البرمجة، وأطر العمل، والمكتبات، والأدوات، والتقنيات، والمنهجيات، والكفاءات التقنية كمهارات منفصلة.
* الحقل "languages" مخصص للغات البشرية فقط، مثل العربية والإنجليزية والفرنسية وغيرها.

مخطط JSON المطلوب:

{{
  "candidate_profile": {{
    "personal_information": {{
      "name": null,
      "email": null,
      "phone": null,
      "location": null
    }},
    "professional_summary": null,
    "skills": [],
    "work_experience": [
      {{
        "job_title": null,
        "company": null,
        "location": null,
        "start_date": null,
        "end_date": null,
        "description": null
      }}
    ],
    "education": [
      {{
        "degree": null,
        "field_of_study": null,
        "institution": null,
        "location": null,
        "graduation_date": null
      }}
    ],
    "certifications": [
      {{
        "name": null,
        "issuer": null,
        "date": null
      }}
    ],
    "languages": [
      {{
        "language": null,
        "proficiency": null
      }}
    ]
  }}
}}

السيرة الذاتية:
<resume>
{resume_text}
</resume>

أرجع الآن كائن JSON فقط."""

def get_gpu_metrics() -> Dict[str, float]:
    try:
        cmd = "nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu --format=csv,nounits,noheader"
        out = subprocess.check_output(cmd, shell=True).decode("utf-8").strip()
        mem_used, mem_total, util = [float(x.strip()) for x in out.split(",")]
        return {"mem_used_mb": mem_used, "mem_total_mb": mem_total, "gpu_util_pct": util}
    except Exception:
        return {"mem_used_mb": 0.0, "mem_total_mb": 0.0, "gpu_util_pct": 0.0}

def load_resumes(file_path: str) -> List[str]:
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        return [item.get("input", "") for item in data if item.get("input")]
    elif isinstance(data, dict):
        return [data.get("input", "")]
    return []

def _sync_stream_request(resume_text: str, req_id: int) -> Dict[str, Any]:
    prompt = EXTRACTION_PROMPT_TEMPLATE.format(resume_text=resume_text)
    
    # Estimate prompt tokens (~2.0 chars per token for Arabic script)
    estimated_prompt_tokens = len(prompt) // 2.0
    # Clamp max output tokens to prevent exceeding MAX_MODEL_LEN (8192)
    safe_max_tokens = max(512, min(1500, int(MAX_MODEL_LEN - estimated_prompt_tokens - 100)))

    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,
        "max_tokens": safe_max_tokens,
        "stop": ["<|im_end|>", "<|endoftext|>"],
        "stream": True,
        "stream_options": {"include_usage": True}
    }
    
    url = f"{BASE_URL}/chat/completions"
    data_bytes = json.dumps(payload).encode("utf-8")
    
    headers = {
        "Content-Type": "application/json"
    }
    if API_KEY:
        headers["Authorization"] = f"Bearer {API_KEY}"

    req = Request(url, data=data_bytes, headers=headers)

    t0 = time.perf_counter()
    ttft = None
    generated_text = ""
    usage_info = {}

    try:
        with urlopen(req, timeout=300.0) as response:
            for raw_line in response:
                line = raw_line.decode("utf-8").strip()
                if not line.startswith("data: "):
                    continue
                data_str = line[6:].strip()
                if data_str == "[DONE]":
                    break
                
                try:
                    chunk = json.loads(data_str)
                    if "usage" in chunk and chunk["usage"]:
                        usage_info = chunk["usage"]

                    choices = chunk.get("choices", [])
                    if choices:
                        delta = choices[0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            if ttft is None:
                                ttft = (time.perf_counter() - t0) * 1000.0
                            generated_text += content
                except json.JSONDecodeError:
                    continue

        total_latency = time.perf_counter() - t0
        output_tokens = usage_info.get("completion_tokens", len(generated_text) // 2)
        input_tokens = usage_info.get("prompt_tokens", int(estimated_prompt_tokens))
        generation_time = total_latency - ((ttft or 0) / 1000.0)
        tok_sec = (output_tokens / generation_time) if generation_time > 0 else 0.0

        print(f"Request #{req_id} finished: Latency={total_latency:.2f}s | TTFT={ttft:.1f}ms | Speed={tok_sec:.1f} t/s | Output Toks={output_tokens}")
        return {
            "success": True,
            "ttft_ms": ttft or 0.0,
            "latency_sec": total_latency,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "tok_sec": tok_sec
        }
    except HTTPError as e:
        error_body = e.read().decode("utf-8", errors="ignore")
        print(f"Request #{req_id} FAILED: HTTP {e.code} - {error_body}")
        return {"success": False, "error": f"HTTP {e.code}: {error_body}"}
    except Exception as e:
        print(f"Request #{req_id} FAILED: {str(e)}")
        return {"success": False, "error": str(e)}

async def send_inference_request(resume_text: str, req_id: int) -> Dict[str, Any]:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _sync_stream_request, resume_text, req_id)

async def run_concurrency_test(resumes: List[str], concurrency: int):
    print(f"\n========================================================")
    print(f"Testing Concurrency Tier = {concurrency} ({concurrency} parallel requests)")
    print(f"========================================================")
    
    # This line creates a workload matching the concurrency level to isolate simultaneous performance
    workload = [resumes[i % len(resumes)] for i in range(concurrency)]
    
    start_time = time.perf_counter()
    tasks = [send_inference_request(text, idx + 1) for idx, text in enumerate(workload)]
    results = await asyncio.gather(*tasks)
    elapsed = time.perf_counter() - start_time

    gpu_metric = get_gpu_metrics()
    successful = [r for r in results if r.get("success")]
    error_count = len(results) - len(successful)
    error_rate = (error_count / len(results)) * 100

    if not successful:
        print(f"All requests failed at concurrency {concurrency}. Error Rate: {error_rate:.1f}%\n")
        return None

    avg_ttft = sum(r["ttft_ms"] for r in successful) / len(successful)
    avg_latency = sum(r["latency_sec"] for r in successful) / len(successful)
    avg_gen_speed = sum(r["tok_sec"] for r in successful) / len(successful)
    avg_input_tok = sum(r["input_tokens"] for r in successful) / len(successful)
    avg_output_tok = sum(r["output_tokens"] for r in successful) / len(successful)
    
    total_tokens = sum(r["input_tokens"] + r["output_tokens"] for r in successful)
    throughput_rps = len(successful) / elapsed
    throughput_tps = total_tokens / elapsed

    print(f"\n--- Tier Summary (Concurrency {concurrency}) ---")
    print(f"Concurrency:           {concurrency} concurrent requests")
    print(f"Error Rate:            {error_rate:.1f}%")
    print(f"Time to First Token:   {avg_ttft:.2f} ms")
    print(f"Generation Speed:      {avg_gen_speed:.2f} tokens/s")
    print(f"End-to-End Latency:    {avg_latency:.2f} s")
    print(f"Throughput:            {throughput_rps:.2f} req/s ({throughput_tps:.2f} tokens/s)")
    print(f"Token Usage:           Input: {avg_input_tok:.0f} tokens | Output: {avg_output_tok:.0f} tokens")
    print(f"Peak GPU Memory:       {gpu_metric['mem_used_mb']:.0f} MB (GPU Util: {gpu_metric['gpu_util_pct']}%)")

    return {
        "concurrency": concurrency,
        "error_rate": error_rate,
        "avg_ttft_ms": round(avg_ttft, 2),
        "avg_latency_s": round(avg_latency, 2),
        "avg_tok_s": round(avg_gen_speed, 2),
        "avg_input_tokens": round(avg_input_tok, 1),
        "avg_output_tokens": round(avg_output_tok, 1),
        "throughput_rps": round(throughput_rps, 2),
        "throughput_tps": round(throughput_tps, 2),
        "gpu_vram_mb": gpu_metric["mem_used_mb"],
        "gpu_util_pct": gpu_metric["gpu_util_pct"]
    }

async def main():
    resumes = load_resumes(DATASET_PATH)
    if not resumes:
        print(f"No resumes found in {DATASET_PATH}.")
        return

    summary = []
    for c in CONCURRENCY_LEVELS:
        res = await run_concurrency_test(resumes, c)
        if res:
            summary.append(res)

    with open("benchmark_results_ar_cv.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print("\nSUCCESS: Benchmark results saved to benchmark_results_ar_cv.json")

if __name__ == "__main__":
    asyncio.run(main())