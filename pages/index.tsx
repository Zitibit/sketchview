import { Box, Edit, Globe, User, ChevronDown, ChevronRight, Heart } from "lucide-react";
import React from "react";

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <UseCases />
      <Features />
      <CallToAction />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="homeHeader">
      <nav className="nav">
        <a href="#" className="logo">
          SketchView
        </a>
        {/* <div className="nav-links">
          <a
            href="https://github.com/your-repo/sketchview"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="https://your-sponsor-link.com" target="_blank" rel="noopener noreferrer">
            Sponsor
          </a>
        </div> */}
        <a href="/sketchview/draw" className="cta-button">
          Start Drawing
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <h1>The Future of Collaborative Diagramming</h1>
      <p>
        Sketch, design, and collaborate in real-time. Perfect for system design,
        interviews, and technical discussions.
      </p>
      <a href="#learnmore" className="" style={{"display": "flex"}}>
        Learn More <ChevronDown size={32} strokeWidth="1" />
      </a>
      <div style={{display:"flex", width: "250px", margin: "-10px auto "}}>
      <svg
          className="absolute left-0 bottom-0 w-full h-4"
          viewBox="0 0 200 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 15 C50 25, 150 -5, 195 15"
            stroke="#fff"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg></div>
    </section>
  );
}

function UseCases() {
  const useCases = [
    {
      icon: <Edit />,
      title: "Sketching",
      description:
        "Effortless Sketching, Limitless Ideas. Quickly draft concepts with a hand-drawn, low-pressure interface—perfect for brainstorming and rapid ideation.",
    },
    {
      icon: <Globe />,
      title: "Collaboration",
      description: "Real-Time Collaboration, No Boundaries. Work seamlessly with remote team members, sketching and refining ideas together in real time.",
    },
    {
      icon: <User />,
      title: "System Design",
      description:
        "Design Complex Systems, Visually & Collaboratively. Create architecture diagrams with your team in real-time—making system design discussions more intuitive and productive.",
    },
    {
      icon: <Box />,
      title: "Interviews",
      description:
        "A Smarter Whiteboard for Technical Interviews. Conduct live coding and system design interviews with an intuitive, shared whiteboard that feels natural and efficient.",
    },
  ];

  return (
    <section className="use-cases" id="learnmore">
      <h2>Think it. See it.</h2>
      <div className="use-case-grid">
        {useCases.map((useCase, index) => (
          <div key={index} className="use-case-card">
            <div className="icon">{useCase.icon}</div>
            <div><h3>{useCase.title}</h3>
            <p>{useCase.description}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: "zap",
      title: "Lightning Fast Performance",
      description:
        "Handles complex diagrams with zero lag, even during collaboration.",
    },
    {
      icon: "lock",
      title: "Privacy-First",
      description: "All processing happens locally. Your data stays with you.",
    },
    {
      icon: "rotate-cw",
      title: "Version History",
      description: "Restore previous versions of your sketches easily.",
    },
    {
      icon: "upload",
      title: "Flexible Export Options",
      description: "Save as PNG, SVG, or JSON for sharing and editing.",
    },
    {
      icon: "puzzle",
      title: "Custom Components",
      description: "Save frequently used components for quick access.",
    },
  ];

  return (
    <section className="features" id="features">
      <h2>Highlights</h2>
      <div className="feature-list">
        {features.map((feature, index) => (
          <div key={index} className="feature-item">
            <div className="feature-icon">
              <i data-lucide={feature.icon}></i>
            </div>
            <div className="feature-text">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="cta-section" id="start">
      <h2>Ready to Collaborate?</h2>
      <p>Join thousands of people using SketchView daily.</p>
      <a href="/sketchview/draw" className="cta-button white">
        Start Drawing Now <ChevronRight />
      </a>
      <p className="cta-note">No signup required. Free forever.</p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a
          href="https://github.com/Zitibit/sketchview"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          href="https://your-sponsor-link.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sponsor
        </a>
        {/* <a href="#">Docs</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a> */}
      </div>
      <p className="copyright">
        © {new Date().getFullYear()} SketchView
      </p>
      <p>
      Made with <Heart size={16} color="#E91E63" fill="#E91E63" style={{ marginBottom: -2 }} /> in Bengaluru, India
      </p>
    </footer>
  );
}

export default App;
