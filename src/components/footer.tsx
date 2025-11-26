export default function Footer() {
  return (
    <footer className="text-center pb-4 mt-auto text-sm text-foreground">
      <p>Created by <a href="https://github.com/Boatkungg" className="underline underline-offset-1" target="_blank">Boatkungg</a> • {new Date().getFullYear()}</p>
    </footer>
  );
}
