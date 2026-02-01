import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 py-8 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-slate-500 text-sm">
            © 2026 Pong.1337. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link 
              to="/privacy-policy" 
              className="text-slate-400 hover:text-white text-sm transition-colors" >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-of-service" 
              className="text-slate-400 hover:text-white text-sm transition-colors" >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
