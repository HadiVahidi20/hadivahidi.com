export default function Footer() {
  return (
    <footer
      className="py-8 px-4 text-center text-sm"
      style={{
        borderTop: "1px solid var(--border-color)",
        color: "var(--muted)",
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} Hadi Vahidi. All rights reserved.</p>
        <div className="flex gap-4">
          <a
            href="https://github.com/HadiVahidi20"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--text)]"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--text)]"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
