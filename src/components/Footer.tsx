
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col">
            <Logo className="mb-4" />
            <p className="text-muted-foreground mb-4">
              Engineering Intelligence, Shaping the Future
            </p>
            <div className="flex space-x-4 mt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-blue transition-colors"
                aria-label="Github"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-blue transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-blue transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:imshivanshutiwari@gmail.com"
                className="text-muted-foreground hover:text-brand-blue transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-muted-foreground hover:text-brand-blue transition-colors">Home</a></li>
              <li><a href="/about" className="text-muted-foreground hover:text-brand-blue transition-colors">About</a></li>
              <li><a href="/projects" className="text-muted-foreground hover:text-brand-blue transition-colors">Projects</a></li>
              <li><a href="/resume" className="text-muted-foreground hover:text-brand-blue transition-colors">Resume</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-brand-blue transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-muted-foreground mb-2">
              Defence Institute of Advanced Technology (DIAT), Pune
            </p>
            <p className="text-muted-foreground">
              <a href="mailto:imshivanshutiwari@gmail.com" className="hover:text-brand-blue transition-colors">
                imshivanshutiwari@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Shivanshu Tiwari. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
