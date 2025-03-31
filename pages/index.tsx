import { Box, Edit, Globe, User } from "lucide-react";
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
    <header className="header">
      <nav className="nav">
        <a href="#" className="logo">
          SketchView
        </a>
        <div className="nav-links">
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
        </div>
        <a href="#start" className="cta-button">
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
      <a href="#start" className="cta-button hero-cta">
        Get Started →
      </a>
    </section>
  );
}

function UseCases() {
  const useCases = [
    { icon: <Edit />, title: "Sketching", description: "Quickly draft ideas with a hand-drawn, low-pressure interface." },
    { icon: <Globe />, title: "Collaboration", description: "Work simultaneously with remote team members." },
    { icon: <User />, title: "System Design", description: "Collaborate on architecture diagrams with your team in real-time." },
    { icon: <Box />, title: "Interviews", description: "Conduct technical interviews with a shared, intuitive whiteboard." },
  ];

  return (
    <section className="use-cases">
      <h2>Turn Thoughts into Visuals</h2>
      <div className="use-case-grid">
        {useCases.map((useCase, index) => (
          <div key={index} className="use-case-card">
            <div className="icon">{useCase.icon}</div>
            <h3>{useCase.title}</h3>
            <p>{useCase.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: "zap", title: "Lightning Fast Performance", description: "Handles complex diagrams with zero lag, even during collaboration." },
    { icon: "lock", title: "Privacy-First", description: "All processing happens locally. Your data stays with you." },
    { icon: "rotate-cw", title: "Version History", description: "Restore previous versions of your sketches easily." },
    { icon: "upload", title: "Flexible Export Options", description: "Save as PNG, SVG, or JSON for sharing and editing." },
    { icon: "puzzle", title: "Custom Components", description: "Save frequently used components for quick access." },
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
      <p>Join thousands of engineers using SketchView daily.</p>
      <a href="#" className="cta-button white">
        Start Drawing Now →
      </a>
      <p className="cta-note">No signup required. Free forever.</p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="https://github.com/your-repo/sketchview" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="https://your-sponsor-link.com" target="_blank" rel="noopener noreferrer">
          Sponsor
        </a>
        <a href="#">Docs</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </div>
      <p className="copyright">
        © {new Date().getFullYear()} SketchView. Open-source and free forever.
      </p>
    </footer>
  );
}

export default App;
