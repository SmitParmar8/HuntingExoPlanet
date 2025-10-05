import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Dashboard' },
  { path: '/specifications', label: 'Model Specifications' },
  { path: '/history', label: 'Prediction History' },
  { path: '/explorer', label: 'Data Explorer' },
  { path: '/learning', label: 'Learning Center' }
];

export function Footer() {
  return (
    <footer className="mt-20 py-10 border-t border-gray-800 bg-gray-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <h4 className="text-white font-semibold text-lg mb-3">Exoscope</h4>
            <p className="text-gray-400 text-sm">
              Explore, analyze, and learn from exoplanet data powered by NASA archives.
            </p>
          </div>

          <div>
            <h5 className="text-gray-300 font-medium mb-3">Navigation</h5>
            <div className="flex flex-wrap gap-3">
              {navLinks.map((l) => (
                <Link key={l.path} to={l.path} className="text-gray-400 hover:text-cyan-400 text-sm">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-gray-300 font-medium mb-3">Connect</h5>
            <div className="flex space-x-4">
              <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyan-400">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyan-400">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyan-400">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:hello@example.com" className="text-gray-400 hover:text-cyan-400">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Exoscope. Built with love and stardust.
        </div>
      </div>
    </footer>
  );
}


