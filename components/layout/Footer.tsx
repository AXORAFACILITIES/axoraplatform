export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-axora-slate bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-axora-navy/70 sm:flex-row">
        <p>&copy; {year} Axora Facilities LLC. All rights reserved.</p>
        <p>Metro Atlanta, Georgia</p>
      </div>
    </footer>
  );
}
