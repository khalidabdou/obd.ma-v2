import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted py-12">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="mb-4 font-bold text-brand-blue">OBD.ma</h4>
            <p className="text-sm text-muted-foreground">
              Diagnostic tools and auto parts in Morocco.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Catalog</li>
              <li>Brands</li>
              <li>Categories</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Contact</li>
              <li>Track Orders</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Login</li>
              <li>Register</li>
              <li>Orders</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} OBD.ma. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
