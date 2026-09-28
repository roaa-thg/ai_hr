# Qwen 14B Benchmark Report — Team 8 (HR AI / Beamdata)

### Table of Contents

1. [Project Overview and Business Problem](#1-project-overview-and-business-problem)
2. [Use Case and Scope](#2-use-case-and-scope)
3. [Models Tested](#3-models-tested)
4. [Deployment Architecture](#4-deployment-architecture)
5. [Evaluation Dataset and Annotation Process](#5-evaluation-dataset-and-annotation-process)
6. [Evaluation Methodology](#6-evaluation-methodology)
7. [Benchmark Results](#7-benchmark-results)
8. [Accuracy / Task Performance Analysis](#8-accuracy--task-performance-analysis)
9. [Latency and Token/Cost Analysis](#9-latency-and-tokencost-analysis)
10. [Deployment and Operational Trade-offs](#10-deployment-and-operational-trade-offs)
11. [Production Handoff / AI Hub Demonstration](#11-production-handoff--ai-hub-demonstration)
12. [Lessons Learned](#12-lessons-learned)
13. [Optional Stretch Work](#13-optional-stretch-work)

## 1. Project Overview and Business Problem

**Project:** HR resume-parsing evaluation for Beamdata 

**What problem are we solving?**
Beamdata's HR team manually reviews resumes to extract candidate information — slow and inconsistent, especially across Arabic and English submissions.

**Why isn't an off-the-shelf model enough?**
Most existing benchmarks and models are evaluated mainly on English resumes, with little evidence on Arabic performance.

**What does this project deliver?**
A bilingual (Arabic/English) evaluation dataset built from real resumes, used to benchmark Qwen2.5-14B on both extraction quality and infrastructure performance, alongside a working web application for resume upload, extraction, and job matching against a given job description.

## 2. Use Case and Scope

**What's in scope?**
- Comparing extraction quality across three candidate models (GPT, Qwen2.5-14B, Qwen2.5-7B)
- Selecting one model (Qwen2.5-14B) for deeper infrastructure and inference benchmarking
- Building a 72-resume bilingual evaluation dataset (36 Arabic, 36 English) with verified ground truth
- Measuring both extraction accuracy and serving performance (latency, throughput, GPU usage) for the selected model
- A working web app for live resume upload and extraction.
- Job matching: HR adds a job description and the system scores each uploaded resume against it

**What's out of scope?**
- Support for resume formats other than .docx
- Fine-tuning or retraining any model — evaluation only, using models as-is

## 3. Models Tested

Three models were evaluated for extraction quality on the full 72-resume bilingual dataset (36 Arabic, 36 English). The best-performing model was then selected for full deployment and infrastructure benchmarking.

| Model | Type | Tested For |
|---|---|---|
| GPT | API-based | Extraction quality (Arabic + English) |
| Qwen2.5-7B | Open-source, 7B | Extraction quality (Arabic + English) |
| Qwen2.5-14B | Open-source, 14B | Extraction quality (Arabic + English) |
## 4. Deployment Architecture

### Resume Extraction:
1. The user uploads a resume (.docx) through the Web Interface.
2. The file is sent to the FastAPI backend, which handles the request.
3. FastAPI sends the file to Doc Processing, which extracts the text using python-docx.
4. The extracted text goes to the Resume Extraction Pipeline, which builds a prompt from it.
5. The pipeline sends the prompt to the vLLM Server, which runs the deployed Qwen2.5-14B model.
6. The vLLM Server sends the model's response back to the pipeline.
7. The pipeline turns the response into a valid JSON candidate profile.
8. The Web Interface displays the profile to the user.

<p align="center">
  <img src="Resume_Extraction_architecture.png" alt="Deployment Architecture" width="10000">
</p>

### Job Matching:
1. The user adds a job description (text) and uploads one or more resumes through the Web Interface.
2. FastAPI receives the request and loops through the uploaded resumes one by one, sending each resume's extracted text together with the job description to the Job Matching Pipeline.
3. For each resume, the pipeline builds a prompt combining the resume text and the job description, and sends it to the vLLM Server running Qwen2.5-14B, which returns a match score, a score breakdown (skills, experience, education, languages, role alignment), matched skills, missing skills, and a summary.
4. The Web Interface displays the match results for each resume once all of them have been processed.

<p align="center">
  <img src="Job_Matching_architecture.png" alt="Deployment Architecture" width="10000">
</p>

## 5. Evaluation Dataset and Annotation Process

The evaluation dataset consists of 72 resumes: 36 in English and 36 in Arabic. Each resume is paired with a manually annotated ground truth in JSON format.

Each entry in the dataset contains:
- `resume_id` — a unique identifier (e.g., CV_001)
- `input` — the full resume text, extracted from the original .docx file
- `output` — the ground truth candidate profile, including personal information, professional summary, skills, work experience, education, certifications, and languages

**Annotation Process**

For each resume, a ground truth candidate profile was created manually in JSON format, following the schema described above.

After the dataset was assembled, each entry was programmatically verified against its original source resume (.docx) and ground truth (.json) file to confirm that the extracted `input` text and the `output` ground truth matched exactly, with no missing or extra entries.

## 6. Evaluation Methodology

The evaluation followed a two-stage process:

1. **Quality benchmarking** — Three candidate models (GPT, Qwen2.5-14B, Qwen2.5-7B) were run against the full 72-resume bilingual dataset (36 English, 36 Arabic), and each model's output was scored against the human-annotated ground truth using the metrics defined in Section 5 (Correctness, Completeness, Relevance, Hallucination, Instruction Following, Structured Output, Schema Compliance). Results were then compared across both languages to select the model with the most consistent and reliable performance, prioritizing low hallucination alongside extraction accuracy.

2. **Infrastructure benchmarking** — The selected model (Qwen2.5-14B) was deployed via vLLM and benchmarked for inference performance (latency, throughput, GPU usage) under the deployment architecture described in Section 4.

## 6.1. Quality benchmarking
This section describes how each quality dimension was measured for the 
resume extraction task, across three models (GPT, Qwen2.5-14B, Qwen2.5-7B) and
two languages (English, Arabic). All automated metrics were computed by
comparing each model's structured JSON output against a human-annotated
ground-truth JSON and, where relevant, against the original CV source text.


### 6.1.1. Correctness

**Question:** Is the answer/task result correct?

**Measurement.** Correctness is measured as **Extraction Precision**: of
all the values the model extracted, what fraction are actually correct?

For every leaf field in the schema (e.g. `personal_information.name`,
`work_experience[].start_date`), the predicted value is compared to the
ground-truth value using a normalization pipeline before any comparison is
made:

1. Unicode normalization (NFKC) and normalization of typographic
   characters (curly quotes, en/em dashes, etc.)
2. Lowercasing and whitespace/punctuation normalization
3. Date-aware normalization (`Feb 2025`, `2025-02`, `2025/02` are all
   canonicalized to `2025-02`)

A predicted value is then counted as **correct** if any of the following
hold, in order:

- Exact match after normalization
- Exact match after date normalization
- High lexical similarity (`SequenceMatcher` ratio ≥ 0.90) — tolerates
  minor spelling/formatting differences
- Token containment — the smaller token set is fully contained in the
  larger one (handles partial phrasing differences)

List-valued fields (`work_experience`, `education`, `certifications`,
`languages`) are first aligned between ground truth and prediction using
a similarity-based one-to-one matching step, so that item order does not
affect scoring; each matched pair is then compared field-by-field with
the same logic.

**Formula:**

```
Precision = correct_extractions / total_predicted_extractions
```

Reported both **micro-averaged** (pooled across all fields and all CVs) and **macro-averaged** (mean of each field's own precision).

**Output field(s):** `overall_metrics.precision`, `field_metrics.*.precision`



### 6.1.2. Completeness

**Question:** Did the model produce all required information?

**Measurement.** Completeness is measured as **Extraction Recall**: of
all values that exist in the ground truth, what fraction did the model
successfully extract? It uses the identical comparison logic as
Correctness (same normalization, same matching tiers) — the only
difference is the denominator.

**Formula:**

```
Recall = correct_extractions / total_ground_truth_extractions
```

A value counted as `missing_field` (present in ground truth, absent from
the prediction) reduces recall but does not affect precision, and vice
versa for extra/unmatched predictions — allowing precision and recall to
diagnose different failure modes (the model missing information vs. the
model inventing/duplicating information).

**Output field(s):** `overall_metrics.recall`, `field_metrics.*.recall`,
and the derived **Extraction F1** (harmonic mean of precision and recall)
reported as "Overall Extraction Quality".


### 6.1.3. Relevance

**Question:** Is the response relevant to the task?

**Measurement.** Because this is a closed extraction task rather than
open-ended generation, relevance is defined in measurable terms as *"did the model
stay on-task and produce content that genuinely describes this
candidate"*, via two components:

- **Schema relevance** — of all fields the model actually output (both
  expected and invented), what fraction belong to the schema it was
  given? This reuses the same schema-key comparison used for Structured
  Output to compute how many of the model's output fields are
  extraneous/invented rather than penalizing missing fields.
  ```
  schema_relevance = present_expected_fields / (present_expected_fields + extra_fields)
  ```
- **Content relevance** — for free-text fields (`professional_summary`),
  how well is the generated text grounded in *this specific candidate's*
  source CV, rather than generic or templated text? This reuses the
  identical tiered source-evidence check used for Hallucination
  detection : exact-phrase match → high token overlap → partial
  overlap → no overlap, producing a continuous grounding score.

**Formula:**

```
relevance_score = mean(schema_relevance, content_relevance)
```
(averaged only over the components that are applicable for a given CV)

**Output field(s):** `relevance.schema_relevance`,
`relevance.content_relevance`, `relevance.content_relevance_status`,
`relevance.relevance_score`

**Note:** unlike Correctness/Completeness, this is a
*proxy metric* , not a ground-truth-verified scor. 



### 6.1.4. Hallucination

**Question:** Does the output contain unsupported information?

**Measurement.** Any value the model produced that does **not** match a
ground-truth value (an "extra" prediction — either an unmatched scalar
field, an unmatched list item, or an unmatched dictionary key) is checked
against the **original CV source text** rather than the ground truth,
since a value can be extra relative to the ground-truth *annotation* while
still being genuinely present in the source document.

Each extra value is classified into one of four tiers based on token
overlap between the value and the source text:

| Status | Meaning |
|---|---|
| `extra_but_source_supported` | Exact phrase or ≥ 90% token overlap found in source CV — likely an annotator omission, not a hallucination |
| `source_ambiguous` | Partial (60–90%) token overlap — inconclusive |
| `hallucinated` | Little/no token overlap with the source CV — model invented information |
| `extra_unverified` | No source text was available for this CV, so support could not be checked |

Structured objects (e.g. an extra `work_experience` entry) are checked
field-by-field rather than as a whole, since a partially-correct invented
entry should be scored differently from a fully invented one.

**Formula:**

```
Hallucination Rate = hallucinated_extras / total_extra_predictions
```

**Output field(s):** `source_evidence_metrics.hallucination_rate`,
full per-instance detail in the hallucination report file.



### 6.1.5. Instruction Following

**Question:** Does the model follow the requested format and instructions?

**Measurement.** This is measured separately from *value* correctness —
it checks literal compliance with the formatting/process instructions
given to the model, via three components:

1. **Output-format cleanliness** — the raw model output (before any JSON
   parsing) is checked for markdown code fences (` ```json `) and any
   leading/trailing commentary outside the JSON object itself. A file
   only passes if it starts at `{` and ends at `}` with nothing else
   around it.
2. **Schema key discipline** — reuses the same schema-key comparison as
   Relevance/Structured Output: did the model avoid inventing
   extraneous top-level/nested keys beyond what the schema specifies?
   ```
   schema_key_discipline = 1 − (extra_fields / total_actual_fields)
   ```
3. **Strict date format compliance** — date fields (`start_date`,
   `end_date`, `graduation_date`, certification `date`) are checked
   against a **strict** `YYYY` / `YYYY-MM` regex, deliberately *without*
   the lenient month-name/locale parsing used elsewhere for Correctness
   scoring. This isolates whether the model followed the literal format
   instruction, independent of whether a human (or the lenient
   normalizer) could still figure out the intended date.

**Formula:**

```
instruction_following_score = mean(format_cleanliness, schema_key_discipline, date_format_compliance)
```
averaged only over the components applicable to a given CV, then averaged
across the dataset.

**Output field(s):** `instruction_following.format_compliance`,
`instruction_following.schema_key_discipline`,
`instruction_following.date_format_compliance`,
`instruction_following.instruction_following_score`


### 6.1.6. Arabic Quality

**Question:** How well does the model perform on Arabic tasks where relevant?

**Measurement.** Rather than a separate standalone metric, Arabic quality
is assessed by re-running the **identical** evaluation pipeline
(Correctness, Completeness, Hallucination, Structured Output, Relevance,
Instruction Following) on the Arabic dataset, using a normalization pipeline that mirrors the
English one but adds dedicated Arabic-specific handling:

- **Unicode NFKC normalization** applies uniformly to both scripts, as in
  English.
- **Arabic letter unification** — visually/phonetically equivalent letter
  forms are collapsed before comparison, so annotator and model spelling
  variants aren't penalized as mismatches:
  - `أ` / `إ` / `آ` → `ا`
  - `ى` → `ي`
  - `ؤ` → `و`, `ئ` → `ي`
- **Arabic punctuation normalization** — Arabic-specific punctuation is
  mapped to its Latin equivalent (`،` → `,`, `؛` → `;`, `؟` → `?`) so
  punctuation style doesn't affect matching.
- **Arabic "present" synonym normalization** — common Arabic phrasings
  for an ongoing role/date (`حالي`, `حاليًا`, `مستمر`, `حتى الآن`, etc.)
  are all canonicalized to a single value before date comparison, the
  Arabic equivalent of how `"Present"` / `"Current"` / `"Ongoing"` are
  unified in English.
- **Arabic-aware stopword filtering** — the token-overlap checks used for
  Hallucination and Content Relevance use an extended stopword list that
  includes common Arabic function words (`في`, `من`, `على`, `هذا`, `كان`,
  etc.) alongside the English ones, so overlap scores aren't inflated or
  deflated by particles that carry no real content.
- **Tokenization** (`\b[\w+#.-]+\b`) is Unicode-aware and matches Arabic
  word characters the same way it matches Latin ones.
- The same matching tiers (exact / fuzzy / token containment) and the
  same scoring thresholds are used for both languages — only the
  *normalization inputs* differ, not the *scoring logic*.

Arabic quality is therefore reported as a **direct comparison between the
English results (Table 1) and the Arabic results (Table 2)** across all
five automated dimensions above.


### 6.1.7. Structured Output

**Question:** Does the model reliably return the required JSON/structure?

**Measurement.** Two sub-metrics:

- **Valid JSON rate** — the fraction of model outputs that parse
  successfully as JSON at all (`json.load` succeeds and produces a
  dictionary). A file that fails to parse is excluded from all downstream
  field-level comparisons and is recorded as a `json_load_error`.
  ```
  Valid JSON rate = valid_json_count / total_files_attempted
  ```
- **Schema compliance** — of the fields the expected schema defines
  (flattened into dotted paths, e.g. `candidate_profile.work_experience[].job_title`),
  what fraction are actually present in the model's output, regardless of
  whether their *values* are correct? This isolates structural compliance
  from value correctness.
  ```
  Schema compliance = present_expected_fields / expected_fields
  ```

**Output field(s):** `json_validity.rate`, `schema.average_schema_compliance`

### 6.2 Infrastructure benchmarking

This section describes how each infrastructure/serving metric was measured
for the deployed model (Qwen2.5-14B on vLLM), across four concurrency
levels (1, 2, 4, and 8 simultaneous requests) and two languages (English,
Arabic). The benchmark was run as two independent scripts — one against
the English evaluation dataset and one against the Arabic evaluation
dataset — using the same measurement methodology and the same prompt
template used for extraction, so the benchmark reflects the actual
production request shape rather than a synthetic workload.

### 6.2.1. Concurrency Simulation

**Question:** How is a given concurrency level (e.g. "4 concurrent
requests") actually produced?

**Measurement.** For each concurrency level c in {1, 2, 4, 8}, c requests are built by cycling through the dataset and dispatched together via asyncio.gather. 

**Output field(s):** `concurrency`

### 6.2.2. Time to First Token (TTFT)

**Question:** How long does a user wait before the model starts
responding?

**Measurement.** Each request is sent with stream=True. TTFT is the wall-clock time from sending the request to the first SSE chunk with non-empty content (choices[0].delta.content) — capturing queueing plus prompt-processing time, not just network latency.

**Formula:**

```
 TTFT = time(first non-empty content chunk received) - time(request sent)
```

Reported as the mean TTFT across all successful requests in a
concurrency tier.

**Output field(s):** `avg_ttft_ms`

### 6.2.3. Generation Speed

**Question:** Once the model starts responding, how fast does it
generate tokens?

**Measurement.** Generation speed excludes TTFT: output_tokens / (total_latency − TTFT), isolating the decode-only rate from startup/queueing overhead.

**Formula:**

```
generation_time = total_latency − TTFT
tokens/sec = output_tokens / generation_time
```

Reported as the mean per-request generation speed across all successful
requests in a concurrency tier.

**Output field(s):** `avg_tok_s`

### 6.2.4. End-to-End Latency

**Question:** How long does a full request take, from the user's
perspective?

**Measurement.** Measured as the total wall-clock time from sending the
request to receiving the final SSE chunk (`[DONE]`) of the stream,
per request.

**Formula:** 

```
End-to-End Latency = time(stream complete) - time(request sent)
```

Reported as the mean end-to-end latency across all successful requests
in a concurrency tier.

**Output field(s):** `avg_latency_s`

### 6.2.5. Throughput

**Question:** How much useful work does the deployment sustain as a
system, under a given concurrency level?

**Measurement.** Unlike TTFT/generation speed/latency (which are
per-request averages), throughput is a **tier-level** metric: it divides
the *total* work completed by all concurrent requests in a tier by the
*total* wall-clock time the tier took to finish, capturing the benefit
of vLLM's continuous batching under concurrent load.

**Formula:** 

```
throughput_req/s = successful_requests_in_tier / tier_elapsed_time
throughput_tok/s = sum(input_tokens + output_tokens for all successful requests in tier) / tier_elapsed_time
```

**Output field(s):** `throughput_rps`, `throughput_tps`

### 6.2.6. Token Usage

**Question:** How many input/output tokens does a typical request
consume?

**Measurement.** Token counts are read from the `usage` field included
in the final SSE chunk (`stream_options.include_usage=True`), which
reports the vLLM server's own tokenizer counts (`prompt_tokens`,
`completion_tokens`). If a response completes without a `usage` block,
token counts fall back to a character-based estimate — roughly 3.5
characters per token for English and 2.0 characters per token for
Arabic, reflecting that Arabic script encodes more densely per
character under the model's tokenizer. This same estimate is also used
upfront to compute a safe `max_tokens` cap per request
(`max_tokens = clamp(MAX_MODEL_LEN − estimated_prompt_tokens − 100, 512, 1500)`),
so a long resume cannot push a request past the configured 8,192-token
context window.

**Output field(s):** `avg_input_tokens`, `avg_output_tokens`

### 6.2.7. GPU Memory and Utilization

**Question:** How much GPU capacity does serving this model actually
consume under load?

**Measurement.** Immediately after each concurrency tier finishes, GPU
memory usage and compute utilization are read via
`nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu`. This
is a point-in-time snapshot taken right after the tier's peak load
rather than a continuous trace over the tier's duration.

**Output field(s):** `gpu_vram_mb`, `gpu_util_pct`

### 6.2.8. Error Rate

**Question:** Does the deployment stay reliable as concurrency
increases?

**Measurement.** Within each concurrency tier, a request is counted as
failed if it raises an HTTP error or any other exception during the
streaming call (e.g. timeout, connection error, non-2xx response).

**Formula:** 

```
Error Rate = failed_requests_in_tier / total_requests_in_tier
```

**Output field(s):** `error_rate`

## 7. Benchmark Results

### Table 1: English Resume Extraction Results

| Quality Dimension | Metric | GPT | Qwen2.5 14B | Qwen2.5 7B |
|---|---|---|---|---|
| Correctness | Extraction Precision | 76.71% | 88.63% | 88.65% |
| Completeness | Extraction Recall | 95.23% | 92.49% | 88.90% |
| Overall Extraction Quality | Extraction F1 | 84.97% | 90.52% | 88.77% |
| Relevance | Relevance Score | 91.92% | 91.92% | 91.79% |
| Hallucination | Hallucination Rate ↓ | 2.50% | 0.89% | 1.63% |
| Instruction Following | Instruction-Following Score | 73.00% | 71.04% | 69.23% |
| Structured Output | Valid JSON | 100% | 100% | 97.22% |
| Schema Compliance | Schema Compliance | 88.35% | 88.35% | 89.12% |

---

### Table 2: Arabic Resume Extraction Results

| Quality Dimension | Metric | GPT | Qwen2.5 14B | Qwen2.5 7B |
|---|---|---|---|---|
| Correctness | Extraction Precision | 96.13% | 96.85% | 92.77% |
| Completeness | Extraction Recall | 97.98% | 96.90% | 93.83% |
| Overall Extraction Quality | Extraction F1 | 97.05% | 96.87% | 93.30% |
| Relevance | Relevance Score | 96.21% | 96.09% | 94.80% |
| Hallucination | Hallucination Rate ↓ | 6.00% | 0.00% | 48.84% |
| Instruction Following | Instruction-Following Score | 92.70% | 92.67% | 90.13% |
| Structured Output | Valid JSON | 100% | 100% | 100% |
| Schema Compliance | Schema Compliance | 94.23% | 93.91% | 96.79% |

### Table 3: English Infrastructure Benchmark Results

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

### Table 4: English Concurrency Scaling Results

| Concurrency Level | Error Rate | Avg TTFT | Avg Latency | Per-Stream Speed | System Throughput | Peak VRAM |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1 user** | 0.0% | 733.89 ms | 64.79 s | 22.65 tok/s | **57.42 tok/s** (0.02 req/s) | 42,621 MB |
| **2 users** | 0.0% | 1,434.89 ms | 68.08 s | 22.14 tok/s | **116.56 tok/s** (0.03 req/s) | 43,127 MB |
| **4 users** | 0.0% | 3,659.58 ms | 54.96 s | 21.45 tok/s | **242.64 tok/s** (0.05 req/s) | 43,661 MB |
| **8 users** | 0.0% | 5,346.11 ms | 61.26 s | 20.08 tok/s | **367.44 tok/s** (0.10 req/s) | 43,661 MB |


---

### Table 5: Arabic Infrastructure Benchmark Results

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

### Table 6: Arabic Concurrency Scaling Results

| Concurrency Level | Error Rate | Avg TTFT | Avg Latency | Per-Stream Speed | System Throughput | Peak VRAM |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1 user** | 0.0% | 441.51 ms | 21.92 s | 23.33 tok/s | **74.37 tok/s** (0.05 req/s) | 43,661 MB |
| **2 users** | 0.0% | 725.52 ms | 22.60 s | 22.85 tok/s | **143.89 tok/s** (0.09 req/s) | 43,661 MB |
| **4 users** | 0.0% | 1,463.67 ms | 30.55 s | 22.35 tok/s | **179.42 tok/s** (0.09 req/s) | 43,661 MB |
| **8 users** | 0.0% | 3,358.79 ms | 48.15 s | 20.98 tok/s | **274.72 tok/s** (0.11 req/s) | 44,057 MB |

## 8. Accuracy / Task Performance Analysis

Across both languages, Qwen2.5-14B was the most reliable model overall, even though it was not the top performer on every single metric.

On the Arabic subset, Qwen2.5-14B was the only model with zero hallucinations (0.00%), while Qwen2.5-7B hallucinated in nearly half of its extractions (48.84%) — a critical failure for an HR use case, where inventing a candidate's skills or certifications is unacceptable. GPT also showed a noticeable hallucination rate (6.00%) compared to Qwen2.5-14B.

On the English subset, GPT had the weakest Correctness score (76.71% Precision), meaning a large share of its extracted fields were inaccurate, despite scoring highest on Completeness (95.23% Recall). Qwen2.5-14B had the best overall balance, with the highest F1 score (90.52%) and the lowest hallucination rate (0.89%).

Qwen2.5-7B performed competitively on standard metrics in both languages, but its extreme hallucination rate on Arabic resumes made it unsuitable for production use, despite being the smallest and cheapest model to run.

**Conclusion:** Qwen2.5-14B was selected not because it led every metric, but because it was the most consistent and trustworthy model across both languages — combining strong extraction quality with the lowest hallucination rate, which is the most critical risk factor for an HR extraction system.

## 9. Latency and Token/Cost Analysis

The gap between English and Arabic latency (Tables 3 & 5) comes from token volume, not model speed: English uses ~2,269 input / ~1,451 output tokens per request vs. ~1,129 / ~501 for Arabic, and per-stream generation speed is almost identical for both (~21–23 tok/s across concurrency levels, Tables 4 & 6).

Both languages held a 0.0% error rate at all concurrency levels. English throughput scaled 6.4× (58.05 → 372.00 tok/s) vs. 3.72× for Arabic (74.30 → 276.24 tok/s) — Arabic's shorter outputs leave less room for batching gains before hitting the same GPU ceiling (44,655 MB peak VRAM for both).

Higher concurrency raises throughput but also TTFT (English: 721 ms → 5,382 ms; Arabic: 445 ms → 3,379 ms at c=8) — a responsiveness-vs-throughput trade-off to consider when picking a production concurrency limit.

Cost is the same self-hosted rate for both (~$0.08/1M tokens, Tables 3 & 5); the only cost difference between languages comes from token volume, not pricing.

## 10. Deployment and Operational Trade-offs

Choosing to self-host Qwen2.5-14B via vLLM instead of using a managed API (like GPT) involves several trade-offs:

**Cost model**
- GPT-5.6 Sol (API-based) — $4/M input, $20/M output. A typical 100K-in/20K-out request would cost roughly $0.80 ($0.40 for input + $0.40 for output) — more than double GPT-5.1's ~$0.33, and much pricier than GPT-4o. Note the pricing is currently promotional and could rise after Nov 21, 2026.
- Self-hosting Qwen2.5-14B on an NVIDIA RTX A6000 has a fixed infrastructure cost instead — cloud rental rates for an A6000 range from roughly $0.28/hr to $0.60/hr depending on provider. This is cost-effective at high, steady request volumes, but the GPU cost is paid whether or not it is actively processing requests.

**Data privacy and control**
- Self-hosting keeps candidate resume data (personal information, work history) within Beamdata's own infrastructure, rather than sending it to a third-party API — an important consideration for HR data.
- A managed API offers less control over where and how data is processed.

**Operational responsibility**
- Self-hosting requires the team to manage GPU provisioning, the vLLM server, and uptime — this benchmark's deployment already involves managing FastAPI, Doc Processing, and the vLLM server as separate components.
- A managed API removes this operational overhead but introduces dependency on a third-party provider's availability and pricing changes.

**Technical constraints**
- The deployed model has a maximum context length of 8,192 tokens, which limits how much resume text can be processed per request.
- Scaling to more concurrent users requires additional GPU capacity, whereas an API-based model scales automatically (at a higher cost).

**Summary:** Self-hosting Qwen2.5-14B trades a fixed infrastructure cost and operational responsibility for greater data control and predictable per-request cost at scale — a reasonable trade-off for an HR system handling sensitive candidate data.

## 11. Production Handoff / AI Hub Demonstration


## 12. Lessons Learned

**General-purpose benchmarks don't predict task-specific performance.** We learned that we should not rely solely on general model benchmarks when selecting a model. Instead, we needed to test and evaluate models on our own dataset and specific task to understand how well they actually perform in our use case. This was confirmed directly by our results: GPT-5.6 Sol had the highest general reputation, but Qwen2.5-14B outperformed it on our actual extraction task (higher F1 and near-zero hallucination on Arabic), which we would not have known without testing on our own data.

**Manual annotation is far more time-consuming than it looks.** The 72-resume dataset was synthetically generated, then each ground-truth JSON had to be manually written and checked field-by-field against its source resume. This manual verification step was tedious and eye-straining in practice, which highlighted why manual annotation doesn't scale well and why automated evaluation pipelines are valuable once a reliable ground truth exists.

## 13. Optional Stretch Work

Further development is planned for the resume-parsing and job-matching pipelines, including:

- Support for additional file formats beyond .docx, such as PDF and image-based resumes (e.g., scanned or photographed CVs)

- Matching a single resume against multiple job descriptions at once, instead of one at a time

- A dashboard to display job-matching results visually, instead of returning raw JSON