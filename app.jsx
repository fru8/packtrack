const { useState } = window.React;
const { Table, PinModal, ThemeToggle } = window.Components;

function App() {
  const [pinVerified, setPinVerified] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const incrementPack = (index) => {
    if (!pinVerified) {
      setShowPinModal(true);
      return;
    }
    // Increment logic can be handled in the Index component now
  };

  return (
    <div className={`min-h-screen p-8 bg-gray-100 dark:bg-gray-900 transition-colors duration-200`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 dark:text-white">Pokemon Packs Ripped</h1>
        
        <Index />

        <PinModal 
          show={showPinModal}
          onClose={() => setShowPinModal(false)}
          onVerify={() => {
            setPinVerified(true);
            setShowPinModal(false);
          }}
        />

        <ThemeToggle 
          darkMode={darkMode}
          onToggle={() => {
            setDarkMode(!darkMode);
            localStorage.setItem('darkMode', JSON.stringify(!darkMode));
          }}
        />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);