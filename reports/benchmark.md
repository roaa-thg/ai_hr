# Infrastructure & Inference Benchmark Report

**Model Tested:** Qwen/Qwen2.5-14B-Instruct (`qwen2.5-14b`)  
**Serving Engine:** vLLM v0.6.3.post1 (Docker + Kubernetes / k3s)  
**Precision / Quantization:** bfloat16 (Unquantized)  
**Workload:** English Resume Information Extraction (Structured JSON)

---

## Benchmark Results

| Dimension | Example Metric | Value / Finding |
| :--- | :--- | :--- |
| **Model Size** | Parameters / model storage | **14.77B parameters** / **~29.5 GB** model storage on disk (bfloat16) |
| **GPU Requirement** | GPU type / VRAM | **1x NVIDIA RTX A6000** / **48 GB GDDR6** with ECC |
| **Memory Usage** | Peak GPU memory | **43,661 MB** (~42.6 GB, 91% of 48 GB; 98% GPU Compute Utilization) |
| **Time to First Token** | Milliseconds | **733.89 ms** (single stream baseline; scales to 5,346.11 ms under load) |
| **Generation Speed** | Tokens/second | **22.65 tokens/sec** per stream (remains stable: 20.08 t/s at concurrency 8) |
| **End-to-End Latency** | Seconds/request | **64.79 seconds** (single stream baseline; avg 54.96 s – 68.08 s under batching) |
| **Throughput** | Requests/second or tokens/second | **57.42 tokens/sec** (0.02 req/s) at c=1 $\to$ **367.44 tokens/sec** (0.10 req/s) at c=8 |
| **Concurrency** | Concurrent users/requests | **1, 2, 4, and 8 concurrent requests** evaluated under continuous batching |
| **Context Length** | Supported/effective context | **8,192 tokens** configured (`MAX_MODEL_LEN=8192` in container) |
| **Token Usage** | Input/output tokens | **~2,269 input tokens** / **~1,451 output tokens** per extraction request |
| **Cost** | Cost/request or cost/1M tokens | **Self-hosted / fixed hardware cost** (no per-token API fee; ~$0.08 / 1M tokens amortized) |
| **Scalability** | Performance under load | Throughput scales **6.40×** ($57.42 \to 367.44$ tokens/sec) from $c=1$ to $c=8$ with **0.0% error rate** |

---

## Concurrency Scaling Analysis

| Concurrency Level | Error Rate | Avg TTFT | Avg Latency | Per-Stream Speed | System Throughput | Peak VRAM |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1 user** | 0.0% | 733.89 ms | 64.79 s | 22.65 tok/s | **57.42 tok/s** (0.02 req/s) | 42,621 MB |
| **2 users** | 0.0% | 1,434.89 ms | 68.08 s | 22.14 tok/s | **116.56 tok/s** (0.03 req/s) | 43,127 MB |
| **4 users** | 0.0% | 3,659.58 ms | 54.96 s | 21.45 tok/s | **242.64 tok/s** (0.05 req/s) | 43,661 MB |
| **8 users** | 0.0% | 5,346.11 ms | 61.26 s | 20.08 tok/s | **367.44 tok/s** (0.10 req/s) | 43,661 MB |

---

# Infrastructure & Inference Benchmark Report (Arabic)

**Model Tested:** Qwen/Qwen2.5-14B-Instruct (`qwen2.5-14b`)  
**Serving Engine:** vLLM v0.6.3.post1 (Docker + Kubernetes / k3s)  
**Precision / Quantization:** bfloat16 (Unquantized)  
**Workload:** Arabic Resume Information Extraction (Structured JSON)

---

## Benchmark Results

| Dimension | Example Metric | Value / Finding |
| :--- | :--- | :--- |
| **Model Size** | Parameters / model storage | **14.77B parameters** / **~29.5 GB** model storage on disk (bfloat16) |
| **GPU Requirement** | GPU type / VRAM | **1x NVIDIA RTX A6000** / **48 GB GDDR6** with ECC |
| **Memory Usage** | Peak GPU memory | **44,057 MB** (~43.0 GB, 91.8% of 48 GB; 98% GPU Compute Utilization) |
| **Time to First Token** | Milliseconds | **441.51 ms** (single stream baseline; scales to 3,358.79 ms under load) |
| **Generation Speed** | Tokens/second | **23.33 tokens/sec** per stream (remains stable: 20.98 t/s at concurrency 8) |
| **End-to-End Latency** | Seconds/request | **21.92 seconds** (single stream baseline; avg 22.60 s – 48.15 s under batching) |
| **Throughput** | Requests/second or tokens/second | **74.37 tokens/sec** (0.05 req/s) at c=1 $\to$ **274.72 tokens/sec** (0.11 req/s) at c=8 |
| **Concurrency** | Concurrent users/requests | **1, 2, 4, and 8 concurrent requests** evaluated under continuous batching |
| **Context Length** | Supported/effective context | **8,192 tokens** configured (`MAX_MODEL_LEN=8192` in container) |
| **Token Usage** | Input/output tokens | **~1,129 input tokens** / **~501 output tokens** per extraction request |
| **Cost** | Cost/request or cost/1M tokens | **Self-hosted / fixed hardware cost** (no per-token API fee; ~$0.08 / 1M tokens amortized) |
| **Scalability** | Performance under load | Throughput scales **3.69×** ($74.37 \to 274.72$ tokens/sec) from $c=1$ to $c=8$ with **0.0% error rate** |

---

## Concurrency Scaling Analysis

| Concurrency Level | Error Rate | Avg TTFT | Avg Latency | Per-Stream Speed | System Throughput | Peak VRAM |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1 user** | 0.0% | 441.51 ms | 21.92 s | 23.33 tok/s | **74.37 tok/s** (0.05 req/s) | 43,661 MB |
| **2 users** | 0.0% | 725.52 ms | 22.60 s | 22.85 tok/s | **143.89 tok/s** (0.09 req/s) | 43,661 MB |
| **4 users** | 0.0% | 1,463.67 ms | 30.55 s | 22.35 tok/s | **179.42 tok/s** (0.09 req/s) | 43,661 MB |
| **8 users** | 0.0% | 3,358.79 ms | 48.15 s | 20.98 tok/s | **274.72 tok/s** (0.11 req/s) | 44,057 MB |
