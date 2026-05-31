import { FormEvent, useState } from "react";
import { Check, Mail, Sparkles } from "lucide-react";
import { NEWSLETTER_ENDPOINT } from "@/config";
import { Button } from "@/components/ui/button";

const wallpapers = [
  {
    src: "/mondial-2026/mondial-2026-wallpaper-01.png",
    label: "iPhone 17",
    badge: "iPhone 17",
    group: "official",
    subtitle: "Standard device crop",
    size: "1206 x 2622",
  },
  {
    src: "/mondial-2026/mondial-2026-wallpaper-02.png",
    label: "iPhone 17 Pro",
    badge: "iPhone 17 Pro",
    group: "official",
    subtitle: "Pro device crop",
    size: "1206 x 2622",
  },
  {
    src: "/mondial-2026/mondial-2026-wallpaper-03.png",
    label: "iPhone 17 Pro Max",
    badge: "iPhone 17 Pro Max",
    group: "official",
    subtitle: "Large device crop",
    size: "1320 x 2868",
  },
  {
    src: "/mondial-2026/mondial-2026-wallpaper-04.png",
    label: "Alt Design 1",
    badge: "Alternate I",
    group: "alternate",
    subtitle: "Alternate cinematic crop",
    size: "863 x 1822",
  },
  {
    src: "/mondial-2026/mondial-2026-wallpaper-05.png",
    label: "Alt Design 2",
    badge: "Alternate II",
    group: "alternate",
    subtitle: "Dark trophy variation",
    size: "863 x 1822",
  },
  {
    src: "/mondial-2026/mondial-2026-wallpaper-06.png",
    label: "Alt Design 3",
    badge: "Alternate III",
    group: "alternate",
    subtitle: "Blue/red energy variation",
    size: "863 x 1822",
  },
];

const officialWallpapers = wallpapers.filter((wallpaper) => wallpaper.group === "official");
const alternateWallpapers = wallpapers.filter((wallpaper) => wallpaper.group === "alternate");

const blockedEmailAddresses = new Set([
  "a@a.com",
  "test@test.com",
  "fake@fake.com",
  "example@example.com",
  "email@email.com",
  "name@example.com",
]);

const blockedEmailDomains = new Set([
  "example.com",
  "test.com",
  "fake.com",
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
]);

function validateEmail(value: string) {
  const normalized = value.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailPattern.test(normalized)) {
    return "Enter a valid email address so we can send your wallpaper pack.";
  }

  const [localPart, domain] = normalized.split("@");

  if (
    localPart.length < 2 ||
    blockedEmailAddresses.has(normalized) ||
    blockedEmailDomains.has(domain)
  ) {
    return "Use a real email address so your download email can reach you.";
  }

  return "";
}

