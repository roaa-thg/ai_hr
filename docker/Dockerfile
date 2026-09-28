FROM vllm/vllm-openai:v0.6.3.post1

EXPOSE 8000

ENV MODEL_NAME="Qwen/Qwen2.5-14B-Instruct"
ENV SERVED_MODEL_NAME="qwen2.5-14b"
ENV MAX_MODEL_LEN=8192
ENV GPU_MEM_UTIL=0.90
ENV DTYPE="bfloat16"

ENTRYPOINT exec python3 -m vllm.entrypoints.openai.api_server \
    --host 0.0.0.0 \
    --port 8000 \
    --model ${MODEL_NAME} \
    --served-model-name ${SERVED_MODEL_NAME} \
    --max-model-len ${MAX_MODEL_LEN} \
    --gpu-memory-utilization ${GPU_MEM_UTIL} \
    --dtype ${DTYPE} \
    --trust-remote-code
