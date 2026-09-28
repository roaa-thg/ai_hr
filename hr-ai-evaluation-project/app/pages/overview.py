import streamlit as st


# =========================================================
# Page configuration
# =========================================================

st.set_page_config(
    page_title="HR AI Evaluation Lab",
    page_icon="🧪",
    layout="wide",
)


# =========================================================
# Global styling
# =========================================================

st.markdown(
    """
    <style>

    /* ---------- Global ---------- */

    .block-container {
        padding-top: 1.5rem;
        padding-bottom: 4rem;
        max-width: 1250px;
    }


    /* ---------- Hero ---------- */

    .hero {
        text-align: center;
        padding: 2rem 0 3rem 0;
    }

    .hero-logo {
        margin-bottom: 1.2rem;
    }

    .hero-title {
        font-size: 3rem;
        font-weight: 800;
        letter-spacing: -0.04em;
        line-height: 1.1;
        margin-bottom: 0.7rem;
    }

    .hero-subtitle {
        font-size: 1.15rem;
        opacity: 0.65;
        margin-bottom: 1.3rem;
    }

    .hero-description {
        max-width: 720px;
        margin: auto;
        font-size: 0.95rem;
        line-height: 1.7;
        opacity: 0.58;
    }


    /* ---------- Section ---------- */

    .section {
        margin-top: 2.5rem;
        margin-bottom: 1.2rem;
    }

    .section-title {
        font-size: 1.45rem;
        font-weight: 750;
        margin-bottom: 0.35rem;
    }

    .section-subtitle {
        font-size: 0.9rem;
        opacity: 0.58;
    }


    /* ---------- Feature Cards ---------- */

    .feature-card {
        border: 1px solid rgba(128, 128, 128, 0.18);
        border-radius: 16px;
        padding: 1.5rem;
        min-height: 185px;
        background: rgba(128, 128, 128, 0.025);
        transition: transform 0.2s ease,
                    border-color 0.2s ease;
    }

    .feature-card:hover {
        transform: translateY(-3px);
        border-color: rgba(128, 128, 128, 0.35);
    }

    .feature-icon {
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }

    .feature-title {
        font-size: 1.05rem;
        font-weight: 700;
        margin-bottom: 0.55rem;
    }

    .feature-text {
        font-size: 0.88rem;
        line-height: 1.6;
        opacity: 0.62;
    }


    /* ---------- Workflow ---------- */

    .workflow {
        border: 1px solid rgba(128, 128, 128, 0.18);
        border-radius: 18px;
        padding: 1.7rem;
        background: rgba(128, 128, 128, 0.025);
    }

    .workflow-step {
        text-align: center;
        padding: 0.8rem;
    }

    .step-number {
        font-size: 0.75rem;
        opacity: 0.5;
        margin-bottom: 0.4rem;
    }

    .step-title {
        font-weight: 700;
        font-size: 0.92rem;
    }

    .step-text {
        font-size: 0.76rem;
        opacity: 0.55;
        margin-top: 0.3rem;
    }


    /* ---------- Lab Panel ---------- */

    .lab-panel {
        border: 1px solid rgba(128, 128, 128, 0.2);
        border-radius: 18px;
        padding: 1.8rem;
        background: rgba(128, 128, 128, 0.035);
    }

    .lab-title {
        font-size: 1.25rem;
        font-weight: 750;
        margin-bottom: 0.5rem;
    }

    .lab-text {
        font-size: 0.9rem;
        line-height: 1.6;
        opacity: 0.62;
        margin-bottom: 1.3rem;
    }

    .tag {
        display: inline-block;
        border: 1px solid rgba(128, 128, 128, 0.2);
        border-radius: 999px;
        padding: 0.35rem 0.75rem;
        margin-right: 0.35rem;
        margin-bottom: 0.35rem;
        font-size: 0.75rem;
        opacity: 0.72;
    }

    </style>
    """,
    unsafe_allow_html=True,
)


# =========================================================
# Hero
# =========================================================

st.markdown('<div class="hero">', unsafe_allow_html=True)

st.image(
    "app/assets/Logo_HR_AI.png",
    width=170,
)

st.markdown(
    """
    <div class="hero-title">
        HR AI Evaluation Lab
    </div>

    <div class="hero-subtitle">
        Arabic & English Resume Intelligence
    </div>

    <div class="hero-description">
        A controlled evaluation workspace for assessing AI models
        on resume understanding, structured information extraction,
        skill analysis, and HR-focused matching tasks.
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown("</div>", unsafe_allow_html=True)


# =========================================================
# Evaluation Areas
# =========================================================

st.markdown(
    """
    <div class="section">
        <div class="section-title">
            Evaluation Areas
        </div>
        <div class="section-subtitle">
            Core capabilities evaluated across Arabic and English HR scenarios.
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown(
        """
        <div class="feature-card">
            <div class="feature-icon">📄</div>
            <div class="feature-title">
                Resume Understanding
            </div>
            <div class="feature-text">
                Assess how accurately a model interprets resume
                content, structure, experience, education, and
                candidate information.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col2:
    st.markdown(
        """
        <div class="feature-card">
            <div class="feature-icon">🧩</div>
            <div class="feature-title">
                Skill Extraction
            </div>
            <div class="feature-text">
                Evaluate structured extraction of technical skills,
                soft skills, qualifications, and professional
                experience.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col3:
    st.markdown(
        """
        <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <div class="feature-title">
                Job Matching
            </div>
            <div class="feature-text">
                Analyze how candidate profiles align with
                defined job requirements using consistent
                evaluation criteria.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# =========================================================
# Workflow
# =========================================================

st.markdown(
    """
    <div class="section">
        <div class="section-title">
            Evaluation Workflow
        </div>
        <div class="section-subtitle">
            From input data to measurable model evaluation.
        </div>
    </div>

    <div class="workflow">
    """,
    unsafe_allow_html=True,
)

steps = [
    ("01", "Input", "Resume or job data"),
    ("02", "Model", "Selected AI model"),
    ("03", "Extract", "Structured output"),
    ("04", "Evaluate", "Quality metrics"),
    ("05", "Compare", "Model results"),
]

cols = st.columns(5)

for col, (number, title, text) in zip(cols, steps):
    with col:
        st.markdown(
            f"""
            <div class="workflow-step">
                <div class="step-number">{number}</div>
                <div class="step-title">{title}</div>
                <div class="step-text">{text}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

st.markdown("</div>", unsafe_allow_html=True)


# =========================================================
# Lab Overview
# =========================================================

st.markdown(
    """
    <div class="section">
        <div class="section-title">
            Evaluation Lab
        </div>
        <div class="section-subtitle">
            Designed for reproducible and transparent model assessment.
        </div>
    </div>

    <div class="lab-panel">

        <div class="lab-title">
            Arabic & English HR AI Evaluation
        </div>

        <div class="lab-text">
            The lab provides a consistent environment for testing
            candidate understanding and structured HR tasks across
            different AI models. Results can later be connected
            to the evaluation dataset, ground truth, and model APIs.
        </div>

        <span class="tag">Arabic</span>
        <span class="tag">English</span>
        <span class="tag">Structured Output</span>
        <span class="tag">Resume Analysis</span>
        <span class="tag">Skill Extraction</span>
        <span class="tag">Model Comparison</span>

    </div>
    """,
    unsafe_allow_html=True,
)