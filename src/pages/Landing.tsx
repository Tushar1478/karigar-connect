import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Hammer,
  Scissors,
  Zap,
  Paintbrush,
  Droplets,
  MapPin,
  Search,
  Menu,
} from "lucide-react";

import carpenter from "@/assets/hero-carpenter.jpg";
import tailor from "@/assets/hero-tailor.jpg";
import potter from "@/assets/hero-potter.jpg";
import electrician from "@/assets/hero-electrician.jpg";

const services = [
  { icon: Hammer, label: "Carpenter" },
  { icon: Scissors, label: "Tailor" },
  { icon: Zap, label: "Electrician" },
  { icon: Paintbrush, label: "Painter" },
  { icon: Droplets, label: "Plumber" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDF8F2] text-[#2E2115]">

      {/* ---------------- NAVBAR ---------------- */}

      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FDF8F2]/80 border-b border-[#eadfd2]">

        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

          <div className="flex items-center gap-3">

            <img
              src="/icon.png"
              className="w-11 h-11"
            />

            <div>

              <h1 className="font-serif text-2xl font-semibold tracking-wide">
                KarigarHub
              </h1>

              <p className="text-xs text-stone-500">
                Real Hands. Real Skills.
              </p>

            </div>

          </div>

          <nav className="hidden lg:flex items-center gap-10 text-[15px]">

            <a className="hover:text-orange-600 transition">
              Discover
            </a>

            <a className="hover:text-orange-600 transition">
              Stories
            </a>

            <a className="hover:text-orange-600 transition">
              How it Works
            </a>

            <button
              onClick={() => navigate("/artisan")}
              className="px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              Become a Karigar
            </button>

            <button
              onClick={() => navigate("/login")}
              className="font-medium"
            >
              Sign In
            </button>

          </nav>

          <Menu className="lg:hidden" />

        </div>

      </header>

      {/* ---------------- HERO ---------------- */}

      <section className="max-w-7xl mx-auto px-8 py-20">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* LEFT */}

          <div>

            <p className="uppercase tracking-[8px] text-orange-600 font-semibold text-sm">

              HANDS THAT BUILD INDIA

            </p>

            <h1 className="font-serif text-[72px] leading-[82px] mt-6">

              Real hands.

              <br />

              Real skills.

              <br />

              <span className="text-orange-600">

                Real people.

              </span>

            </h1>

            <p className="mt-8 text-xl text-stone-600 leading-9 max-w-xl">

              Discover talented local artisans around you—
              carpenters, tailors, electricians, potters,
              painters and hundreds of skilled workers who
              deserve to be found.

            </p>

            <div className="mt-12 flex gap-5">

              <button
                className="px-7 py-4 rounded-full bg-[#2E2115] text-white flex items-center gap-2 hover:scale-105 transition"
              >
                Find a Karigar

                <ArrowRight size={18} />

              </button>

              <button
                className="px-7 py-4 rounded-full border border-stone-300 hover:bg-white transition"
              >
                Join as Artisan
              </button>

            </div>

            {/* Search */}

            <div className="mt-16 bg-white rounded-2xl shadow-xl border border-stone-200 p-4">

              <div className="flex items-center">

                <Search className="text-stone-400" />

                <input
                  placeholder="Search carpenter, tailor, electrician..."
                  className="flex-1 px-4 py-3 outline-none bg-transparent"
                />

                <button className="bg-orange-500 text-white px-6 py-3 rounded-xl">

                  Search

                </button>

              </div>

            </div>

            {/* Services */}

            <div className="flex gap-4 flex-wrap mt-10">

              {services.map((service) => {

                const Icon = service.icon;

                return (

                  <button
                    key={service.label}
                    className="flex items-center gap-3 bg-white border border-stone-200 rounded-full px-5 py-3 hover:-translate-y-1 hover:border-orange-500 transition"
                  >

                    <Icon size={18} />

                    {service.label}

                  </button>

                );

              })}

            </div>

          </div>

          {/* RIGHT */}

          <div className="relative h-[720px]">

            <img
              src={carpenter}
              className="absolute top-0 left-0 w-72 rounded-[40px] shadow-2xl"
            />

            <img
              src={tailor}
              className="absolute top-10 right-0 w-64 rounded-[40px] shadow-2xl"
            />

            <img
              src={potter}
              className="absolute bottom-0 left-12 w-72 rounded-[40px] shadow-2xl"
            />

            <img
              src={electrician}
              className="absolute bottom-16 right-10 w-60 rounded-[40px] shadow-2xl"
            />

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-8 w-72">              <div className="flex items-center gap-2 mb-4">

                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

                <p className="text-sm font-semibold">
                  12,400+ Verified Karigars
                </p>

              </div>

              <h3 className="font-serif text-3xl leading-tight">

                Every craft
                <br />
                has a story.

              </h3>

              <p className="mt-4 text-stone-500 leading-7">

                Discover local artisans trusted by your
                community—not anonymous service providers.

              </p>

              <button
                className="mt-8 w-full bg-[#2E2115] text-white py-3 rounded-xl hover:bg-black transition"
              >

                Explore Stories

              </button>

            </div>

          </div>

        </div>

      </section>



      {/* ================================================= */}

      {/* CHOOSE YOUR JOURNEY */}

      {/* ================================================= */}

      <section className="max-w-7xl mx-auto px-8 pb-28">

        <div className="text-center">

          <p className="uppercase tracking-[6px] text-orange-600 text-sm">

            START HERE

          </p>

          <h2 className="font-serif text-5xl mt-5">

            What brings you here today?

          </h2>

          <p className="text-stone-500 mt-6 max-w-2xl mx-auto leading-8">

            Whether you're looking for skilled hands or
            you're one of those skilled hands, KarigarHub
            has a place for you.

          </p>

        </div>



        <div className="grid lg:grid-cols-2 gap-10 mt-16">

          {/* CUSTOMER CARD */}

          <div
            onClick={() => navigate("/discover")}
            className="group cursor-pointer rounded-[36px] bg-white border border-stone-200 p-10 hover:-translate-y-3 hover:shadow-2xl transition-all duration-300"
          >

            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">

              <Search
                size={34}
                className="text-orange-600"
              />

            </div>

            <h3 className="font-serif text-4xl mt-10">

              I Need Skilled Help

            </h3>

            <p className="mt-6 text-stone-600 leading-8">

              Browse trusted local artisans,
              compare profiles,
              check reviews,
              and book services nearby.

            </p>

            <div className="mt-10 flex items-center gap-3 text-orange-600 font-semibold">

              Continue

              <ArrowRight
                className="group-hover:translate-x-2 transition"
              />

            </div>

          </div>



          {/* KARIGAR CARD */}

          <div
            onClick={() => navigate("/artisan/signup")}
            className="group cursor-pointer rounded-[36px] bg-[#2E2115] text-white p-10 hover:-translate-y-3 hover:shadow-2xl transition-all duration-300"
          >

            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">

              <Hammer
                size={34}
              />

            </div>

            <h3 className="font-serif text-4xl mt-10">

              I'm a Karigar

            </h3>

            <p className="mt-6 text-stone-300 leading-8">

              Create your digital workshop,
              showcase your craftsmanship,
              receive bookings,
              and grow your reputation.

            </p>

            <div className="mt-10 flex items-center gap-3 text-orange-400 font-semibold">

              Join Now

              <ArrowRight
                className="group-hover:translate-x-2 transition"
              />

            </div>

          </div>

        </div>



        {/* STATS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-24">

          <div>

            <h3 className="font-serif text-5xl">

              12K+

            </h3>

            <p className="text-stone-500 mt-2">

              Verified Karigars

            </p>

          </div>

          <div>

            <h3 className="font-serif text-5xl">

              35+

            </h3>

            <p className="text-stone-500 mt-2">

              Skilled Trades

            </p>

          </div>

          <div>

            <h3 className="font-serif text-5xl">

              4.9★

            </h3>

            <p className="text-stone-500 mt-2">

              Average Rating

            </p>

          </div>

          <div>

            <h3 className="font-serif text-5xl">

              50K+

            </h3>

            <p className="text-stone-500 mt-2">

              Jobs Completed

            </p>

          </div>

        </div>



        <div className="flex justify-center mt-20">

          <div className="animate-bounce">

            <div className="w-7 h-12 rounded-full border-2 border-stone-300 flex justify-center">

              <div className="w-1.5 h-3 bg-orange-500 rounded-full mt-2"></div>

            </div>

          </div>

        </div>

      </section>{/* ========================================================= */}

{/* EXPLORE BY SKILL */}

{/* ========================================================= */}

<section className="bg-[#F7F1EA] py-24">

  <div className="max-w-7xl mx-auto px-8">

    <div className="flex items-end justify-between mb-16">

      <div>

        <p className="uppercase tracking-[6px] text-orange-600 text-sm">
          DISCOVER
        </p>

        <h2 className="font-serif text-5xl mt-4">
          Explore by Skill
        </h2>

      </div>

      <button
        className="hidden lg:flex items-center gap-2 text-orange-600 font-semibold hover:gap-4 transition-all"
      >

        View All

        <ArrowRight size={18}/>

      </button>

    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">

      {services.map((service)=>{

        const Icon = service.icon;

        return(

          <button

            key={service.label}

            className="group"

          >

            <div className="w-28 h-28 rounded-full bg-white shadow-md border border-stone-200 flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300">

              <Icon

                size={34}

                className="group-hover:text-white"

              />

            </div>

            <p className="mt-5 font-medium">

              {service.label}

            </p>

          </button>

        )

      })}

    </div>

  </div>

</section>



{/* ========================================================= */}

{/* FEATURED ARTISANS */}

{/* ========================================================= */}

<section className="max-w-7xl mx-auto px-8 py-28">

<div className="flex justify-between items-center mb-16">

<div>

<p className="uppercase tracking-[6px] text-orange-600 text-sm">

FEATURED

</p>

<h2 className="font-serif text-5xl mt-4">

Meet Local Masters

</h2>

</div>

<button className="flex items-center gap-2 text-orange-600">

View All

<ArrowRight/>

</button>

</div>

<div className="space-y-10">



{/* CARD 1 */}

<div className="grid lg:grid-cols-[320px_1fr] bg-white rounded-[40px] overflow-hidden shadow-xl">

<img

src={carpenter}

className="h-full object-cover"

/>

<div className="p-10">

<div className="flex justify-between">

<div>

<h3 className="font-serif text-4xl">

Ramesh Suthar

</h3>

<p className="text-stone-500 mt-2">

Master Carpenter • 18 Years

</p>

</div>

<div className="text-right">

<p className="text-3xl">

⭐ 4.9

</p>

<p className="text-stone-500">

426 Reviews

</p>

</div>

</div>

<div className="flex gap-3 mt-8">

<span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full">

Furniture

</span>

<span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full">

Interior

</span>

<span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full">

Repair

</span>

</div>

<p className="mt-8 leading-8 text-stone-600">

"I've been crafting furniture since I was
16, learning every technique from my father.
Each piece I build is made to last for generations."

</p>

<div className="flex gap-5 mt-10">

<button className="bg-[#2E2115] text-white px-6 py-3 rounded-xl">

View Profile

</button>

<button className="border border-stone-300 px-6 py-3 rounded-xl">

Book Service

</button>

</div>

</div>

</div>



{/* CARD 2 */}

<div className="grid lg:grid-cols-[320px_1fr] bg-white rounded-[40px] overflow-hidden shadow-xl">

<img

src={tailor}

className="h-full object-cover"

/>

<div className="p-10">

<div className="flex justify-between">

<div>

<h3 className="font-serif text-4xl">

Shabana Bano

</h3>

<p className="text-stone-500 mt-2">

Tailor • 14 Years

</p>

</div>

<div>

<p className="text-3xl">

⭐4.8

</p>

<p className="text-stone-500">

312 Reviews

</p>

</div>

</div>

<div className="flex gap-3 mt-8">

<span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">

Bridal

</span>

<span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">

Alterations

</span>

<span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">

Designer Wear

</span>

</div>

<p className="mt-8 leading-8 text-stone-600">

Every stitch tells someone's story.
I have stitched over 500 bridal dresses
across Rajasthan.

</p>

<div className="flex gap-5 mt-10">

<button className="bg-[#2E2115] text-white px-6 py-3 rounded-xl">

View Profile

</button>

<button className="border border-stone-300 px-6 py-3 rounded-xl">

Book Service

</button>

</div>

</div>

</div>

</div>

</section>



{/* ========================================================= */}

{/* CRAFT STORIES */}

{/* ========================================================= */}

<section className="bg-[#2E2115] text-white py-28">

<div className="max-w-7xl mx-auto px-8">

<p className="uppercase tracking-[6px] text-orange-400">

STORIES

</p>

<h2 className="font-serif text-5xl mt-5">

Behind Every Craft

</h2>

<div className="grid lg:grid-cols-3 gap-10 mt-20">

<div className="bg-white/5 rounded-[36px] p-8 backdrop-blur">

<h3 className="font-serif text-3xl">

A Father's Workshop

</h3>

<p className="mt-6 text-stone-300 leading-8">

Ramesh inherited a tiny workshop from his
father. Today he mentors five young carpenters.

</p>

<button className="mt-8 text-orange-400 flex gap-2 items-center">

Read Story

<ArrowRight size={18}/>

</button>

</div>

<div className="bg-white/5 rounded-[36px] p-8">

<h3 className="font-serif text-3xl">

Clay Into Art

</h3>

<p className="mt-6 text-stone-300 leading-8">

Pooja transforms ordinary clay into pottery
inspired by Rajasthan's traditional designs.

</p>

<button className="mt-8 text-orange-400 flex gap-2">

Read Story

<ArrowRight size={18}/>

</button>

</div>

<div className="bg-white/5 rounded-[36px] p-8">

<h3 className="font-serif text-3xl">

Threads of Tradition

</h3>

<p className="mt-6 text-stone-300 leading-8">

Shabana combines modern fashion with
generations of handcrafted embroidery.

</p>

<button className="mt-8 text-orange-400 flex gap-2">

Read Story

<ArrowRight size={18}/>

</button>

</div>

</div>

</div>

</section>{/* ====================================================== */}

{/* TRUST */}

{/* ====================================================== */}

<section className="bg-[#FDF8F2] py-28">

<div className="max-w-7xl mx-auto px-8">

<div className="text-center">

<p className="uppercase tracking-[6px] text-orange-600">

WHY KARIGARHUB

</p>

<h2 className="font-serif text-5xl mt-4">

Built on Trust

</h2>

<p className="text-stone-500 mt-6 max-w-3xl mx-auto leading-8">

Every artisan on KarigarHub is verified,
reviewed and connected to their local community.

</p>

</div>

<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">

<div className="bg-white rounded-[30px] p-10 shadow-lg">

<div className="text-5xl">

🛡️

</div>

<h3 className="font-serif text-2xl mt-8">

Verified Identity

</h3>

<p className="mt-5 text-stone-600 leading-8">

Government ID verification
ensures every artisan is authentic.

</p>

</div>

<div className="bg-white rounded-[30px] p-10 shadow-lg">

<div className="text-5xl">

⭐

</div>

<h3 className="font-serif text-2xl mt-8">

Real Reviews

</h3>

<p className="mt-5 text-stone-600 leading-8">

Only customers who booked
can leave reviews.

</p>

</div>

<div className="bg-white rounded-[30px] p-10 shadow-lg">

<div className="text-5xl">

📍

</div>

<h3 className="font-serif text-2xl mt-8">

Local First

</h3>

<p className="mt-5 text-stone-600 leading-8">

Support skilled workers
within your own community.

</p>

</div>

<div className="bg-white rounded-[30px] p-10 shadow-lg">

<div className="text-5xl">

🔒

</div>

<h3 className="font-serif text-2xl mt-8">

Secure Payments

</h3>

<p className="mt-5 text-stone-600 leading-8">

Protected bookings,
secure payments,
peace of mind.

</p>

</div>

</div>

</div>

</section>



{/* ====================================================== */}

{/* TESTIMONIALS */}

{/* ====================================================== */}

<section className="py-28 bg-[#F7F1EA]">

<div className="max-w-7xl mx-auto px-8">

<div className="text-center">

<p className="uppercase tracking-[6px] text-orange-600">

COMMUNITY

</p>

<h2 className="font-serif text-5xl mt-4">

Loved Across India

</h2>

</div>

<div className="grid lg:grid-cols-3 gap-10 mt-20">

<div className="bg-white rounded-[36px] p-10">

<p className="text-4xl">

⭐⭐⭐⭐⭐

</p>

<p className="mt-8 leading-8">

Finding a trusted carpenter
used to take weeks.

KarigarHub found one in
less than a day.

</p>

<div className="mt-8">

<h4 className="font-semibold">

Priya Sharma

</h4>

<p className="text-stone-500">

Jaipur

</p>

</div>

</div>

<div className="bg-white rounded-[36px] p-10">

<p className="text-4xl">

⭐⭐⭐⭐⭐

</p>

<p className="mt-8 leading-8">

I joined as a tailor.

Now I receive customers
without paying middlemen.

</p>

<div className="mt-8">

<h4 className="font-semibold">

Shabana

</h4>

<p className="text-stone-500">

Artisan

</p>

</div>

</div>

<div className="bg-white rounded-[36px] p-10">

<p className="text-4xl">

⭐⭐⭐⭐⭐

</p>

<p className="mt-8 leading-8">

Everything feels genuine.

It isn't another listing website.

It feels human.

</p>

<div className="mt-8">

<h4 className="font-semibold">

Rahul Mehta

</h4>

<p className="text-stone-500">

Customer

</p>

</div>

</div>

</div>

</div>

</section>



{/* ====================================================== */}

{/* CTA */}

{/* ====================================================== */}

<section className="bg-[#2E2115] py-32 text-center text-white">

<div className="max-w-5xl mx-auto px-8">

<p className="uppercase tracking-[8px] text-orange-400">

JOIN TODAY

</p>

<h2 className="font-serif text-6xl leading-tight mt-8">

Your Skill

deserves to

be discovered.

</h2>

<p className="mt-10 text-stone-300 text-xl leading-9">

Whether you shape wood,

repair homes,

paint walls,

or stitch dreams—

your craftsmanship deserves recognition.

</p>

<div className="flex justify-center gap-6 mt-14">

<button

className="bg-orange-500 px-8 py-4 rounded-full hover:bg-orange-600 transition"

>

Become a Karigar

</button>

<button

className="border border-white/30 px-8 py-4 rounded-full"

>

Discover Artisans

</button>

</div>

</div>

</section>



{/* ====================================================== */}

{/* FOOTER */}

{/* ====================================================== */}

<footer className="bg-[#24170F] text-stone-300">

<div className="max-w-7xl mx-auto px-8 py-20">

<div className="grid lg:grid-cols-4 gap-12">

<div>

<h2 className="font-serif text-4xl text-white">

KarigarHub

</h2>

<p className="mt-6 leading-8">

Connecting skilled hands
with people who value craftsmanship.

</p>

</div>

<div>

<h4 className="font-semibold text-white mb-6">

Platform

</h4>

<ul className="space-y-4">

<li>Discover</li>

<li>Stories</li>

<li>Book Service</li>

<li>Become a Karigar</li>

</ul>

</div>

<div>

<h4 className="font-semibold text-white mb-6">

Company

</h4>

<ul className="space-y-4">

<li>About</li>

<li>Contact</li>

<li>Privacy</li>

<li>Terms</li>

</ul>

</div>

<div>

<h4 className="font-semibold text-white mb-6">

Follow Us

</h4>

<ul className="space-y-4">

<li>Instagram</li>

<li>Facebook</li>

<li>LinkedIn</li>

<li>Twitter</li>

</ul>

</div>

</div>

<div className="border-t border-white/10 mt-16 pt-8 flex justify-between text-sm">

<p>

© 2026 KarigarHub

</p>

<p>

Made with ❤️ for India's Craftspeople

</p>

</div>

</div>

</footer>

</div>

);

}
