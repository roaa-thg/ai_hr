import { useState } from "react";
import "./App.css";

import logo from "./assets/Logo_HR_AI.png";

const navGroups = [
  {
    title: "Workspace",
    items: [
      ["overview", "Overview"],
      ["parsing", "Resume Parsing"],
    ],
  },
  {
    title: "Analysis",
    items: [
      ["matching", "Job Matching"],
      ["gap", "Skill Gap Analysis"],
    ],
  },
  {
    title: "Evaluation",
    items: [
      ["evaluation", "Evaluation"],
      ["comparison", "Model Comparison"],
    ],
  },
  {
    title: "System",
    items: [
      ["infrastructure", "Infrastructure"],
      ["about", "About"],
    ],
  },
];

const pageTitles = {
  overview: {
    eyebrow: "HR AI Evaluation Lab",
    title: "Arabic & English Resume Intelligence",
    description:
      "A controlled environment for evaluating AI models on resume understanding and structured information extraction.",
  },
  parsing: {
    eyebrow: "Workspace",
    title: "Resume Parsing",
    description:
      "Extract structured candidate information from Arabic and English resumes.",
  },
  matching: {
    eyebrow: "Analysis",
    title: "Job Matching",
    description:
      "Compare a job description against a set of resumes to evaluate candidate-to-job alignment.",
  },
  gap: {
    eyebrow: "Analysis",
    title: "Skill Gap Analysis",
    description:
      "Identify the relationship between demonstrated candidate skills and the requirements of a target role.",
  },
  evaluation: {
    eyebrow: "Evaluation",
    title: "Evaluation",
    description:
      "Evaluate model behavior across quality, reliability, language performance, and deployment criteria.",
  },
  comparison: {
    eyebrow: "Evaluation",
    title: "Model Comparison",
    description:
      "Compare model categories using a consistent evaluation framework.",
  },
  infrastructure: {
    eyebrow: "System",
    title: "Infrastructure",
    description:
      "The deployment architecture supporting document processing, model serving, evaluation, and observability.",
  },
  about: {
    eyebrow: "Project",
    title: "About the Team",
    description:
      "Meet the team behind HR AI Evaluation Lab and learn about the project's focus.",
  },
};

function App() {
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src={logo} alt="HR AI" />
        </div>

        <nav>
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-label">{group.title}</div>

              {group.items.map(([id, label]) => (
                <button
                  key={id}
                  className={`nav-item ${activePage === id ? "active" : ""}`}
                  onClick={() => navigate(id)}
                >
                  <span className="nav-dot" />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>HR AI Evaluation Lab</span>
          <small>Model evaluation workspace</small>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              ☰
            </button>

            <img className="top-logo" src={logo} alt="HR AI" />
          </div>

          <div className="topbar-right">
            <span className="status-dot" />
            <span className="environment">Evaluation Lab</span>

            <button
              className="theme-button"
              onClick={() => setDarkMode((value) => !value)}
              aria-label="Toggle theme"
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? "☼" : "☾"}
            </button>
          </div>
        </header>

        <main className="content">
          {activePage === "overview" && <Overview navigate={navigate} />}
          {activePage === "parsing" && <ResumeParsing />}
          {activePage === "matching" && (<JobMatching
          selectedResumes={selectedResumes}
          setSelectedResumes={setSelectedResumes} />
)}
          {activePage === "gap" && <SkillGap />}
          {activePage === "evaluation" && <Evaluation />}
          {activePage === "comparison" && <ModelComparison />}
          {activePage === "infrastructure" && <Infrastructure />}
          {activePage === "about" && <About />}
        </main>
      </div>
    </div>
  );
}

function PageHeader({ page }) {
  const meta = pageTitles[page];

  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{meta.eyebrow}</div>
        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
      </div>
    </div>
  );
}

