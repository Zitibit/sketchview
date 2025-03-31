import React from 'react';

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <UseCases />
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
          sketchview
        </a>
        <a href="#start" className="cta-button">Start Drawing</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <h1>The future of collaborative diagramming.</h1>
      <p>Sketch, design, and collaborate in real-time. Perfect for system design, interviews, and technical discussions.</p>
      <a href="#start" className="cta-button hero-cta">Get Started →</a>
      {/* <div className="hero-image">
        <img src="https://sketchview/og-image.png" alt="Technical diagram in sketchview" />
      </div> */}
    </section>
  );
}

function UseCases() {
  const useCases = [
    {
      icon: '👥',
      title: 'System Design',
      description: 'Collaborate on architecture diagrams with your team in real-time.'
    },
    {
      icon: '💼',
      title: 'Interviews',
      description: 'Conduct technical interviews with a shared, intuitive whiteboard.'
    },
    {
      icon: '✏️',
      title: 'Sketching',
      description: 'Quickly draft ideas with a hand-drawn, low-pressure interface.'
    },
    {
      icon: '🌐',
      title: 'Collaboration',
      description: 'Work simultaneously with remote team members.'
    }
  ];

  return (
    <section className="use-cases">
      <h2>Designed for Technical Work</h2>
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

function CallToAction() {
  return (
    <section className="cta-section" id="start">
      <h2>Ready to Collaborate?</h2>
      <p>Join thousands of engineers who use Excalidraw Portal daily.</p>
      <a href="#" className="cta-button white">Start Drawing Now →</a>
      <p className="cta-note">No signup required. Free forever.</p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="https://github.com/excalidraw/excalidraw" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="#">Docs</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </div>
      <p className="copyright">© 2023 Excalidraw Portal. Open-source and free forever.</p>
    </footer>
  );
}

export default App;