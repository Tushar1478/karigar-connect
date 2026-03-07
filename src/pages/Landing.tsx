import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Wrench } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg">
              <img src="/icon.png" alt="KarigarHub Logo" />
            </div>
            <span className="text-xl font-bold text-foreground">
              KarigarHub
            </span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center px-4 py-28 overflow-hidden">

        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source src="/karigar-video.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>

        {/* Hero Content */}
        <div className="relative mx-auto max-w-3xl text-center animate-fade-in">

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Find Trusted <span className="text-primary">Karigars</span> Near You
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            KarigarHub connects households with skilled electricians,
            plumbers, carpenters and home repair experts nearby.
            Reliable services at your doorstep within minutes.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">

            <Button
              size="lg"
              className="w-full gap-2 text-base sm:w-auto"
              onClick={() => navigate("/login/customer")}
            >
              <Users className="h-5 w-5" />
              Login as Customer
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2 text-base sm:w-auto"
              onClick={() => navigate("/login/karigar")}
            >
              <Wrench className="h-5 w-5" />
              Login as Karigar
            </Button>

          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup/customer")}
              className="font-semibold text-primary hover:underline"
            >
              Sign up as Customer
            </button>
            {" · "}
            <button
              onClick={() => navigate("/signup/karigar")}
              className="font-semibold text-primary hover:underline"
            >
              Sign up as Karigar
            </button>
          </p>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">

          <h2 className="text-3xl font-bold text-foreground mb-12">
            How KarigarHub Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                1. Post Your Job
              </h3>
              <p className="text-muted-foreground">
                Tell us what you need — electrical work, plumbing,
                carpentry, installation or repair.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                2. Karigars Accept
              </h3>
              <p className="text-muted-foreground">
                Nearby skilled workers receive your request
                and accept the job quickly.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                3. Work Gets Done
              </h3>
              <p className="text-muted-foreground">
                The karigar arrives and completes your work
                professionally and efficiently.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl text-center">

          <h2 className="text-3xl font-bold text-foreground mb-12">
            Services Available
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">

            {[
              "Electricians",
              "Plumbers",
              "Carpenters",
              "Home Repairs",
            ].map((service) => (
              <div
                key={service}
                className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1 hover:shadow-lg transition"
              >
                <p className="text-lg font-semibold text-foreground">
                  {service}
                </p>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">

          <h2 className="text-3xl font-bold text-foreground mb-10">
            Why Choose KarigarHub?
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div>
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-muted-foreground">
                Verified Karigars
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-muted-foreground">
                Jobs Completed
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold text-primary">4.8★</p>
              <p className="text-muted-foreground">
                Customer Rating
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} KarigarHub. Connecting skilled hands with homes.
      </footer>

    </div>
  );
};

export default Landing;