function Overview({ navigate }) {
  return (
    <>
      <PageHeader page="overview" />

      <section className="overview-hero">
        <div className="hero-copy">
          <span className="hero-kicker">CURRENT PROJECT FOCUS</span>
          <h2>Evaluate AI models for resume intelligence.</h2>
          <p>
            HR AI Evaluation Lab is designed to test how well different AI
            models understand Arabic and English resumes and transform them
            into reliable structured information.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={() => navigate("parsing")}
            >
              Open Resume Parsing
            </button>

            <button
              className="secondary-button"
              onClick={() => navigate("evaluation")}
            >
              View Evaluation
            </button>
          </div>
        </div>

        <div className="hero-side">
          <div className="phase-number">01</div>
          <span>Current phase</span>
          <strong>Resume Parsing</strong>
          <p>DOCX input · Arabic & English</p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">WORKFLOW</span>
            <h2>From document to evaluation</h2>
          </div>
        </div>

        <div className="workflow-grid">
          <Workflow
            number="01"
            title="Resume Parsing"
            text="Convert a resume into structured candidate information."
            active
          />
          <Workflow
            number="02"
            title="Job Matching"
            text="Compare a job description with multiple resumes."
          />
          <Workflow
            number="03"
            title="Skill Gap"
            text="Relate demonstrated skills to role requirements."
          />
          <Workflow
            number="04"
            title="Model Evaluation"
            text="Measure quality, reliability and deployment factors."
          />
        </div>
      </section>

      <section className="overview-grid">
        <InfoCard
          title="Current scope"
          text="The current implementation starts with DOCX resume parsing. OCR and image-based documents remain future scope."
          link="Resume Parsing"
          onClick={() => navigate("parsing")}
        />

        <InfoCard
          title="Evaluation framework"
          text="The project evaluates extraction quality, language performance, structured output reliability, latency, cost and deployment feasibility."
          link="Evaluation"
          onClick={() => navigate("evaluation")}
        />

        <InfoCard
          title="Next workflows"
          text="Job Matching and Skill Gap Analysis remain part of the product architecture and can be expanded after the parsing baseline."
          link="Explore analysis"
          onClick={() => navigate("matching")}
        />
      </section>
    </>
  );
}

