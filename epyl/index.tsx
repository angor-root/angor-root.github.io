import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronRight, Facebook, Twitter, Instagram, YouTube, Calendar, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Component() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("home")

  const navItems = [
    { id: "home", label: "Inicio" },
    { id: "about", label: "Sobre Nosotros" },
    { id: "programs", label: "Programas" },
    { id: "events", label: "Eventos" },
    { id: "contribute", label: "Contribuir" },
    { id: "resources", label: "Recursos" },
    { id: "contact", label: "Contacto" },
  ]

  const handleNavClick = (id: string) => {
    setActiveTab(id)
    setIsMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100
      const sections = navItems.map(item => document.getElementById(item.id))

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(navItems[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link className="flex items-center space-x-2" href="/">
              <Image src="/placeholder.svg?height=32&width=32" alt="EPYL Logo" width={32} height={32} />
              <span className="font-bold text-xl text-gray-800">EPYL</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    activeTab === item.id ? "text-primary border-b-2 border-primary" : "text-gray-600"
                  }`}
                  onClick={() => handleNavClick(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col items-center space-y-4 p-4 bg-white border-b">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeTab === item.id ? "text-primary" : "text-gray-600"
                }`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
      <main className="flex-1">
        <section id="home" className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-gray-800">
                EPYL: Equipando Pastores y Líderes
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Fortaleciendo el liderazgo en la iglesia a través de capacitación y recursos de calidad.
              </p>
              <Carousel className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <CarouselContent>
                  {[1, 2, 3].map((_, index) => (
                    <CarouselItem key={index}>
                      <Image
                        src={`/placeholder.svg?height=400&width=600&text=EPYL+Imagen+${index + 1}`}
                        alt={`EPYL Imagen ${index + 1}`}
                        width={600}
                        height={400}
                        className="w-full rounded-md object-cover"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="#contribute">Contribuir Ahora</Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="#programs">Nuestros Programas</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-gray-800">Sobre Nosotros</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-600 mb-4">
                  EPYL es un ministerio dedicado a equipar y fortalecer a pastores y líderes de la iglesia. Nuestra misión
                  es proporcionar recursos, capacitación y apoyo para el crecimiento espiritual y el desarrollo de
                  habilidades de liderazgo en toda América Latina.
                </p>
                <p className="text-gray-600 mb-4">
                  Desde nuestra fundación, hemos trabajado incansablemente para llevar programas de capacitación
                  a diversas localidades, incluyendo Cusco, Puno y otras regiones necesitadas.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((_, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <Image
                      src={`/placeholder.svg?height=120&width=120&text=Miembro+${index + 1}`}
                      alt={`Miembro del equipo ${index + 1}`}
                      width={120}
                      height={120}
                      className="rounded-full"
                    />
                    <h3 className="font-semibold text-gray-800">Nombre Apellido</h3>
                    <p className="text-sm text-gray-600">Cargo</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="programs" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-gray-800">Nuestros Programas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Capacitación de Líderes", description: "Programa intensivo para desarrollar habilidades de liderazgo en la iglesia." },
                { title: "Estudios Bíblicos Avanzados", description: "Cursos profundos de teología y exégesis bíblica para pastores." },
                { title: "Mentoría Pastoral", description: "Acompañamiento personalizado para pastores jóvenes y experimentados." },
              ].map((program, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{program.title}</h3>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    <Button variant="outline" className="w-full">
                      Más Información
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="events" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-gray-800">Próximos Eventos</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Campamento para Jóvenes Líderes", date: "15-17 Agosto, 2023", location: "Cusco, Perú" },
                { title: "Conferencia de Liderazgo Pastoral", date: "5-7 Septiembre, 2023", location: "Lima, Perú" },
                { title: "Taller de Predicación Expositiva", date: "20 Octubre, 2023", location: "Online" },
                { title: "Retiro de Pastores", date: "10-12 Noviembre, 2023", location: "Arequipa, Perú" },
                { title: "Seminario de Consejería Bíblica", date: "1 Diciembre, 2023", location: "Online" },
                { title: "Conferencia de Misiones", date: "15-17 Enero, 2024", location: "Trujillo, Perú" },
              ].map((event, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <p className="text-sm font-medium text-gray-600">{event.date}</p>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{event.location}</p>
                    <Button variant="outline" className="w-full">
                      Inscribirse
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="contribute" className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center">
              <Heart className="h-16 w-16 mb-6" />
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Contribuye a Nuestra Misión</h2>
              <p className="max-w-[600px] mb-8 text-lg">
                Tu generosidad nos permite continuar equipando a pastores y líderes en toda América Latina. Cada donación marca la diferencia en la vida de aquellos que sirven a la iglesia.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Donar Ahora
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
                  Otras Formas de Ayudar
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="resources" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-gray-800">Recursos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Guía de Estudio Bíblico", type: "PDF", size: "2.5 MB" },
                { title: "Curso de Liderazgo Cristiano", type: "Video", duration: "2h 30min" },
                { title: "Plantillas para Sermones", type: "DOCX", size: "500 KB" },
                { title: "Podcast: Desafíos Pastorales", type: "Audio", duration: "45min" },
                { title: "Ebook: Fundamentos de la Fe", type: "EPUB", size: "1.2 MB" },
                { title: "Webinar: Evangelismo Moderno", type: "Video", duration: "1h 15min" },
              ].map((resource, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">{resource.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Tipo: {resource.type} | {resource.size || resource.duration}
                    </p>
                    <Button variant="outline" className="w-full">Descargar</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-gray-800">Contáctanos</h2>
            <div className="max-w-md mx-auto">
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" id="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <input type="email" id="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje</label>
                  <textarea id="message" rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"></textarea>
                </div>
                <Button type="submit" className="w-full">Enviar Mensaje</Button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-gray-800 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-sm">© 2023 EPYL. Todos los derechos reservados.</p>
            </div>
            <div className="flex space-x-4">
              <Link href="#" className="text-white hover:text-gray-300">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-white hover:text-gray-300">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-white hover:text-gray-300">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-white hover:text-gray-300">
                <YouTube className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}