export default function Mondial2026() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationError = validateEmail(email);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsSubmitting(true);

    const data = new FormData();
    data.append("email", email);
    data.append("tag", "mondial-2026");
    data.append("embed", "1");

    if (name) {
      data.append("metadata[name]", name);
    }

    try {
      await fetch(NEWSLETTER_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: data,
      });
    } catch {
      // Keep the unlock path available even if the email provider blocks the client response.
    } finally {
      setSubmitted(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-16 text-[#1d1d1f]">
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src={wallpapers[2].src}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-40 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0b4b8f55,transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.38),#000_88%)]" />
        </div>

        <div className="container relative z-10 grid min-h-[calc(100svh-4rem)] grid-cols-1 items-center gap-10 py-12 md:grid-cols-[1fr_0.85fr] md:py-16">
          <div className="mx-auto max-w-2xl text-center md:mx-0 md:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#FECFA5]" />
              1804 – 2026
            </div>

            <h1
              className="text-4xl font-bold leading-tight tracking-normal sm:text-5xl md:text-6xl"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              ISTWA AP REPETE ANKÒ!
            </h1>

            <p
              className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/72 md:mx-0"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Free Haiti World Cup 2026 Wallpaper Pack, designed for a clean
              lock-screen look with bold pride and liquid-glass depth.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
              <a href="#unlock" className="w-full sm:w-auto">
                <Button className="h-12 w-full rounded-full bg-white px-7 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto">
                  Unlock Free Pack
                </Button>
              </a>
              <a
                href="#previews"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/18 px-7 text-sm font-semibold text-white/88 backdrop-blur-md transition-colors hover:bg-white/10 sm:w-auto"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                View Previews
              </a>
            </div>
          </div>

          <div className="relative mx-auto h-[520px] w-full max-w-[360px] md:h-[610px]">
            <div className="absolute left-0 top-12 w-[58%] rotate-[-9deg] overflow-hidden rounded-[2rem] border border-white/12 bg-white/8 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
              <img
                src={wallpapers[4].src}
                alt="Mondial 2026 wallpaper preview"
                className="aspect-[9/19] w-full rounded-[1.5rem] object-cover"
              />
            </div>
            <div className="absolute right-0 top-0 w-[68%] rotate-[6deg] overflow-hidden rounded-[2.4rem] border border-white/16 bg-white/10 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl">
              <img
                src={wallpapers[2].src}
                alt="Haiti World Cup 2026 wallpaper preview"
                className="aspect-[9/19.5] w-full rounded-[1.8rem] object-cover"
              />
            </div>
            <div className="absolute bottom-4 left-1/2 w-[62%] -translate-x-1/2 overflow-hidden rounded-[2.2rem] border border-white/12 bg-white/9 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
              <img
                src={wallpapers[0].src}
                alt="Free Haiti wallpaper preview"
                className="aspect-[9/19.5] w-full rounded-[1.6rem] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="previews" className="bg-[#f5f5f7] py-16 md:py-24">
        <div className="container">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F16953]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Wallpaper Previews
            </p>
            <h2
              className="mt-3 text-3xl font-bold text-[#1d1d1f] md:text-5xl"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Six lock-screen ready designs.
            </h2>
          </div>

          <div className="space-y-12">
            {[
              {
                title: "Official Editions",
                description: "Device-specific exports for the primary wallpaper.",
                items: officialWallpapers,
              },
              {
                title: "Alternate Editions",
                description: "Independent alternate artwork crops included in the pack.",
                items: alternateWallpapers,
              },
            ].map((section) => (
              <div key={section.title}>
                <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3
                      className="text-xl font-bold text-[#1d1d1f]"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {section.title}
                    </h3>
                    <p
                      className="mt-1 text-sm text-[#5F7C84]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {section.items.map((wallpaper) => (
                    <article
                      key={wallpaper.src}
                      className="overflow-hidden rounded-[1.5rem] border border-black/5 bg-white p-2 shadow-sm shadow-[#495E79]/8"
                    >
                      <div className="relative">
                        <img
                          src={wallpaper.src}
                          alt={`${wallpaper.label} Mondial 2026 wallpaper`}
                          className="aspect-[9/19.5] w-full rounded-[1.1rem] object-cover"
                          loading="lazy"
                        />
                        <span
                          className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {wallpaper.badge}
                        </span>
                      </div>
                      <div className="px-2 py-3">
                        <h4
                          className="text-sm font-semibold text-[#1d1d1f]"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {wallpaper.label}
                        </h4>
                        <p
                          className="mt-1 text-xs font-medium text-[#495E79]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {wallpaper.subtitle}
                        </p>
                        <p
                          className="mt-0.5 text-xs text-[#5F7C84]"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {wallpaper.size}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="unlock" className="bg-white py-16 md:py-24">
        <div className="container">
          <div className="mx-auto grid max-w-5xl grid-cols-1 overflow-hidden rounded-[2rem] border border-black/5 bg-[#f5f5f7] shadow-xl shadow-[#495E79]/10 md:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-[360px] bg-black">
              <img
                src={wallpapers[1].src}
                alt="Mondial 2026 wallpaper pack"
                className="absolute inset-0 h-full w-full object-cover opacity-82"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p
                  className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FECFA5]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Free Download
                </p>
                <p
                  className="mt-2 text-2xl font-bold text-white"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Haiti World Cup 2026 Wallpaper Pack
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F16953]/10 text-[#F16953]">
                {submitted ? <Check className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
              </div>

              <h2
                className="text-3xl font-bold leading-tight text-[#1d1d1f] md:text-4xl"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Enter your email to unlock the pack.
              </h2>
              <p
                className="mt-4 text-sm leading-7 text-[#5F7C84]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Get the full ZIP pack with all six wallpaper files. You will
                also join the Roobens Finds list for future free drops and
                practical updates.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-2xl border border-[#F16953]/20 bg-white p-5">
                  <p
                    className="text-sm font-semibold leading-6 text-[#495E79]"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Check your email to confirm and get your wallpaper pack.
                  </p>
                  <p
                    className="mt-2 text-xs leading-6 text-[#5F7C84]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    The download link will be sent through Buttondown after
                    confirmation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-3">
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="h-12 w-full rounded-full border border-black/10 bg-white px-5 text-sm text-[#495E79] outline-none transition-colors placeholder:text-[#5F7C84]/50 focus:border-[#F16953]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Your email address"
                    required
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "mondial-email-error" : undefined}
                    className="h-12 w-full rounded-full border border-black/10 bg-white px-5 text-sm text-[#495E79] outline-none transition-colors placeholder:text-[#5F7C84]/50 focus:border-[#F16953]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  {error ? (
                    <p
                      id="mondial-email-error"
                      className="px-2 text-sm font-medium text-[#d95840]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {error}
                    </p>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-full bg-black text-sm font-semibold text-white hover:bg-black/85 disabled:opacity-70"
                  >
                    {isSubmitting ? "Unlocking..." : "Unlock Free Download"}
                  </Button>
                </form>
              )}

              <p
                className="mt-4 text-center text-xs text-[#5F7C84]/70"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
