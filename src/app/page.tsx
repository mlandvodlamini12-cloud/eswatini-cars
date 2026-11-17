'use client'

import { useState } from 'react'
import { Phone, Sun, Zap, Shield, Wrench, CheckCircle, ArrowRight, MessageCircle, Clock, Award, TrendingDown } from 'lucide-react'

export default function NRSolarHome() {
  const [showContactForm, setShowContactForm] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/nr-solar-logo.jpg" alt="NR Solar Logo" className="h-12 w-12 rounded-lg object-cover" />
            <div>
              <h1 className="text-lg font-bold text-blue-900 leading-none">NR SOLAR</h1>
              <p className="text-xs text-orange-500 font-medium">Sales & Contractors</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#products" className="text-sm font-medium text-slate-700 hover:text-blue-600">Products</a>
            <a href="#features" className="text-sm font-medium text-slate-700 hover:text-blue-600">Why Us</a>
            <a href="#about" className="text-sm font-medium text-slate-700 hover:text-blue-600">About</a>
            <a href="#contact" className="text-sm font-medium text-slate-700 hover:text-blue-600">Contact</a>
          </nav>
          <a href="tel:78420821" className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors">
            <Phone className="h-4 w-4" />
            Call Now
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        {/* Decorative sun rays */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-orange-500 blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-orange-400 blur-3xl"></div>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-32 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-2">
            <Sun className="h-5 w-5 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">EST 2023 · Eswatini</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Hot Water <span className="text-orange-400">from the Sun</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Save energy, save money. Professional solar water heating solutions for your home and business in Eswatini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#products" className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-base font-bold text-white hover:bg-orange-600 transition-all hover:scale-105">
              View Products
              <ArrowRight className="h-5 w-5" />
            </a>
            <a href="https://wa.me/26878420821" target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-8 py-4 text-base font-bold text-white hover:bg-green-600 transition-all hover:scale-105">
              <MessageCircle className="h-5 w-5" />
              WhatsApp Us
            </a>
          </div>
          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">100%</div>
              <div className="text-xs text-blue-200 mt-1">Solar Powered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">E6,000</div>
              <div className="text-xs text-blue-200 mt-1">Starting From</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">2</div>
              <div className="text-xs text-blue-200 mt-1">Product Lines</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">Our Products</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Premium solar water heaters — invest once, save for years</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* CREST */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="relative h-64 bg-blue-50">
                <img src="/nr-solar-product.jpg" alt="CREST Solar Water Heater" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                  E7,500
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">CREST Solar Water Heater</h3>
                <p className="text-slate-600 mb-4">Low pressure system designed for family use — durable and affordable.</p>
                <ul className="space-y-2 mb-6">
                  {['Low pressure system', 'Built to last — durable construction', 'Works with municipal water supply', 'Perfect for family households', 'Significant electricity savings'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="tel:78420821" className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition-colors">
                  <Phone className="h-4 w-4" />
                  Order Now — E7,500
                </a>
              </div>
            </div>

            {/* HI-TECH */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="relative h-64 bg-blue-50">
                <img src="/nr-solar-product.jpg" alt="HI-TECH Solar Water Heater" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                  E6,000
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">HI-TECH Solar Water Heater</h3>
                <p className="text-slate-600 mb-4">High performance system — efficient, reliable, all-day hot water.</p>
                <ul className="space-y-2 mb-6">
                  {['High performance design', 'Highly efficient & reliable', 'Significant electricity savings', 'All-day hot water supply', 'Premium build quality'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="tel:79941231" className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition-colors">
                  <Phone className="h-4 w-4" />
                  Order Now — E6,000
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Why Choose Us */}
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">Why Choose NR Solar?</h2>
            <p className="text-slate-600">Solar powered, quality driven</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Low Pressure', desc: 'Works efficiently even in low-pressure areas' },
              { icon: Shield, title: 'Reliable & Durable', desc: 'Built to last for years of service' },
              { icon: TrendingDown, title: 'Energy Saving', desc: 'Cut your electricity bill significantly' },
              { icon: Wrench, title: 'Easy Maintenance', desc: 'Simple to maintain and service' },
            ].map((f, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <f.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-blue-900 mb-1">{f.title}</h3>
                <p className="text-xs text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Invest Once, Save for Years</h2>
          <p className="text-orange-100 mb-6">Stop paying for hot water — let the sun do the work</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:78420821" className="flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-orange-600 hover:bg-orange-50 transition-colors">
              <Phone className="h-5 w-5" /> 7842 0821
            </a>
            <a href="tel:79941231" className="flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-orange-600 hover:bg-orange-50 transition-colors">
              <Phone className="h-5 w-5" /> 7994 1231
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <img src="/nr-solar-logo.jpg" alt="NR Solar Logo" className="h-24 w-24 rounded-2xl mx-auto mb-6 object-cover shadow-lg" />
          <h2 className="text-3xl font-bold text-blue-900 mb-4">NR Solar Sales & Contractors</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6">
            Established in 2023, NR Solar is a leading solar water heating contractor in Eswatini.
            We supply and install premium solar water heaters that help families and businesses
            reduce their electricity costs while enjoying reliable hot water all day.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-slate-700">
              <Award className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">EST 2023</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Shield className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Professional Installation</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-6">Supplied by INSIKA GROUP</p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-blue-900">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Get Hot Water from the Sun</h2>
          <p className="text-blue-200 mb-8">Call us today or send a WhatsApp message to place your order</p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <a href="tel:78420821" className="flex items-center justify-center gap-3 rounded-2xl bg-white py-4 px-6 hover:bg-orange-50 transition-colors">
              <Phone className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <div className="text-xs text-slate-500">Call</div>
                <div className="font-bold text-blue-900">7842 0821</div>
              </div>
            </a>
            <a href="tel:79941231" className="flex items-center justify-center gap-3 rounded-2xl bg-white py-4 px-6 hover:bg-orange-50 transition-colors">
              <Phone className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <div className="text-xs text-slate-500">Call</div>
                <div className="font-bold text-blue-900">7994 1231</div>
              </div>
            </a>
          </div>
          <a href="https://wa.me/26878420821" target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-4 font-bold text-white hover:bg-green-600 transition-colors">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/nr-solar-logo.jpg" alt="NR Solar" className="h-10 w-10 rounded-lg" />
            <div className="text-left">
              <div className="font-bold text-white">NR SOLAR</div>
              <div className="text-xs text-orange-400">Sales & Contractors</div>
            </div>
          </div>
          <p className="text-sm text-blue-300 mb-2">Solar powered, quality driven</p>
          <p className="text-xs text-blue-400">© 2026 NR Solar Sales & Contractors · EST 2023 · Eswatini</p>
          <p className="text-xs text-blue-500 mt-2">Supplied by INSIKA GROUP</p>
        </div>
      </footer>
    </div>
  )
}
