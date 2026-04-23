export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="container py-6 text-center text-xs sm:text-sm text-muted-foreground">
        Powered by <span className="text-foreground font-medium">EdgeMindLab</span> |{" "}
        <a href="https://edgemindlab.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
          edgemindlab.com
        </a>{" "}
        — Generating leads for{" "}
        <a href="https://reloadium.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
          reloadium.com
        </a>
      </div>
    </footer>
  );
}
