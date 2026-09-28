import streamlit as st

st.set_page_config(
    page_title="HR AI Evaluation Lab",
    page_icon="🤖",
    layout="wide",
)

overview = st.Page(
    "pages/overview.py",
    title="Overview",
    icon="🏠",
    default=True,
)

evaluation = st.Page(
    "pages/evaluation.py",
    title="Evaluation",
    icon="🧪",
)

comparison = st.Page(
    "pages/comparison.py",
    title="Comparison",
    icon="⚖️",
)

job_matching = st.Page(
    "pages/job_matching.py",
    title="Job Matching",
    icon="🎯",
)

infrastructure = st.Page(
    "pages/infrastructure.py",
    title="Infrastructure",
    icon="🖥️",
)

about = st.Page(
    "pages/about.py",
    title="About",
    icon="ℹ️",
)

pg = st.navigation(
    [
        overview,
        evaluation,
        comparison,
        job_matching,
        infrastructure,
        about,
    ]
)

pg.run()