function Workflow({ number, title, text, active }) {
  return (
    <div className={`workflow-card ${active ? "selected" : ""}`}>
      <span>{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function InfoCard({ title, text, link, onClick }) {
  return (
    <div className="info-card">
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      <button onClick={onClick}>{link} →</button>
    </div>
  );
}

function ResumeParsing() {
  const [fileName, setFileName] = useState("");

  return (
    <>
      <PageHeader page="parsing" />

      <div className="scope-banner">
        <div>
          <strong>Current input scope</strong>
          <span>DOCX resumes only</span>
        </div>
        <p>
          OCR and image-based resume processing are outside the current
          baseline.
        </p>
      </div>

      <section className="workspace-grid">
        <div className="panel upload-panel">
          <PanelTitle
            eyebrow="INPUT"
            title="Resume document"
            text="Upload a DOCX resume to prepare it for parsing."
          />

          <label className="upload-zone">
            <input
              type="file"
              accept=".docx"
              onChange={(event) =>
                setFileName(event.target.files?.[0]?.name || "")
              }
            />

            <div className="upload-symbol">+</div>

            <strong>
              {fileName || "Choose a DOCX resume"}
            </strong>

            <span>
              {fileName
                ? "Document selected"
                : "Only .docx files are supported in the current phase"}
            </span>
          </label>

          <div className="form-row">
            <label>
              <span>Language</span>
              <select defaultValue="auto">
                <option value="auto">Auto detect</option>
                <option value="ar">Arabic</option>
                <option value="en">English</option>
              </select>
            </label>

            <label>
  <span>Model</span>
  <select defaultValue="gpt">
    <option value="gpt">GPT-5.6 Sol</option>
    <option value="qwen30">Qwen3-30B-A3B</option>
    <option value="qwen7">Qwen2.5-7B-Instruct</option>
  </select>
</label>
          </div>

          <button className="primary-button full" disabled>
            Run parsing
          </button>

          <div className="connection-note">
            <span className="status-dot muted" />
            API not connected
          </div>
        </div>

        <div className="panel output-panel">
          <PanelTitle
            eyebrow="OUTPUT"
            title="Structured candidate profile"
            text="The parser will return a controlled JSON structure."
          />

          <div className="json-preview">
  <div className="json-empty">
    <strong>No parsing result yet</strong>
    <span>
      Upload a DOCX resume and run a model to generate the
      structured candidate profile.
    </span>
  </div>
</div>

          <div className="output-note">
            <strong>Designed for evaluation</strong>
            <p>
              The parsing output focuses on information extracted from the
              resume. Job matching and ranking are handled separately.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function JobMatching({ selectedResumes, setSelectedResumes }) {
  const handleResumeSelection = (event) => {
    const files = Array.from(event.target.files || []).filter(
      (file) =>
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.toLowerCase().endsWith(".docx")
    );

    setSelectedResumes(files);
  };

  return (
    <>
      <PageHeader page="matching" />

      <section className="matching-layout">
        <div className="panel job-input">
          <PanelTitle
            eyebrow="STEP 01"
            title="Job description"
            text="Write or paste the job description that will be used as the comparison target."
          />

          <textarea
            className="job-textarea"
            placeholder="Paste or write the job description here..."
          />

          <div className="input-hint">
            Include responsibilities, required skills, experience and
            qualifications when available.
          </div>
        </div>

        <div className="panel resume-selection">
          <PanelTitle
            eyebrow="STEP 02"
            title="Candidate resumes"
            text="Select the resumes you want to compare against the job description."
          />

          <input
            id="matching-resumes"
            type="file"
            accept=".docx"
            multiple
            onChange={handleResumeSelection}
            hidden
          />

          <div className="resume-list">
            {selectedResumes.length > 0 ? (
              selectedResumes.map((file, index) => (
                <ResumeRow
                  key={`${file.name}-${index}`}
                  number={String(index + 1).padStart(2, "0")}
                  name={file.name}
                />
              ))
            ) : (
              <EmptyState
                title="No resumes selected"
                text="Select one or more DOCX resumes to begin."
              />
            )}
          </div>

          <label
            htmlFor="matching-resumes"
            className="secondary-button full"
          >
            Select resumes
          </label>

          <button
            className="primary-button full"
            disabled={selectedResumes.length === 0}
          >
            Run matching
          </button>
        </div>
      </section>

      <section className="panel results-panel">
        <PanelTitle
          eyebrow="STEP 03"
          title="Matching results"
          text="Results will appear here once the matching service is connected."
        />

        <EmptyState
          title="No matching results yet"
          text="Connect the evaluation API to compare the selected resumes against the job description."
        />
      </section>
    </>
  );
}
function ResumeRow({ number, name }) {
  return (
    <div className="resume-row">
      <div className="resume-check">✓</div>

      <div>
        <strong>
          Resume {number} · {name}
        </strong>

        <span>DOCX candidate resume</span>
      </div>
    </div>
  );
}

function SkillGap() {
  return (
    <>
      <PageHeader page="gap" />

      <section className="two-column">
        <div className="panel">
          <PanelTitle
            eyebrow="CANDIDATE"
            title="Resume profile"
            text="Candidate information from the selected resume."
          />

          <EmptyState
            title="No candidate profile"
            text="Select a parsed resume to view the candidate's structured skills."
          />
        </div>

        <div className="panel">
          <PanelTitle
            eyebrow="TARGET ROLE"
            title="Job requirements"
            text="Requirements from the selected job description."
          />

          <EmptyState
            title="No job requirements"
            text="Add a job description to define the target role requirements."
          />
        </div>
      </section>

      <section className="panel skill-analysis-panel">
        <PanelTitle
          eyebrow="ANALYSIS"
          title="Skill analysis"
          text="Skills are organized according to their relationship to the target role."
        />

        <div className="gap-grid">
          <GapCard
            title="Required skills"
            text="Skills expected for the target role."
          />

          <GapCard
            title="Demonstrated skills"
            text="Skills identified in the candidate resume."
          />

          <GapCard
            title="Potential gaps"
            text="Required skills not demonstrated in the resume."
          />
        </div>
      </section>
    </>
  );
}

function GapCard({ title, text }) {
  return (
    <div className="gap-card">
      <span>{title}</span>
      <strong>Awaiting analysis</strong>
      <p>{text}</p>
    </div>
  );
}

function Evaluation() {
  const dimensions = [
    "Extraction accuracy",
    "JSON reliability",
    "Hallucination control",
    "Latency",
    "Deployment feasibility",
    "Cost",
  ];

  return (
    <>
      <PageHeader page="evaluation" />

      <section className="evaluation-intro">
        <div>
          <span className="eyebrow">EVALUATION</span>
          <h2>Run evaluation</h2>
        </div>

        <p>
          Evaluation results will appear here after a completed evaluation
          run.
        </p>
      </section>

      <section className="criteria-grid">
        {dimensions.map((item, index) => (
          <div className="criteria-card" key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
            <small>Not measured</small>
          </div>
        ))}
      </section>
    </>
  );
}

function ModelComparison() {
  const models = [
  "GPT-5.6 Sol",
  "Qwen3-30B-A3B",
  "Qwen2.5-7B-Instruct",
];

  const criteria = [
    "Extraction quality",
    "Arabic performance",
    "English performance",
    "JSON reliability",
    "Latency",
    "GPU memory",
    "Cost",
    "Deployment",
  ];

  return (
    <>
      <PageHeader page="comparison" />

      <section className="panel comparison-panel">
        <div className="comparison-scroll">
          <table>
            <thead>
              <tr>
                <th>Criterion</th>
                {models.map((model) => (
                  <th key={model}>{model}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {criteria.map((criterion) => (
                <tr key={criterion}>
                  <td>{criterion}</td>

                  {models.map((model) => (
                    <td key={`${model}-${criterion}`}>
                      <span className="awaiting">
                        Awaiting benchmark
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="note-box">
        <strong>Benchmark status</strong>
        <p>
          No model results are displayed until actual evaluation runs are
          connected. This prevents the interface from presenting invented
          performance data.
        </p>
      </div>
    </>
  );
}

function Infrastructure() {
  const architecture = [
    ["01", "Document input", "DOCX resume"],
    ["02", "Application layer", "Upload and workflow control"],
    ["03", "Model serving", "Model inference"],
    ["04", "Evaluation", "Quality and performance measurement"],
    ["05", "Observability", "Metrics and monitoring"],
  ];

  return (
    <>
      <PageHeader page="infrastructure" />

      <section className="panel architecture-panel">
        <PanelTitle
          eyebrow="SYSTEM ARCHITECTURE"
          title="Evaluation pipeline"
          text="The technical path from resume input to model evaluation and service monitoring."
        />

        <div className="architecture">
          {architecture.map(([number, title, text], index) => (
            <div className="architecture-stage" key={number}>
              <div className="stage-number">{number}</div>

              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>

              {index < architecture.length - 1 && (
                <div className="stage-arrow">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="infrastructure-grid">
        <div className="panel infrastructure-section">
          <span className="eyebrow">DEPLOYMENT</span>
          <h3>Model serving</h3>
          <p>
            This area represents how the selected models are exposed and
            deployed for evaluation.
          </p>

          <div className="infrastructure-status">
            <span>STATUS</span>
            <strong>Awaiting deployment</strong>
          </div>
        </div>

        <div className="panel infrastructure-section">
          <span className="eyebrow">OBSERVABILITY</span>
          <h3>Service monitoring</h3>
          <p>
            This area will surface service-level measurements such as latency,
            throughput and resource utilization.
          </p>

          <div className="infrastructure-status">
            <span>STATUS</span>
            <strong>Monitoring not connected</strong>
          </div>
        </div>

        <div className="panel infrastructure-section">
          <span className="eyebrow">INFRASTRUCTURE</span>
          <h3>Compute resources</h3>
          <p>
            This area will describe the compute environment used to run and
            evaluate the models.
          </p>

          <div className="infrastructure-status">
            <span>STATUS</span>
            <strong>Configuration pending</strong>
          </div>
        </div>
      </section>
    </>
  );
}
function About() {
  const teamMembers = [
    {
      name: "Munirah Alfarawi",
      role: "HR AI Team",
      github: "https://github.com/Munera11",
      linkedin: "#",
    },
    {
      name: "Roaa Altahagfi",
      role: "HR AI Team",
      github: "https://github.com/roaa-thg",
      linkedin: "#",
    },
    {
      name: "Balsam Alahmary",
      role: "HR AI Team",
      github: "https://github.com/BalsamAlahmari",
      linkedin: "#",
    },
    {
      name: "Rana Alshaikh",
      role: "HR AI Team",
      github: "https://github.com/RanaAlshaikh",
      linkedin: "#",
    },
  ];

  return (
    <>
      <PageHeader page="about" />

      <section className="about-hero panel">
        <div>
          <span className="eyebrow">THE PROJECT</span>
          <h2>HR AI Evaluation Lab</h2>
          <p>
            A focused AI evaluation project exploring how models understand
            Arabic and English resumes and transform them into useful,
            structured candidate information.
          </p>
        </div>
      </section>

      <section className="about-grid">
        <div className="panel">
          <PanelTitle
            eyebrow="PROJECT FOCUS"
            title="What we are building"
            text="The platform is structured around measurable AI workflows rather than a generic recruitment experience."
          />

          <div className="focus-list">
            <div>
              <span>01</span>
              <strong>Resume Parsing</strong>
              <p>Current implementation focus.</p>
            </div>

            <div>
              <span>02</span>
              <strong>Job Matching</strong>
              <p>Compare jobs against multiple resumes.</p>
            </div>

            <div>
              <span>03</span>
              <strong>Skill Gap Analysis</strong>
              <p>Relate candidate skills to role requirements.</p>
            </div>

            <div>
              <span>04</span>
              <strong>Model Evaluation</strong>
              <p>Measure quality and deployment factors.</p>
            </div>
          </div>
        </div>

        <div className="panel team-panel">
          <PanelTitle
            eyebrow="OUR TEAM"
            title="Team members"
            text="The team behind the HR AI Evaluation Lab."
          />

       <div className="team-list">
  {teamMembers.map((member) => (
    <div className="team-member" key={member.name}>
      <strong className="team-member-name">{member.name}</strong>

      <div className="team-links">
  <a
    href={member.github}
    target="_blank"
    rel="noreferrer"
    aria-label={`${member.name} GitHub`}
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18A10.9 10.9 0 0 1 12 5.03c.97 0 1.94.13 2.85.38 2.18-1.49 3.14-1.18 3.14-1.18.63 1.59.24 2.77.12 3.06.73.81 1.17 1.84 1.17 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.77 1.07.77 2.16v3.2c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
      />
    </svg>
  </a>

  <a
    href={member.linkedin}
    target="_blank"
    rel="noreferrer"
    aria-label={`${member.name} LinkedIn`}
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5.37 3.5a2.37 2.37 0 1 1-4.74 0 2.37 2.37 0 0 1 4.74 0ZM.94 8h4.52v14H.94V8Zm7.16 0h4.34v1.91h.06c.6-1.14 2.08-2.34 4.28-2.34 4.58 0 5.43 3.01 5.43 6.92V22h-4.52v-6.67c0-1.59-.03-3.63-2.21-3.63-2.21 0-2.55 1.73-2.55 3.51V22H8.1V8Z"
      />
    </svg>
  </a>
</div>
    </div>
  ))}
</div>
        </div>
      </section>
    </>
  );
}

function PanelTitle({ eyebrow, title, text }) {
  return (
    <div className="panel-title">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">—</div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

export default App;